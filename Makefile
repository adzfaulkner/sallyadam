IMAGE_TAG_JS=sallyadam_js
IMAGE_TAG_SERVERLESS=sallyadam_serverless
IMAGE_TAG_GO=sallyadam_go
IMAGE_TAG_GO_LINT=sallyadam_go_lint
SERVERLESS_DEPLOY_ARGS=--verbose --debug *
SERVERLESS_STAGE=local
GO_TEST_ARGS=-v -coverprofile .profile.cov -coverpkg=./... ./...

setup:
	make localstack-up
	make build_docker_image_js
	make build_docker_image_go
	make build_api
	make create_secrets
	make deploy_api

build_docker_image_js:
	docker build --file app/Dockerfile --target js --tag ${IMAGE_TAG_JS} .

build_docker_image_go:
	docker build --file api/Dockerfile --target go --tag ${IMAGE_TAG_GO} .
	docker build --file api/Dockerfile --target go-lint --tag ${IMAGE_TAG_GO_LINT} .

build_docker_image_serverless:
	docker build --file api/Dockerfile --target serverless --tag ${IMAGE_TAG_SERVERLESS} .

js_run_command:
	docker run -v ${PWD}/app:/app -v /app/node_modules ${IMAGE_TAG_JS} ${cmd}

go_run_command:
	docker run -v ${PWD}/api:/go/src/app ${IMAGE_TAG_GO} ${cmd}

serverless_run_command:
	docker run -v ${PWD}/api:/app:rw \
			-v /app/node_modules \
			-e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
			-e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
            -e JWT_EXPIRE_MINS=${JWT_EXPIRE_MINS} \
            -e SUCCESS_URL=${SUCCESS_URL} \
            -e CANCEL_URL=${CANCEL_URL} \
            -e COOKIE_DOMAIN=${COOKIE_DOMAIN} \
            -e COOKIE_SECURE=${COOKIE_SECURE} \
            -e CORS_ALLOWED_ORIGIN=${CORS_ALLOWED_ORIGIN} ${IMAGE_TAG_SERVERLESS} ${cmd}

test_api:
	docker run -v ${PWD}/api:/go/src/app ${IMAGE_TAG_GO} env CGO_ENABLED=0 go test ${GO_TEST_ARGS}

lint_api:
	docker run -v ${PWD}/api:/app -w /app ${IMAGE_TAG_GO_LINT} golangci-lint run

tests_api:
	make test_api
	make go_run_command cmd='go tool cover -func .profile.cov'

build_api:
	docker run -v ${PWD}/api:/go/src/app:rw -w /go/src/app/cmd/entrypoint ${IMAGE_TAG_GO} sh -c 'GOOS=linux CGO_ENABLED=0 go build -o ../../bin/entrypoint/bootstrap .'

deploy_api:
	cd api/ && serverless deploy --stage ${SERVERLESS_STAGE} --region eu-west-2

deploy_func_entrypoint:
	cd api/ && serverless deploy function --function=entrypoint \
		--stage ${SERVERLESS_STAGE} --region eu-west-2

fe-up:
	cd app/ && npm run serve

tests_fe:
	make js_run_command cmd='npm run test'

localstack-up:
	DEBUG=true TMPDIR=./tmp docker-compose up -d

localstack-down:
	docker-compose down

create-table-session:
	aws --endpoint-url=http://localhost:4566 \
		dynamodb create-table \
		--table-name Session \
    	--attribute-definitions \
        	AttributeName=Token,AttributeType=S \
        	AttributeName=User,AttributeType=S \
    	--key-schema \
        	AttributeName=Token,KeyType=HASH \
        	AttributeName=User,KeyType=RANGE \
		--billing-mode PAY_PER_REQUEST

query-table-session:
	aws --endpoint-url=http://localhost:4566 \
		dynamodb scan \
		--table-name=Session

delete-table-session:		
	aws --endpoint-url=http://localhost:4566 \
		dynamodb delete-table \
		--table-name=Session

delete-item-session:		
	aws --endpoint-url=http://localhost:4566 \
		dynamodb delete-item \
		--table-name=Session \
		--key '{"Token":{"S":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJleHAiOjE2NDg5ODgwMjgsInVzZXJfaWQiOiI4ZWU1NDczNS02NGViLTQzYzktOWYyZi02ZmNkNjIwMDI1NzIifQ.GNVhPEpXyDRwc-vvPI2SCFzY_6-9T01yDKSxdExA8L0"},"User":{"S":"8ee54735-64eb-43c9-9f2f-6fcd62002572"}}'

create_secrets:
	sh bin/create_secrets.sh

#######################
# CI Specific targets #
#######################

ci_tests_api:
	make tests_api
	make lint_api

ci_build_api:
	make build_api

ci_deploy_api:
	make serverless_run_command cmd='serverless deploy function --function=entrypoint --stage prod --region eu-west-2 --verbose --force --update-config'

ci_tests_fe:
	make js_run_command cmd='npm run test:run'

ci_build_fe:
	sh bin/fe_prod_envs.sh
	cat app/.env.production
	docker run -v ${PWD}/app:/app:rw -v /app/node_modules ${IMAGE_TAG_JS} sh -c 'npm run build'

ci_deploy_fe:
	docker run -v ${PWD}/app:/aws -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} amazon/aws-cli s3 sync dist/ s3://${AWS_BUCKET_NAME} --region eu-west-2
	docker run -v ${PWD}/app:/aws -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} amazon/aws-cli cloudfront create-invalidation --distribution-id ${AWS_CF_DISTRIBUTION_ID} --paths '/*' --region eu-west-2

docker_build_tag_push:
	make build_docker_image_js
	make build_docker_image_go
	make build_docker_image_serverless
	docker tag ${IMAGE_TAG_JS}:latest ghcr.io/adzfaulkner/${IMAGE_TAG_JS}:latest
	docker tag ${IMAGE_TAG_SERVERLESS}:latest ghcr.io/adzfaulkner/${IMAGE_TAG_SERVERLESS}:latest
	docker tag ${IMAGE_TAG_GO}:latest ghcr.io/adzfaulkner/${IMAGE_TAG_GO}:latest
	docker tag ${IMAGE_TAG_GO_LINT}:latest ghcr.io/adzfaulkner/${IMAGE_TAG_GO_LINT}:latest
	docker push ghcr.io/adzfaulkner/${IMAGE_TAG_JS}:latest
	docker push ghcr.io/adzfaulkner/${IMAGE_TAG_SERVERLESS}:latest
	docker push ghcr.io/adzfaulkner/${IMAGE_TAG_GO}:latest
	docker push ghcr.io/adzfaulkner/${IMAGE_TAG_GO_LINT}:latest

docker_pull_fe:
	docker pull ghcr.io/adzfaulkner/${IMAGE_TAG_JS}:latest
	docker tag ghcr.io/adzfaulkner/${IMAGE_TAG_JS}:latest ${IMAGE_TAG_JS}:latest

docker_pull_be:
	docker pull ghcr.io/adzfaulkner/${IMAGE_TAG_SERVERLESS}:latest
	docker pull ghcr.io/adzfaulkner/${IMAGE_TAG_GO}:latest
	docker pull ghcr.io/adzfaulkner/${IMAGE_TAG_GO_LINT}:latest
	docker tag ghcr.io/adzfaulkner/${IMAGE_TAG_SERVERLESS}:latest ${IMAGE_TAG_SERVERLESS}:latest
	docker tag ghcr.io/adzfaulkner/${IMAGE_TAG_GO}:latest ${IMAGE_TAG_GO}:latest
	docker tag ghcr.io/adzfaulkner/${IMAGE_TAG_GO_LINT}:latest ${IMAGE_TAG_GO_LINT}:latest