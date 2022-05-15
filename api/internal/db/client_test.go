package db

import (
	"fmt"
	"testing"

	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/stretchr/testify/assert"
)

type wrapperClient struct {
	returnError bool
}

func (c *wrapperClient) PutItem(input *dynamodb.PutItemInput) (*dynamodb.PutItemOutput, error) {
	if c.returnError {
		return nil, fmt.Errorf("putitem error")
	}

	return &dynamodb.PutItemOutput{}, nil
}

func Test_Connect(t *testing.T) {
	t.Parallel()

	connect := func() WrapperClient {
		return &wrapperClient{}
	}

	sut := Client{}
	sut.Connect(connect)

	assert.Equal(t, &wrapperClient{}, sut.client)
}

func Test_Insert(t *testing.T) {
	t.Parallel()

	payload := struct {
		A string
		B string
		C string
	}{
		A: "a",
		B: "b",
		C: "c",
	}

	testCases := []struct {
		name      string
		payload   interface{}
		returnErr bool
		expErr    string
	}{
		{
			name:      "Returns error",
			payload:   payload,
			returnErr: true,
			expErr:    "could not insert new record: putitem error",
		},
		{
			name:      "No error",
			payload:   payload,
			returnErr: false,
			expErr:    "",
		},
	}

	for _, tc := range testCases {
		tcs := tc // rebind tc into this lexical scope
		t.Run(tcs.name, func(t *testing.T) {
			t.Parallel()

			sut := Client{
				&wrapperClient{
					returnError: tcs.returnErr,
				},
			}

			err := sut.Insert("test", tcs.payload)

			errMsg := ""
			if err != nil {
				errMsg = err.Error()
			}

			assert.Equal(t, tcs.expErr, errMsg)
		})
	}
}
