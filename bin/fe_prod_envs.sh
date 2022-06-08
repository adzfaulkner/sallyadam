#!/bin/sh

VUE_APP_API_BASE_URL=$(echo $API_BASE_URL | sed -e 's/[]\/$*.^[]/\\&/g')

cp app/.env.sample app/.env.production

REPLACED=$(sed "/^VUE_APP_API_BASE_URL/s/'[^']*'/'$VUE_APP_API_BASE_URL'/g" app/.env.production )

echo "$REPLACED" > app/.env.production
