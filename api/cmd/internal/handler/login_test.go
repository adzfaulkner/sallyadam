package handler

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/adzfaulkner/sallyadam/internal/cookie"
	"github.com/adzfaulkner/sallyadam/internal/password"
	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
)

type tokenHandlerMock struct {
	returnError bool
}

func (th *tokenHandlerMock) CreateToken(userID string) (string, error) {
	if th.returnError {
		return "", fmt.Errorf("token handler error")
	}

	return "token for user uuid issues", nil
}

func (th *tokenHandlerMock) VerifyToken(token string) (string, error) {
	return "", fmt.Errorf("should not be called. token: %s", token)
}

func Test_LoginHandler(t *testing.T) {
	t.Parallel()

	var nilHeader ResponseHeaders

	cookieHandler := cookie.NewHandler("test", false)

	guestpwd := password.GeneratePassword([]byte("Testing1234"))
	pwdChecker := password.Compare(guestpwd)

	testCases := []struct {
		name          string
		reqBody       string
		tokenHandler  *tokenHandlerMock
		cookieHandler *cookie.Handler
		expBody       ResponseBody
		expStatus     ResponseStatus
		expHeaders    ResponseHeaders
		expLogLine    string
	}{
		{
			name:          "Invalid body",
			reqBody:       "",
			tokenHandler:  &tokenHandlerMock{returnError: false},
			cookieHandler: cookieHandler,
			expBody:       ResponseBody("{\"message\":\"Malformed request\"}"),
			expStatus:     ResponseStatus(http.StatusBadRequest),
			expHeaders:    nilHeader,
			expLogLine:    "info unexpected req body received [{error 26 0  unexpected end of JSON input} {req body 15 0  <nil>}]",
		},
		{
			name:          "User not found",
			reqBody:       fmt.Sprintf("{%q:%q}", "username", "notfound"),
			tokenHandler:  &tokenHandlerMock{returnError: false},
			cookieHandler: cookieHandler,
			expBody:       ResponseBody("{\"message\":\"Invalid credentials. Please try again.\"}"),
			expStatus:     ResponseStatus(http.StatusNotFound),
			expHeaders:    nilHeader,
			expLogLine:    "",
		},
		{
			name:          "Create token returns error",
			reqBody:       fmt.Sprintf("{%q:%q}", "password", "Testing1234"),
			tokenHandler:  &tokenHandlerMock{returnError: true},
			cookieHandler: cookieHandler,
			expBody:       ResponseBody("{\"message\":\"Contact support\"}"),
			expStatus:     ResponseStatus(http.StatusInternalServerError),
			expHeaders:    nilHeader,
			expLogLine:    "error could not create token [{error 26 0  token handler error}]",
		},
		{
			name:          "Login successful",
			reqBody:       fmt.Sprintf("{%q:%q}", "password", "Testing1234"),
			tokenHandler:  &tokenHandlerMock{returnError: false},
			cookieHandler: cookieHandler,
			expBody:       ResponseBody("{\"success\":true}"),
			expStatus:     ResponseStatus(http.StatusCreated),
			expHeaders: ResponseHeaders{
				"Set-Cookie": "token=\"token for user uuid issues\"; Domain=test; HttpOnly; SameSite=None",
			},
			expLogLine: "",
		},
	}

	for _, tc := range testCases {
		tcase := tc // rebind tc into this lexical scope
		t.Run(tcase.name, func(t *testing.T) {
			t.Parallel()

			req := events.APIGatewayProxyRequest{
				Body: tcase.reqBody,
			}

			logger := &logger{
				line: "",
			}

			body, status, headers := loginHandler(&req, tcase.tokenHandler, cookieHandler, logger, pwdChecker)

			assert.Equal(t, tcase.expBody, body)
			assert.Equal(t, tcase.expStatus, status)
			assert.Equal(t, tcase.expHeaders, headers)
			assert.Equal(t, tcase.expLogLine, logger.line)
		})
	}
}
