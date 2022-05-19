package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/adzfaulkner/sallyadam/cmd/internal/handler"
	"github.com/adzfaulkner/sallyadam/internal/cookie"
	"github.com/adzfaulkner/sallyadam/internal/logger"
	"github.com/adzfaulkner/sallyadam/internal/password"
	"github.com/adzfaulkner/sallyadam/internal/payment"
	"github.com/adzfaulkner/sallyadam/internal/registry"
	"github.com/adzfaulkner/sallyadam/internal/token"
	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	secret := os.Getenv("JWT_SECRET")
	jwtExpireMins := os.Getenv("JWT_EXPIRE_MINS")
	stripeKey := os.Getenv("STRIPE_KEY")
	successURL := os.Getenv("SUCCESS_URL")
	cancelURL := os.Getenv("CANCEL_URL")
	regJSON := os.Getenv("REGISTRY_DATA")
	cookieDomain := os.Getenv("COOKIE_DOMAIN")
	cookieSecure := os.Getenv("COOKIE_SECURE")
	corsAllowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	guestPassword := os.Getenv("GUEST_PASSWORD")

	regData, err := base64.StdEncoding.DecodeString(regJSON)
	if err != nil {
		panic(err.Error())
	}

	expire, err := strconv.Atoi(jwtExpireMins)
	if err != nil {
		panic(err.Error())
	}

	regRepo, err := registry.NewRepository(regData)

	if err != nil {
		panic(err.Error())
	}

	tokenHandler := token.NewHandler(secret, expire, time.Now())

	paymentHandler := payment.NewHandler(payment.CreateStripePaymentSession(), stripeKey, successURL, cancelURL)

	cookieHandler := cookie.NewHandler(cookieDomain, cookieSecure == "true")

	logHandler, err := createLogHandler()

	passwordCheck := password.Compare([]byte(guestPassword))

	if err != nil {
		panic(err.Error())
	}

	defer syncLog(logHandler)

	lambda.Start(handler.Handler(passwordCheck, regRepo, tokenHandler, paymentHandler, cookieHandler, logHandler, handler.GenerateResponse(corsAllowedOrigin)))
}

func createLogHandler() (*logger.Handler, error) {
	zapLog, err := logger.NewZapLogger()

	if err != nil {
		return nil, fmt.Errorf("zap log returned error: %w", err)
	}

	logHandler := logger.NewHandler(zapLog)

	return logHandler, nil
}

func syncLog(logHandler *logger.Handler) {
	if err := logHandler.Sync(); err != nil {
		panic(err.Error())
	}
}
