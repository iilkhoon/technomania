#!/bin/bash
set -e

echo "=============================================="
echo "🚀 TechnoMania Production Auto-Deploy & Healthcheck"
echo "=============================================="

PROJECT_ROOT="/var/www/techno-erp"
cd "$PROJECT_ROOT"

echo "📦 1. Building Production Docker Images..."
docker compose build erp web

echo "🔄 2. Starting All Production Services..."
docker compose up -d postgres redis meilisearch backend erp web

echo "⏳ 3. Waiting for services to become healthy..."
sleep 4

echo "🔍 4. Performing Live Health Checks..."
echo -n "   - NestJS Central API: "
curl -s -f -o /dev/null http://127.0.0.1:4000/api/catalog/categories && echo "✅ 200 OK" || echo "❌ FAILED"

echo -n "   - ERP Panel (/erp): "
curl -s -f -o /dev/null http://127.0.0.1:3000/erp && echo "✅ 200 OK" || echo "❌ FAILED"

echo -n "   - Web Storefront: "
curl -s -f -o /dev/null http://127.0.0.1:3001/ && echo "✅ 200 OK" || echo "❌ FAILED"

echo "=============================================="
echo "🎉 TechnoMania Production Deployment Completed!"
echo "=============================================="
