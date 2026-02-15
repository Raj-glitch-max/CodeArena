#!/bin/bash

GRAFANA_URL="http://localhost:3200"
USER="admin"
PASS="admin123"

echo "⏳ Importing CodeArena Dashboard to Grafana..."

# Check if Grafana is reachable
if ! curl -s -f -u "$USER:$PASS" "$GRAFANA_URL/api/health" > /dev/null; then
  echo "❌ Error: Cannot connect to Grafana at $GRAFANA_URL. Make sure port-forward is running."
  exit 1
fi

# Prepare payload
# We need to ensure 'overwrite: true' is in the payload
# and 'dashboard' is the key
cat > /tmp/dashboard-payload.json <<EOF
{
  "dashboard": $(cat k8s/monitoring/grafana-dashboard.json | jq '.dashboard'),
  "overwrite": true
}
EOF

# Upload
RESPONSE=$(curl -s -u "$USER:$PASS" -X POST -H "Content-Type: application/json" -d @/tmp/dashboard-payload.json "$GRAFANA_URL/api/dashboards/db")

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Dashboard imported successfully!"
  echo "👉 Open: $GRAFANA_URL/d/codearena/codearena-microservices"
else
  echo "❌ Import failed!"
  echo "$RESPONSE"
fi
