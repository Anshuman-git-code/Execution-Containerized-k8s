#!/bin/sh

# Replace the API URL in the JavaScript files
if [ -n "$API_URL" ]; then
  echo "Using API URL: $API_URL"
  find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:5000|$API_URL|g" {} \;
fi

# Execute the original entrypoint
exec /docker-entrypoint.sh "$@"
