package handler

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

type ResponseBody string
type ResponseStatus int
type ResponseHeaders map[string]string

func generateGenericResponse(msg string) ResponseBody {
	ber := BodyErrorResponse{
		Message: msg,
	}

	response, _ := json.Marshal(&ber)

	return ResponseBody(response)
}

type CorsResponse func(body ResponseBody, status ResponseStatus, headers ResponseHeaders) *events.APIGatewayProxyResponse

func GenerateResponse(allowOrigin string) CorsResponse {
	return func(body ResponseBody, status ResponseStatus, headers ResponseHeaders) *events.APIGatewayProxyResponse {
		if headers == nil {
			headers = map[string]string{}
		}

		headers["Content-Type"] = "application/json"
		headers["Access-Control-Allow-Origin"] = allowOrigin
		headers["Access-Control-Allow-Credentials"] = "true"

		return &events.APIGatewayProxyResponse{
			Body:       string(body),
			StatusCode: int(status),
			Headers:    headers,
		}
	}
}
