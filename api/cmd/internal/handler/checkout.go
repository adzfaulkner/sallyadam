package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/adzfaulkner/sallyadam/internal/payment"
	"github.com/adzfaulkner/sallyadam/internal/registry"
	"github.com/adzfaulkner/sallyadam/internal/user"
	"github.com/aws/aws-lambda-go/events"
	"go.uber.org/zap"
)

type regRepo interface {
	FindByID(id string) (*registry.ID, *registry.Item)
}

type paymentHandler interface {
	CreateSession(items []payment.LineItem, currency, email string) (*payment.CreateSessionResult, error)
}

type item struct {
	UUID   string `json:"uuid"`
	Amount int64  `json:"amount"`
}

type requestBody struct {
	Items    []item `json:"items"`
	Currency string `json:"currency"`
	Message  string `json:"message"`
	Extra    int64  `json:"extra"`
}

type response struct {
	URL string `json:"url"`
}

func checkoutHandler(request *events.APIGatewayProxyRequest, paymentHandler paymentHandler, usr *user.User, regRepo regRepo, logHandler logHandler) (ResponseBody, ResponseStatus) {
	var reqBody requestBody
	err := json.Unmarshal([]byte(request.Body), &reqBody)

	if err != nil {
		logHandler.Info("req body unmarshal err", zap.String("req body", request.Body), zap.Error(err))

		return generateGenericResponse("Invalid request"), http.StatusBadRequest
	}

	cur := reqBody.Currency
	items, err := createLineItems(reqBody.Items, reqBody.Extra, regRepo)

	if err != nil {
		logHandler.Info("create line items from req body err", zap.String("req body", request.Body), zap.Error(err))

		return generateGenericResponse("Invalid request"), http.StatusBadRequest
	}

	res, err := paymentHandler.CreateSession(items, cur, usr.Username)

	if err != nil {
		logHandler.Error("could not create stripe payment session", zap.Error(err))

		return generateGenericResponse("Contact support"), http.StatusInternalServerError
	}

	resp := response{
		URL: res.URL,
	}

	response, err := json.Marshal(&resp)
	if err != nil {
		logHandler.Error("could not create resp body", zap.Error(err))

		return generateGenericResponse("Contact support"), http.StatusInternalServerError
	}

	return ResponseBody(response), http.StatusCreated
}

func createLineItems(items []item, extra int64, regRepo regRepo) ([]payment.LineItem, error) {
	if len(items) == 0 {
		return nil, fmt.Errorf("no registry items submitted")
	}

	var res = make([]payment.LineItem, 0, len(items))

	quantity := int64(1)

	for _, itm := range items {
		_, regItm := regRepo.FindByID(itm.UUID)

		if regItm == nil {
			return nil, fmt.Errorf("registry item not found: %s", itm.UUID)
		}

		lineItem := payment.LineItem{
			Title:    regItm.Title,
			Amount:   itm.Amount,
			Quantity: quantity,
		}

		res = append(res, lineItem)
	}

	if extra > 0 {
		lineItem := payment.LineItem{
			Title:    "Extra donation",
			Amount:   extra,
			Quantity: quantity,
		}

		res = append(res, lineItem)
	}

	return res, nil
}
