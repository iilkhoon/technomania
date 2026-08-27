#!/bin/bash
cd /var/www/techno-erp/apps/web
export NODE_OPTIONS="--max-old-space-size=4096"
npx next build
pm2 restart technomania-web
