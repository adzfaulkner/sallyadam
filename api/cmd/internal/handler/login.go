package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/adzfaulkner/sallyadam/internal/cookie"
	"github.com/adzfaulkner/sallyadam/internal/password"
	"github.com/aws/aws-lambda-go/events"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type BodyRequest struct {
	Password string `json:"password"`
}

type BodyResponse struct {
	Success bool `json:"success"`
}

func loginHandler(request *events.APIGatewayProxyRequest, tokenHandler tokenHandler, cookieHandler *cookie.Handler, logHandler logHandler, pwdChk password.Check) (ResponseBody, ResponseStatus, ResponseHeaders) {
	bodyRequest := BodyRequest{
		Password: "",
	}

	err := json.Unmarshal([]byte(request.Body), &bodyRequest)
	if err != nil {
		logHandler.Info("unexpected req body received", zap.Error(err), zap.String("req body", request.Body))

		return generateGenericResponse("Malformed request"), http.StatusBadRequest, nil
	}

	validPwd := pwdChk([]byte(bodyRequest.Password))
	if !validPwd {
		return generateGenericResponse("Invalid credentials. Please try again."), http.StatusNotFound, nil
	}

	tok, err := tokenHandler.CreateToken(uuid.New().String())
	if err != nil {
		logHandler.Error("could not create token", zap.Error(err))

		return generateGenericResponse("Contact support"), http.StatusInternalServerError, nil
	}

	bodyResponse := BodyResponse{
		Success: true,
	}

	// Marshal the response into json bytes, if error return 404
	response, err := json.Marshal(&bodyResponse)
	if err != nil {
		logHandler.Error("could not create resp body", zap.Error(err))

		return generateGenericResponse("Contact support"), http.StatusInternalServerError, nil
	}

	ckie := cookieHandler.CreateCookie("token", tok, &time.Time{})

	headers := map[string]string{
		"Set-Cookie": ckie.String(),
	}

	return ResponseBody(response), http.StatusCreated, headers
}
