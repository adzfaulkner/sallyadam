package handler

import (
	"net/http"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
)

func Test_GenerateGenericResponse(t *testing.T) {
	t.Parallel()

	res := generateGenericResponse("Testing 123")

	assert.Equal(t, ResponseBody("{\"message\":\"Testing 123\"}"), res)
}

func Test_GenerateResponse(t *testing.T) {
	t.Parallel()

	headers := map[string]string{
		"SetCookie": "key=val",
	}

	res := GenerateResponse("http://localhost:8081")("Testing Testing", http.StatusOK, headers)

	exp := &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                     "application/json",
			"SetCookie":                        "key=val",
			"Access-Control-Allow-Origin":      "http://localhost:8081",
			"Access-Control-Allow-Credentials": "true",
		},
		MultiValueHeaders: nil,
		Body:              "Testing Testing",
		IsBase64Encoded:   false,
	}

	assert.Equal(t, exp, res)
}
