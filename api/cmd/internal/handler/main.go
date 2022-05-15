package handler

import (
	"fmt"
	"net/http"

	"github.com/adzfaulkner/sallyadam/internal/cookie"
	"github.com/adzfaulkner/sallyadam/internal/payment"
	"github.com/adzfaulkner/sallyadam/internal/registry"
	"github.com/adzfaulkner/sallyadam/internal/user"
	"github.com/aws/aws-lambda-go/events"
	"go.uber.org/zap"
)

const LoginPath = "/login"
const VerifyPath = "/verify"
const CheckoutPath = "/checkout"

type BodyErrorResponse struct {
	Message string `json:"message"`
}

type tokenHandler interface {
	CreateToken(userID string) (string, error)
	VerifyToken(token string) (string, error)
}

type logHandler interface {
	Info(msg string, fields ...zap.Field)
	Error(msg string, fields ...zap.Field)
}

func Handler(usrRepo *user.Repository, regRepo *registry.Repository, tokenHandler tokenHandler, paymentHandler *payment.Handler, cookieHandler *cookie.Handler, logger logHandler, corsResponse CorsResponse) func(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return func(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		if request.Path != LoginPath && request.Path != VerifyPath && request.Path != CheckoutPath {
			logger.Info("Unexpected route path", zap.String("route", request.Path))

			return *corsResponse(generateGenericResponse("Not found"), http.StatusNotFound, nil), nil
		}

		if request.Path == LoginPath {
			body, sc, headers := loginHandler(&request, tokenHandler, usrRepo, cookieHandler, logger)

			return *corsResponse(body, sc, headers), nil
		}

		tok := fmt.Sprintf("Bearer %s", cookieHandler.GetCookieValueFromString(getCookieVal(request.Headers), "token"))

		userID, err := tokenHandler.VerifyToken(tok)

		if err != nil {
			logger.Info("verify token error", zap.Error(err))

			return *corsResponse(generateGenericResponse("Unauthorized"), http.StatusForbidden, nil), nil
		}

		if request.Path == VerifyPath {
			return *corsResponse(generateGenericResponse("OK"), http.StatusOK, nil), nil
		}

		if request.Path == CheckoutPath {
			_, usr := usrRepo.FindByID(userID)
			body, sc := checkoutHandler(&request, paymentHandler, &usr, regRepo, logger)

			return *corsResponse(body, sc, nil), nil
		}

		logger.Error("could not process request", zap.String("req path", request.Path))

		return *corsResponse(generateGenericResponse("Contact support"), http.StatusInternalServerError, nil), nil
	}
}

func getCookieVal(headers map[string]string) string {
	cookieVal := headers["cookie"]

	if cookieVal == "" {
		cookieVal = headers["Cookie"]
	}

	return cookieVal
}
