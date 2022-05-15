package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/adzfaulkner/sallyadam/internal/cookie"
	"github.com/adzfaulkner/sallyadam/internal/password"
	"github.com/adzfaulkner/sallyadam/internal/user"
	"github.com/aws/aws-lambda-go/events"
	"go.uber.org/zap"
)

type BodyRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserResponse struct {
	Firstname string `json:"firstname"`
	Surname   string `json:"surname"`
}

type BodyResponse struct {
	User UserResponse `json:"user"`
}

type userRepo interface {
	FindByUsername(username string) (*user.ID, *user.User)
}

func loginHandler(request *events.APIGatewayProxyRequest, tokenHandler tokenHandler, usrRepo userRepo, cookieHandler *cookie.Handler, logHandler logHandler) (ResponseBody, ResponseStatus, ResponseHeaders) {
	bodyRequest := BodyRequest{
		Username: "",
		Password: "",
	}

	err := json.Unmarshal([]byte(request.Body), &bodyRequest)
	if err != nil {
		logHandler.Info("unexpected req body received", zap.Error(err), zap.String("req body", request.Body))

		return generateGenericResponse("Malformed request"), http.StatusBadRequest, nil
	}

	userID, usr := usrRepo.FindByUsername(bodyRequest.Username)
	if userID == nil {
		return generateGenericResponse("Invalid credentials. Please try again."), http.StatusNotFound, nil
	}

	validPwd := password.CheckPassword([]byte(bodyRequest.Password), []byte(usr.Password))
	if !validPwd {
		return generateGenericResponse("Invalid credentials. Please try again."), http.StatusNotFound, nil
	}

	tok, err := tokenHandler.CreateToken(string(*userID))
	if err != nil {
		logHandler.Error("could not create token", zap.Error(err))

		return generateGenericResponse("Contact support"), http.StatusInternalServerError, nil
	}

	userResponse := UserResponse{
		Firstname: usr.Firstname,
		Surname:   usr.Surname,
	}

	bodyResponse := BodyResponse{
		User: userResponse,
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
