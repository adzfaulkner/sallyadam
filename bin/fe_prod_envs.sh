#!/bin/sh

VUE_APP_REGISTRY_DATA=$REGISTRY_DATA
VUE_APP_API_BASE_URL=$(echo $API_BASE_URL | sed -e 's/[]\/$*.^[]/\\&/g')

cp app/.env.sample app/.env.production

REPLACED=$(sed "/^VUE_APP_REGISTRY_DATA/s/'[^']*'/'$VUE_APP_REGISTRY_DATA'/g" app/.env.production | sed "/^VUE_APP_API_BASE_URL/s/'[^']*'/'$VUE_APP_API_BASE_URL'/g" )

echo "$REPLACED" > app/.env.production
