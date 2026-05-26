/**
 * auto-start.js
 * Tự động lấy IP WiFi hiện tại, cập nhật .env rồi chạy Expo
 * Dùng: node auto-start.js
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '.env');

const os = require('os');

// Lấy IPv4 hiện tại
function getCurrentIP() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if ((net.family === 'IPv4' || net.family === 4) && !net.internal) {
          // We prefer wifi/ethernet IPs (usually starting with 192.168 or 10.)
          return net.address;
        }
      }
    }
    return '127.0.0.1'; // Fallback
  } catch (e) {
    console.error('❌ Lấy IP thất bại, dùng fallback 127.0.0.1:', e.message);
    return '127.0.0.1';
  }
}

// Cập nhật file .env
function updateEnv(ip) {
  let content = '';
  if (fs.existsSync(ENV_FILE)) {
    content = fs.readFileSync(ENV_FILE, 'utf8');
  }
  const newUrl = `http://${ip}:5001/api/v1`;
  if (content.includes('EXPO_PUBLIC_API_URL=')) {
    content = content.replace(/EXPO_PUBLIC_API_URL=.*/,  `EXPO_PUBLIC_API_URL=${newUrl}`);
  } else {
    content += `\nEXPO_PUBLIC_API_URL=${newUrl}`;
  }
  fs.writeFileSync(ENV_FILE, content, 'utf8');
  return newUrl;
}

// Main
const ip = getCurrentIP();
const url = updateEnv(ip);

console.log('\n==================================================================');
console.log('📱  EXPO GO CONNECTION LINK (COPY AND PASTE INTO EXPO GO APP):');
console.log(`\n    exp://${ip}:8081`);
console.log('\n==================================================================\n');

console.log(`✅ IP phát hiện: ${ip}`);
console.log(`✅ .env đã cập nhật: EXPO_PUBLIC_API_URL=${url}`);
console.log('🚀 Đang khởi động Expo...\n');

// Chạy expo start -c
const expo = spawn('npx', ['expo', 'start', '-c'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

expo.on('error', (err) => {
  console.error('❌ Lỗi khi chạy Expo:', err.message);
});
