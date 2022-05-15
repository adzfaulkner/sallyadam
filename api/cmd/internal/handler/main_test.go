package handler

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/adzfaulkner/sallyadam/internal/cookie"
	"github.com/adzfaulkner/sallyadam/internal/payment"
	"github.com/adzfaulkner/sallyadam/internal/registry"
	"github.com/adzfaulkner/sallyadam/internal/user"
	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

type tokHandlerMock struct {
	returnError bool
}

func (th *tokHandlerMock) CreateToken(userID string) (string, error) {
	return "", fmt.Errorf("create token should not be called")
}

func (th *tokHandlerMock) VerifyToken(token string) (string, error) {
	if th.returnError {
		return "", fmt.Errorf("unverified")
	}

	return token, nil
}

type logger struct {
	line string
}

func (l *logger) Info(msg string, fields ...zap.Field) {
	l.line = fmt.Sprintf("%s %s %v", "info", msg, fields)
}

func (l *logger) Error(msg string, fields ...zap.Field) {
	l.line = fmt.Sprintf("%s %s %v", "error", msg, fields)
}

func Test_MainHandler(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name       string
		setup      func() (*events.APIGatewayProxyRequest, *tokHandlerMock)
		expBody    string
		expStatus  int
		expLogLine string
	}{
		{
			name: "Unrecognised route",
			setup: func() (*events.APIGatewayProxyRequest, *tokHandlerMock) {
				req := events.APIGatewayProxyRequest{
					Path: "/irrelevant",
				}

				return &req, nil
			},
			expBody:    "{\"message\":\"Not found\"}",
			expStatus:  http.StatusNotFound,
			expLogLine: "info Unexpected route path [{route 15 0 /irrelevant <nil>}]",
		},
		{
			name: "Login path",
			setup: func() (*events.APIGatewayProxyRequest, *tokHandlerMock) {
				req := events.APIGatewayProxyRequest{
					Path: "/login",
				}

				return &req, nil
			},
			expBody:    "{\"message\":\"Malformed request\"}",
			expStatus:  http.StatusBadRequest,
			expLogLine: "info unexpected req body received [{error 26 0  unexpected end of JSON input} {req body 15 0  <nil>}]",
		},
		{
			name: "Unverified user",
			setup: func() (*events.APIGatewayProxyRequest, *tokHandlerMock) {
				req := events.APIGatewayProxyRequest{
					Path: "/verify",
				}

				tokHandler := tokHandlerMock{returnError: true}

				return &req, &tokHandler
			},
			expBody:    "{\"message\":\"Unauthorized\"}",
			expStatus:  http.StatusForbidden,
			expLogLine: "info verify token error [{error 26 0  unverified}]",
		},
		{
			name: "Verify endpoint",
			setup: func() (*events.APIGatewayProxyRequest, *tokHandlerMock) {
				req := events.APIGatewayProxyRequest{
					Path: "/verify",
					Headers: map[string]string{
						"Cookie": "token=test",
					},
				}

				tokHandler := tokHandlerMock{returnError: false}

				return &req, &tokHandler
			},
			expBody:    "{\"message\":\"OK\"}",
			expStatus:  http.StatusOK,
			expLogLine: "",
		},
		{
			name: "Checkout endpoint",
			setup: func() (*events.APIGatewayProxyRequest, *tokHandlerMock) {
				req := events.APIGatewayProxyRequest{
					Path: "/checkout",
					Headers: map[string]string{
						"Cookie": "token=test",
					},
				}

				tokHandler := tokHandlerMock{returnError: false}

				return &req, &tokHandler
			},
			expBody:    "{\"message\":\"Invalid request\"}",
			expStatus:  http.StatusBadRequest,
			expLogLine: "info req body unmarshal err [{req body 15 0  <nil>} {error 26 0  unexpected end of JSON input}]",
		},
	}

	for _, tc := range testCases {
		tcase := tc // rebind tc into this lexical scope
		t.Run(tcase.name, func(t *testing.T) {
			t.Parallel()

			req, tokenHandler := tcase.setup()

			usrRepo := user.Repository{}
			regRepo := registry.Repository{}
			paymentHandler := payment.Handler{}
			cookieHandler := cookie.Handler{}
			logHandler := logger{
				line: "",
			}

			res, err := Handler(&usrRepo, &regRepo, tokenHandler, &paymentHandler, &cookieHandler, &logHandler, GenerateResponse("http://localhost"))(*req)

			assert.Nil(t, err)
			assert.Equal(t, tcase.expLogLine, logHandler.line)
			assert.Equal(t, events.APIGatewayProxyResponse{
				Body:       tcase.expBody,
				StatusCode: tcase.expStatus,
				Headers: map[string]string{
					"Content-Type":                     "application/json",
					"Access-Control-Allow-Origin":      "http://localhost",
					"Access-Control-Allow-Credentials": "true",
				},
			}, res)
		})
	}
}

func Test_GetCookieVal(t *testing.T) {
	t.Parallel()

	res := getCookieVal(map[string]string{})
	assert.Equal(t, "", res)

	res = getCookieVal(map[string]string{
		"Cookie": "a=1;",
	})
	assert.Equal(t, "a=1;", res)

	res = getCookieVal(map[string]string{
		"cookie": "a=1;",
	})
	assert.Equal(t, "a=1;", res)
}
