package handler

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/adzfaulkner/sallyadam/internal/payment"
	"github.com/adzfaulkner/sallyadam/internal/registry"
	"github.com/adzfaulkner/sallyadam/internal/user"
	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
)

type regRepoMock struct {
}

func (r *regRepoMock) FindByID(id string) (*registry.ID, *registry.Item) { //nolint:varnamelen // Defined by interface
	if id == "notfound" {
		return nil, nil
	}

	usrID := id
	uuid := usrID
	title := id + " Title"

	ID := registry.ID(usrID)

	return &ID, &registry.Item{
		UUID:        uuid,
		Title:       title,
		Image:       "",
		Description: "",
	}
}

type paymentHandlerMock struct {
	ReturnError bool
}

func (p *paymentHandlerMock) CreateSession(items []payment.LineItem, currency, email string) (*payment.CreateSessionResult, error) {
	if p.ReturnError {
		return nil, fmt.Errorf("CreateSession error")
	}

	return &payment.CreateSessionResult{
		ID:  "ID",
		URL: "http://checkout",
	}, nil
}

func Test_CreateLineItems(t *testing.T) {
	t.Parallel()

	regRepo := regRepoMock{}

	testCases := []struct {
		name      string
		items     []item
		extra     int64
		expResult []payment.LineItem
		expErrMsg string
	}{
		{
			name: "Includes extra as an item",
			items: []item{
				{
					UUID:   "UUID1",
					Amount: int64(100),
				},
				{
					UUID:   "UUID2",
					Amount: int64(200),
				},
			},
			extra: int64(100),
			expResult: []payment.LineItem{
				{
					Title:    "UUID1 Title",
					Amount:   int64(100),
					Quantity: int64(1),
				},
				{
					Title:    "UUID2 Title",
					Amount:   int64(200),
					Quantity: int64(1),
				},
				{
					Title:    "Extra donation",
					Amount:   int64(100),
					Quantity: int64(1),
				},
			},
			expErrMsg: "",
		},
		{
			name: "Excludes extra as an item",
			items: []item{
				{
					UUID:   "UUID1",
					Amount: int64(100),
				},
				{
					UUID:   "UUID2",
					Amount: int64(200),
				},
			},
			extra: int64(0),
			expResult: []payment.LineItem{
				{
					Title:    "UUID1 Title",
					Amount:   int64(100),
					Quantity: int64(1),
				},
				{
					Title:    "UUID2 Title",
					Amount:   int64(200),
					Quantity: int64(1),
				},
			},
			expErrMsg: "",
		},
		{
			name: "An item can not be found",
			items: []item{
				{
					UUID:   "UUID1",
					Amount: int64(100),
				},
				{
					UUID:   "notfound",
					Amount: int64(200),
				},
			},
			extra:     int64(0),
			expResult: nil,
			expErrMsg: "registry item not found: notfound",
		},
		{
			name:      "No items",
			items:     []item{},
			extra:     int64(0),
			expResult: nil,
			expErrMsg: "no registry items submitted",
		},
	}

	for _, tc := range testCases {
		tcs := tc // rebind tc into this lexical scope
		t.Run(tcs.name, func(t *testing.T) {
			t.Parallel()

			res, err := createLineItems(tcs.items, tcs.extra, &regRepo)

			errMsg := ""
			if err != nil {
				errMsg = err.Error()
			}

			assert.Equal(t, tcs.expResult, res)
			assert.Equal(t, tcs.expErrMsg, errMsg)
		})
	}
}

func Test_CheckoutHandler(t *testing.T) {
	t.Parallel()

	buildBody := func(extra int, currency string, message string, hasItems bool) string {
		items := "[]"
		if hasItems {
			items = fmt.Sprintf("[{%q:%q,%q:%d}]", "uuid", "UUID", "amount", 100)
		}

		return fmt.Sprintf("{%q:%s,%q:%d,%q:%q,%q:%q}", "items", items, "extra", extra, "currency", currency, "message", message)
	}

	testCases := []struct {
		name           string
		requestBody    string
		regRepo        *regRepoMock
		paymentHandler *paymentHandlerMock
		expBody        ResponseBody
		expStatusCode  ResponseStatus
		expLogLine     string
	}{
		{
			name:           "Body unmarshal error",
			requestBody:    "",
			regRepo:        nil,
			paymentHandler: nil,
			expBody:        "{\"message\":\"Invalid request\"}",
			expStatusCode:  http.StatusBadRequest,
			expLogLine:     "info req body unmarshal err [{req body 15 0  <nil>} {error 26 0  unexpected end of JSON input}]",
		},
		{
			name:           "No items in request",
			requestBody:    buildBody(100, "GBP", "", false),
			regRepo:        nil,
			paymentHandler: nil,
			expBody:        "{\"message\":\"Invalid request\"}",
			expStatusCode:  http.StatusBadRequest,
			expLogLine:     "info create line items from req body err [{req body 15 0 {\"items\":[],\"extra\":100,\"currency\":\"GBP\",\"message\":\"\"} <nil>} {error 26 0  no registry items submitted}]",
		},
		{
			name:           "Payment session fails",
			requestBody:    buildBody(100, "GBP", "", true),
			regRepo:        &regRepoMock{},
			paymentHandler: &paymentHandlerMock{ReturnError: true},
			expBody:        "{\"message\":\"Contact support\"}",
			expStatusCode:  http.StatusInternalServerError,
			expLogLine:     "error could not create stripe payment session [{error 26 0  CreateSession error}]",
		},
		{
			name:           "Payment session creates ok",
			requestBody:    buildBody(100, "GBP", "", true),
			regRepo:        &regRepoMock{},
			paymentHandler: &paymentHandlerMock{ReturnError: false},
			expBody:        "{\"url\":\"http://checkout\"}",
			expStatusCode:  http.StatusCreated,
			expLogLine:     "",
		},
	}

	for _, tc := range testCases {
		tcs := tc // rebind tc into this lexical scope
		t.Run(tcs.name, func(t *testing.T) {
			t.Parallel()

			req := events.APIGatewayProxyRequest{
				Body: tcs.requestBody,
			}

			logger := logger{
				"",
			}

			body, statusCode := checkoutHandler(&req, tcs.paymentHandler, &user.User{Username: "test@example.com"}, tcs.regRepo, &logger)

			assert.Equal(t, tcs.expBody, body)
			assert.Equal(t, tcs.expStatusCode, statusCode)
			assert.Equal(t, tcs.expLogLine, logger.line)
		})
	}
}
