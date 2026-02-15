# 🔍 INVESTIGATION SCRIPTS
# Helper commands to investigate your own codebase

## Quick Service Info
echo "=== CodeArena Service Inspector ==="
echo ""

## Find what ports each service uses
echo "📡 Searching for port configurations..."
echo ""
grep -r "PORT\|port\|listen" backend/services/*/src/index.ts 2>/dev/null | grep -v node_modules

echo ""
echo "=================================="
echo ""

## Find package.json dev scripts  
echo "📦 Service start commands:"
for service in backend/services/*/; do
    if [ -f "$service/package.json" ]; then
        echo ""
        echo "Service: $(basename $service)"
        grep -A 2 '"scripts"' "$service/package.json" | grep "dev\|start" || echo "  No dev/start script found"
    fi
done

echo ""
echo "=================================="
echo ""

## Check for Prisma schema
echo "🗃️ Database schema location:"
find backend -name "schema.prisma" -type f 2>/dev/null

echo ""
echo "=================================="
echo ""

## Check what's in .env
echo "🔐 Environment files found:"
find . -name ".env*" -type f 2>/dev/null | grep -v node_modules

echo ""
echo "=================================="
