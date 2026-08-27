#!/bin/bash
# ==============================================================================
# TechnoMania Automated Server Backup Script
# Creates complete backups of PostgreSQL DB, Media Storage, and Nginx/SSL configs
# ==============================================================================

set -e

BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_DIR="${BACKUP_DIR}/technomania_backup_${TIMESTAMP}"

echo "📦 [1/4] Creating backup directory at ${TARGET_DIR}..."
mkdir -p "${TARGET_DIR}"

echo "🗄️ [2/4] Exporting PostgreSQL Database Dump..."
docker exec -t technomania_postgres pg_dump -U postgres postgres > "${TARGET_DIR}/database_dump.sql"

echo "🖼️ [3/4] Compressing Media Storage (/var/www/techno-erp/storage)..."
if [ -d "/var/www/techno-erp/storage" ]; then
    tar -czf "${TARGET_DIR}/storage_media.tar.gz" -C /var/www/techno-erp storage
fi

echo "🔒 [4/4] Backing up Nginx & SSL Configurations..."
if [ -d "/etc/nginx" ]; then
    tar -czf "${TARGET_DIR}/nginx_configs.tar.gz" /etc/nginx/sites-available /etc/nginx/sites-enabled 2>/dev/null || true
fi
if [ -d "/etc/letsencrypt" ]; then
    tar -czf "${TARGET_DIR}/ssl_certificates.tar.gz" /etc/letsencrypt 2>/dev/null || true
fi

echo "🗜️ Bundling full backup archive..."
FINAL_ARCHIVE="${BACKUP_DIR}/technomania_FULL_BACKUP_${TIMESTAMP}.tar.gz"
tar -czf "${FINAL_ARCHIVE}" -C "${BACKUP_DIR}" "technomania_backup_${TIMESTAMP}"
rm -rf "${TARGET_DIR}"

# Keep only the last 7 backups to save disk space
find "${BACKUP_DIR}" -name "technomania_FULL_BACKUP_*.tar.gz" -mtime +7 -exec rm -f {} \;

echo "✅ SUCCESS: Full backup created at: ${FINAL_ARCHIVE}"
ls -lh "${FINAL_ARCHIVE}"
