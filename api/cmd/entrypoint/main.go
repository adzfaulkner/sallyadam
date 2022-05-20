package main

import (
	"encoding/base64"
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
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ssm"
)

func main() {
	endpoint := os.Getenv("AWS_ENDPOINT")
	region := os.Getenv("AWS_REGION")
	jwtExpireMins := os.Getenv("JWT_EXPIRE_MINS")
	stripeKey := os.Getenv("STRIPE_KEY")
	successURL := os.Getenv("SUCCESS_URL")
	cancelURL := os.Getenv("CANCEL_URL")
	regJSON := os.Getenv("REGISTRY_DATA")
	cookieDomain := os.Getenv("COOKIE_DOMAIN")
	cookieSecure := os.Getenv("COOKIE_SECURE")
	corsAllowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")

	awsCfg := aws.Config{Region: aws.String(region)}

	if endpoint != "" {
		awsCfg.Endpoint = aws.String(endpoint)
	}

	sess, err := session.NewSessionWithOptions(session.Options{
		Config:            awsCfg,
		SharedConfigState: session.SharedConfigEnable,
	})

	if err != nil {
		panic(err.Error())
	}

	ssmsvc := ssm.New(sess, aws.NewConfig().WithRegion(region))
	secret := getSmmParamVal(ssmsvc, "/SallyAdam/JWT_SECRET")
	guestPassword := getSmmParamVal(ssmsvc, "/SallyAdam/GUEST_PASSWORD")

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

	passwordCheck := password.Compare([]byte(guestPassword))

	logHandler := createLogHandler()

	defer syncLog(logHandler)

	lambda.Start(handler.Handler(passwordCheck, regRepo, tokenHandler, paymentHandler, cookieHandler, logHandler, handler.GenerateResponse(corsAllowedOrigin)))
}

func createLogHandler() *logger.Handler {
	zapLog, err := logger.NewZapLogger()

	if err != nil {
		panic(err.Error())
	}

	logHandler := logger.NewHandler(zapLog)

	return logHandler
}

func syncLog(logHandler *logger.Handler) {
	if err := logHandler.Sync(); err != nil {
		panic(err.Error())
	}
}

func getSmmParamVal(ssmsvc *ssm.SSM, key string) string {
	param, err := ssmsvc.GetParameter(&ssm.GetParameterInput{
		Name:           aws.String(key),
		WithDecryption: aws.Bool(true),
	})

	if err != nil {
		panic(err.Error())
	}

	return *param.Parameter.Value
}
