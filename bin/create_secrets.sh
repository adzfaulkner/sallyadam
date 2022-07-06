#!/bin/sh

REGISTRY_DATA_PARAM=$(cat ./app/src/assets/registry.json)

export $(cat ./api/.env.local | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}' )

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
  --value ${JWT_SECRET} \
  --overwrite

aws --endpoint-url=http://localhost:4566 \
  ssm put-parameter \
  --name "/SallyAdam/REGISTRY_DATA" \
  --type "SecureString" \
  --value "${REGISTRY_DATA_PARAM}" \
  --overwrite

aws --endpoint-url=http://localhost:4566 \
  ssm put-parameter \
  --name "/SallyAdam/STRIPE_KEY" \
  --type "SecureString" \
  --value "${STRIPE_KEY}" \
  --overwrite