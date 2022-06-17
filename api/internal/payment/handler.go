package payment

import (
	"fmt"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/checkout/session"
)

type LineItem struct {
	Title    string
	Amount   int64
	Quantity int64
}

type CreateSessionResult struct {
	ID  string
	URL string
}

type CreatePaymentSession func(params *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error)

func CreateStripePaymentSession() CreatePaymentSession {
	return func(params *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error) {
		sess, err := session.New(params)

		if err != nil {
			return nil, fmt.Errorf("could not create stripe session: %w", err)
		}

		return sess, nil
	}
}

func createLineItems(items []LineItem, currency string) []*stripe.CheckoutSessionLineItemParams {
	var res = make([]*stripe.CheckoutSessionLineItemParams, len(items))

	for ind, item := range items {
		amount := item.Amount
		title := item.Title
		quantity := item.Quantity

		lineItem := &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: &currency,
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name: &title,
				},
				UnitAmount: &amount,
			},
			Quantity: &quantity,
		}

		res[ind] = lineItem
	}

	return res
}

type Handler struct {
	createSession CreatePaymentSession
	key           string
	successURL    string
	cancelURL     string
}

func (c *Handler) CreateSession(items []LineItem, currency, email, message string) (*CreateSessionResult, error) {
	stripe.Key = c.key

	params := &stripe.CheckoutSessionParams{
		SuccessURL:    stripe.String(c.successURL),
		CancelURL:     stripe.String(c.cancelURL),
		CustomerEmail: &email,
		LineItems:     createLineItems(items, currency),
		Mode:          stripe.String(string(stripe.CheckoutSessionModePayment)),
		PaymentIntentData: &stripe.CheckoutSessionPaymentIntentDataParams{Metadata: map[string]string{
			"message": message,
		}},
	}

	sess, err := c.createSession(params)

	if err != nil {
		return nil, fmt.Errorf("unable to create payment session: %w", err)
	}

	return &CreateSessionResult{
		ID:  sess.ID,
		URL: sess.URL,
	}, nil
}

func NewHandler(createSession CreatePaymentSession, key, successURL, cancelURL string) *Handler {
	return &Handler{
		createSession: createSession,
		key:           key,
		successURL:    successURL,
		cancelURL:     cancelURL,
	}
}
