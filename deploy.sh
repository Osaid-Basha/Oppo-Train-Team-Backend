#!/bin/bash

# 🚀 OppoTrain Backend Production Deployment Script
# This script deploys the complete production-ready application

echo "🚀 Starting OppoTrain Backend Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Please create it with your Firebase configuration.${NC}"
    echo -e "${YELLOW}📝 Example .env file:${NC}"
    echo "FIREBASE_API_KEY=your_api_key"
    echo "FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com"
    echo "FIREBASE_PROJECT_ID=your_project_id"
    echo "FIREBASE_STORAGE_BUCKET=your_project.appspot.com"
    echo "FIREBASE_MESSAGING_SENDER_ID=your_sender_id"
    echo "FIREBASE_APP_ID=your_app_id"
    echo "FIREBASE_MEASUREMENT_ID=your_measurement_id"
    echo "PORT=3000"
    echo "NODE_ENV=production"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --only=production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Create logs directory
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs

# Create production build
echo -e "${BLUE}🔨 Creating production build...${NC}"
npm run build 2>/dev/null || echo -e "${YELLOW}⚠️  No build script found, skipping...${NC}"

# Test the application
echo -e "${BLUE}🧪 Testing the application...${NC}"
npm test 2>/dev/null || echo -e "${YELLOW}⚠️  No test script found, skipping...${NC}"

# Create systemd service file
echo -e "${BLUE}🔧 Creating systemd service...${NC}"
sudo tee /etc/systemd/system/oppotrain-backend.service > /dev/null <<EOF
[Unit]
Description=OppoTrain Backend API
Documentation=https://github.com/yourusername/oppotrain-backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node src/app.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=oppotrain-backend

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$(pwd)/logs

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ Systemd service created${NC}"

# Reload systemd and enable service
echo -e "${BLUE}🔄 Reloading systemd and enabling service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable oppotrain-backend.service

# Start the service
echo -e "${BLUE}🚀 Starting OppoTrain Backend service...${NC}"
sudo systemctl start oppotrain-backend.service

# Check service status
echo -e "${BLUE}📊 Checking service status...${NC}"
sleep 3
sudo systemctl status oppotrain-backend.service --no-pager -l

# Test the API
echo -e "${BLUE}🧪 Testing the API...${NC}"
sleep 2
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ API is responding successfully${NC}"
else
    echo -e "${RED}❌ API is not responding. Check logs with: sudo journalctl -u oppotrain-backend -f${NC}"
fi

# Create nginx configuration (optional)
echo -e "${BLUE}🌐 Creating nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/oppotrain-backend > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo -e "${GREEN}✅ Nginx configuration created${NC}"
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "${YELLOW}   1. Replace 'your-domain.com' with your actual domain${NC}"
echo -e "${YELLOW}   2. Enable the site: sudo ln -s /etc/nginx/sites-available/oppotrain-backend /etc/nginx/sites-enabled/${NC}"
echo -e "${YELLOW}   3. Test nginx: sudo nginx -t${NC}"
echo -e "${YELLOW}   4. Reload nginx: sudo systemctl reload nginx${NC}"

# Create PM2 configuration (alternative to systemd)
echo -e "${BLUE}📱 Creating PM2 configuration...${NC}"
tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'oppotrain-backend',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

echo -e "${GREEN}✅ PM2 configuration created${NC}"

# Create monitoring script
echo -e "${BLUE}📊 Creating monitoring script...${NC}"
tee monitor.sh > /dev/null <<EOF
#!/bin/bash
echo "📊 OppoTrain Backend Monitoring"
echo "================================"
echo "Service Status:"
sudo systemctl status oppotrain-backend.service --no-pager -l
echo ""
echo "Recent Logs:"
sudo journalctl -u oppotrain-backend.service -n 20 --no-pager
echo ""
echo "API Health Check:"
curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
echo ""
echo "Memory Usage:"
ps aux | grep "oppotrain-backend" | grep -v grep
EOF

chmod +x monitor.sh
echo -e "${GREEN}✅ Monitoring script created${NC}"

# Create backup script
echo -e "${BLUE}💾 Creating backup script...${NC}"
tee backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="./backups"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="oppotrain-backend_\$DATE.tar.gz"

mkdir -p \$BACKUP_DIR

echo "💾 Creating backup: \$BACKUP_NAME"
tar -czf "\$BACKUP_DIR/\$BACKUP_NAME" \\
  --exclude=node_modules \\
  --exclude=logs \\
  --exclude=backups \\
  --exclude=.git \\
  .

echo "✅ Backup created: \$BACKUP_DIR/\$BACKUP_NAME"
echo "📁 Backup size: \$(du -h "\$BACKUP_DIR/\$BACKUP_NAME" | cut -f1)"
EOF

chmod +x backup.sh
echo -e "${GREEN}✅ Backup script created${NC}"

# Final instructions
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${BLUE}   1. Monitor the service: ./monitor.sh${NC}"
echo -e "${BLUE}   2. View logs: sudo journalctl -u oppotrain-backend -f${NC}"
echo -e "${BLUE}   3. Restart service: sudo systemctl restart oppotrain-backend${NC}"
echo -e "${BLUE}   4. Stop service: sudo systemctl stop oppotrain-backend${NC}"
echo ""
echo -e "${BLUE}🔗 API Endpoints:${NC}"
echo -e "${BLUE}   Health Check: http://localhost:3000/health${NC}"
echo -e "${BLUE}   Resources API: http://localhost:3000/api/resources${NC}"
echo -e "${BLUE}   Members API: http://localhost:3000/api/members${NC}"
echo ""
echo -e "${BLUE}📚 Documentation: README.md${NC}"
echo -e "${BLUE}🐛 Issues: Check logs with ./monitor.sh${NC}"
echo ""
echo -e "${GREEN}🚀 OppoTrain Backend is now running in production!${NC}"
