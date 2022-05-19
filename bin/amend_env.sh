#!/bin/sh

REGISTRY_DATA_PARAM=$(cat ./data/registry.json | base64)

REPLACED=$(sed "/^VUE_APP_REGISTRY_DATA/s/'[^']*'/'$REGISTRY_DATA_PARAM'/g" app/.env)

echo "${REPLACED}" > app/.env