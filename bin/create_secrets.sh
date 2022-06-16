#!/bin/sh

REGISTRY_DATA_PARAM=$(cat ./app/src/assets/registry.json)

aws --endpoint-url=http://localhost:4566 \
  ssm put-parameter \
  --name "/SallyAdam/GUEST_PASSWORD" \
  --type "SecureString" \
  --value '$2a$04$i04jRj2yEzWqsW3gWfuPU.0WKdQ6sUYu617nESTOIq2CgRPf9gSs2' \
  --overwrite

aws --endpoint-url=http://localhost:4566 \
  ssm put-parameter \
  --name "/SallyAdam/JWT_SECRET" \
  --type "SecureString" \
  --value "0f1b47cafe2f645b7cda198936372a99cc630999b1c1caebf895aa00bf30bb0a" \
  --overwrite

aws --endpoint-url=http://localhost:4566 \
  ssm put-parameter \
  --name "/SallyAdam/REGISTRY_DATA" \
  --type "SecureString" \
  --value "${REGISTRY_DATA_PARAM}" \
  --overwrite