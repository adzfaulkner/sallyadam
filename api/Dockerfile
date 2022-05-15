FROM golang:1.18 as go

WORKDIR /go/src/app
COPY api/* ./

#RUN go get -d -v ./...
#RUN go install -v ./...

CMD ["app"]

FROM golangci/golangci-lint:v1.44-alpine as go-lint

RUN apk update \
    && apk add jq \
    && chmod +x /usr/bin/jq

FROM amaysim/serverless:3.16.0 as serverless

RUN mkdir /app

WORKDIR /app

COPY api/package.* ./

RUN npm install