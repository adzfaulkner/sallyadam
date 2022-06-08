#!/bin/sh

REGISTRY_DATA_PARAM=$(cat ./app/src/assets/registry.json)

aws ssm put-parameter \
  --name "/SallyAdam/REGISTRY_DATA" \
  --type "SecureString" \
  --value "${REGISTRY_DATA_PARAM}" \
  --overwrite