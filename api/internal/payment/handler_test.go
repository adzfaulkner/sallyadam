package payment

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stripe/stripe-go/v72"
)

func Test_createLineItems(t *testing.T) {
	t.Parallel()

	items := []LineItem{
		{
			Title:    "Item A",
			Amount:   int64(100),
			Quantity: int64(1),
		},
		{
			Title:    "Item B",
			Amount:   int64(200),
			Quantity: int64(2),
		},
		{
			Title:    "Item C",
			Amount:   int64(300),
			Quantity: int64(3),
		},
	}

	currency := "GBP"

	res := createLineItems(items, currency)

	assert.Len(t, res, 3)

	item1 := res[0]
	item2 := res[1]
	item3 := res[2]

	assert.Equal(t, currency, *item1.PriceData.Currency)
	assert.Equal(t, items[0].Title, *item1.PriceData.ProductData.Name)
	assert.Equal(t, items[0].Amount, *item1.PriceData.UnitAmount)
	assert.Equal(t, items[0].Quantity, *item1.Quantity)
	assert.Equal(t, currency, *item2.PriceData.Currency)
	assert.Equal(t, items[1].Title, *item2.PriceData.ProductData.Name)
	assert.Equal(t, items[1].Amount, *item2.PriceData.UnitAmount)
	assert.Equal(t, items[1].Quantity, *item2.Quantity)
	assert.Equal(t, currency, *item3.PriceData.Currency)
	assert.Equal(t, items[2].Title, *item3.PriceData.ProductData.Name)
	assert.Equal(t, items[2].Amount, *item3.PriceData.UnitAmount)
	assert.Equal(t, items[2].Quantity, *item3.Quantity)
}

func Test_HandlerCreateSession(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name        string
		returnError bool
		expectedRes *CreateSessionResult
		expectedErr string
	}{
		{
			name:        "Create session returns error",
			returnError: true,
			expectedRes: nil,
			expectedErr: "unable to create payment session: create session error",
		},
		{
			name:        "Create session is successful",
			returnError: false,
			expectedRes: &CreateSessionResult{
				ID:  "id",
				URL: "http://test/expected",
			},
			expectedErr: "",
		},
	}

	for _, tc := range testCases {
		tcs := tc // rebind tc into this lexical scope
		t.Run(tcs.name, func(t *testing.T) {
			t.Parallel()

			createSession := func(retErr bool) CreatePaymentSession {
				return func(params *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error) {
					if retErr {
						return nil, fmt.Errorf("create session error")
					}

					return &stripe.CheckoutSession{
						ID:  "id",
						URL: "http://test/expected",
					}, nil
				}
			}

			sut := Handler{
				createSession: createSession(tcs.returnError),
				key:           "irrelevant",
				successURL:    "http://test/success",
				cancelURL:     "http://test/cancel",
			}

			items := []LineItem{
				{
					Title:    "Item A",
					Amount:   int64(100),
					Quantity: int64(1),
				},
			}

			res, err := sut.CreateSession(items, "GBP", "info@example.com")

			errMsg := ""
			if err != nil {
				errMsg = err.Error()
			}

			assert.Equal(t, tcs.expectedErr, errMsg)
			assert.Equal(t, tcs.expectedRes, res)
		})
	}
}

func Test_NewHandler(t *testing.T) {
	t.Parallel()

	createSession := CreateStripePaymentSession()

	res := NewHandler(createSession, "key", "http://success", "http://cancel")

	assert.NotNil(t, res.createSession)
	assert.Equal(t, "key", res.key)
	assert.Equal(t, "http://success", res.successURL)
	assert.Equal(t, "http://cancel", res.cancelURL)
}
