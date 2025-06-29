#!/bin/bash

# === CONFIGURATION ===
VPS_ALIAS="myvps"
FRONTEND_DIR="admin-dashboard-vite"
BACKEND_DIR="backend"
VPS_FRONTEND_PATH="/var/www/anvi-dashboard/frontend"
VPS_BACKEND_PATH="/var/www/anvi-dashboard/backend"
SSH_CONTROL_PATH="/tmp/ssh_mux_$$"

echo "🚀 Starting deployment to $VPS_ALIAS..."

# === Start a persistent SSH connection ===
echo "🔑 Setting up SSH connection..."
ssh -o ControlMaster=yes -o ControlPath="$SSH_CONTROL_PATH" -o ControlPersist=10m -Nf "$VPS_ALIAS"

# === Build Frontend ===
echo "📦 Building React (Vite) frontend..."
cd "$FRONTEND_DIR" || { echo "❌ Frontend folder not found!"; exit 1; }
npm install
npm run build || { echo "❌ React build failed"; exit 1; }
cd ..

# === Clean VPS directories before upload ===
echo "🧹 Cleaning old code on VPS..."
ssh -o ControlPath="$SSH_CONTROL_PATH" "$VPS_ALIAS" "rm -rf '$VPS_FRONTEND_PATH' '$VPS_BACKEND_PATH' && mkdir -p '$VPS_FRONTEND_PATH' '$VPS_BACKEND_PATH'"

# === Upload Frontend Build to VPS ===
echo "⬆ Uploading frontend build to VPS..."
rsync -e "ssh -o ControlPath=$SSH_CONTROL_PATH" -avz --delete "$FRONTEND_DIR/dist/" "$VPS_ALIAS:$VPS_FRONTEND_PATH" || { echo "❌ Frontend upload failed"; exit 1; }

# === Upload Backend to VPS (excluding node_modules) ===
echo "⬆ Uploading backend to VPS..."
rsync -e "ssh -o ControlPath=$SSH_CONTROL_PATH" -avz --delete --exclude 'node_modules' "$BACKEND_DIR/" "$VPS_ALIAS:$VPS_BACKEND_PATH" || { echo "❌ Backend upload failed"; exit 1; }

# === Install dependencies on server ===
echo "📦 Installing backend dependencies on VPS..."
ssh -o ControlPath="$SSH_CONTROL_PATH" "$VPS_ALIAS" "cd '$VPS_BACKEND_PATH' && npm install" || { echo "❌ npm install failed on VPS"; exit 1; }

# === Close the SSH connection ===
echo "🔒 Closing SSH connection..."
ssh -O exit -o ControlPath="$SSH_CONTROL_PATH" "$VPS_ALIAS"

echo "✅ Deployment complete!"

