#!/bin/sh

REGISTRY_DATA_PARAM=$(cat ./data/registry.json | base64)
USERS_DATA_PARAM=$(cat ./data/users.json | base64)

REPLACED=$(sed "/^USERS_DATA/s/'[^']*'/'$USERS_DATA_PARAM'/g" api/.env.local | sed "/^REGISTRY_DATA/s/'[^']*'/'$REGISTRY_DATA_PARAM'/g")

echo "${REPLACED}" > api/.env.local

REPLACED=$(sed "/^VUE_APP_REGISTRY_DATA/s/'[^']*'/'$REGISTRY_DATA_PARAM'/g" app/.env)

echo "${REPLACED}" > app/.env