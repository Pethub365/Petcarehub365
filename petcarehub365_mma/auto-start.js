/**
 * auto-start.js
 * Tự động lấy IP WiFi hiện tại, cập nhật .env rồi chạy Expo
 * Dùng: node auto-start.js
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '.env');

// Lấy IPv4 hiện tại (Windows)
function getCurrentIP() {
  try {
    const output = execSync('ipconfig', { encoding: 'utf8' });
    // Tìm dòng IPv4 đầu tiên không phải 127.x.x.x
    const matches = output.match(/IPv4 Address[.\s]+:\s*([\d.]+)/g);
    if (!matches) throw new Error('Không tìm thấy IPv4');
    for (const m of matches) {
      const ip = m.match(/([\d.]+)$/)[1];
      if (!ip.startsWith('127.')) return ip;
    }
    throw new Error('Không tìm thấy IP hợp lệ');
  } catch (e) {
    console.error('❌ Lấy IP thất bại:', e.message);
    process.exit(1);
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
