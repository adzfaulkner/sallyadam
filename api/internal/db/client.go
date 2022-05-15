package db

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
)

type WrapperClient interface {
	PutItem(input *dynamodb.PutItemInput) (*dynamodb.PutItemOutput, error)
}

type Connect func() WrapperClient

func DynamoDBConnect(endpoint, region string) Connect {
	return func() WrapperClient {
		config := &aws.Config{
			Endpoint: &endpoint,
			Region:   &region,
		}

		sess := session.Must(session.NewSession(config))

		return dynamodb.New(sess)
	}
}

type Client struct {
	client WrapperClient
}

func (c *Client) Connect(connect Connect) {
	c.client = connect()
}

func (c *Client) Insert(tableName string, payload interface{}) error {
	item, err := dynamodbattribute.MarshalMap(payload)
	if err != nil {
		return fmt.Errorf("could not create item: %w", err)
	}

	i := &dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String(tableName),
	}

	if _, err = c.client.PutItem(i); err != nil {
		return fmt.Errorf("could not insert new record: %w", err)
	}

	return nil
}
