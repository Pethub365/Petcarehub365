# Hướng dẫn chạy dự án PetcareHub365 🐾

Chào mừng bạn đến với dự án **PetcareHub365**! Dưới đây là hướng dẫn chi tiết từng bước để cấu hình và khởi chạy toàn bộ hệ thống bao gồm **Backend (Node.js/Express)** và **Frontend/Mobile App (Expo/React Native)**.

---

## 📁 Cấu trúc thư mục dự án

```text
Petcarehub365-main/
├── petcarehub365_be/          # Thư mục Backend (API & Socket Server)
│   ├── config/                # Cấu hình DB, Cloudinary, Mail,...
│   ├── controllers/           # Xử lý logic API
│   ├── models/                # Schema database Mongoose (MongoDB)
│   ├── routes/                # Khai báo các API Endpoints
│   ├── server.js              # Điểm khởi chạy Backend
│   └── .env                   # File cấu hình môi trường Backend
│
└── petcarehub365_mma/         # Thư mục Mobile App (Expo & React Native)
    ├── apis/                  # Định nghĩa các cuộc gọi API Axios
    ├── app/                   # Cấu hình Expo Router (màn hình ứng dụng)
    ├── components/            # Các UI components dùng chung
    ├── auto-start.js          # Script tự động lấy IP WiFi & cấu hình Expo
    └── .env                   # File cấu hình môi trường Frontend
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Cấu hình Biến môi trường (Environment Variables)

Chúng tôi đã tự động cấu hình các file `.env` cho cả Backend và Frontend theo thông tin bạn cung cấp:

*   **Backend (`petcarehub365_be/.env`):** Đã kết nối với Database MongoDB Atlas thực tế và cấu hình cổng `5001`.
*   **Frontend/Mobile (`petcarehub365_mma/.env`):** Cấu hình `EXPO_PUBLIC_API_URL` để gọi đến địa chỉ IP máy chủ của bạn.

> [!IMPORTANT]
> Hãy nhớ thay thế các giá trị placeholder sau trong file [petcarehub365_be/.env](file:///d:/PetcareHub/Petcarehub365-main/petcarehub365_be/.env) khi đưa vào sử dụng thực tế:
> *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (dùng để upload ảnh thú cưng lên Cloudinary).
> *   `SMTP_USERNAME`, `SMTP_PASSWORD` (Gmail App Password dùng để gửi email xác thực tài khoản).

---

### 2. Khởi chạy Backend (`petcarehub365_be`)

Mở terminal mới tại thư mục gốc dự án hoặc di chuyển trực tiếp vào thư mục backend và chạy các lệnh sau:

```bash
# 1. Di chuyển vào thư mục backend
cd petcarehub365_be

# 2. Cài đặt các thư viện (đã được cài đặt sẵn)
npm install

# 3. Khởi chạy server ở chế độ phát triển (sử dụng nodemon để tự động reload khi sửa code)
npm run dev
```

Khi chạy thành công, bạn sẽ thấy thông báo:
`🐾 PetcareHub365 Server started on port 5001 in development mode`
`MongoDB Connected: ...`

---

### 3. Khởi chạy Frontend / Mobile App (`petcarehub365_mma`)

Để ứng dụng chạy mượt mà trên Thiết bị thật (qua ứng dụng Expo Go) hoặc trên Emulator (Trình giả lập), Expo cần biết chính xác địa chỉ IP mạng nội bộ (LAN) của máy tính bạn. 

Chúng tôi đã tối ưu hóa quy trình này bằng script `auto-start.js` tự động lấy IP và cập nhật `.env`:

Mở một terminal mới và chạy:

```bash
# 1. Di chuyển vào thư mục mobile app
cd petcarehub365_mma

# 2. Khởi chạy ứng dụng
npm run dev
```

**Script sẽ tự động thực hiện:**
1.  Quét cấu hình mạng bằng lệnh `ipconfig` để lấy địa chỉ IPv4 hiện tại của bạn.
2.  Tự động cập nhật vào file [petcarehub365_mma/.env](file:///d:/PetcareHub/Petcarehub365-main/petcarehub365_mma/.env) (`EXPO_PUBLIC_API_URL=http://<IP_CUA_BAN>:5001/api/v1`).
3.  Khởi chạy Expo CLI với cờ reset cache (`npx expo start -c`).

---

## 📱 Cách xem & Thử nghiệm ứng dụng

Sau khi khởi chạy Expo thành công ở bước 3, màn hình terminal sẽ hiển thị một mã QR Code:

1.  **Dành cho Điện thoại thật (iOS/Android):**
    *   Cài đặt ứng dụng **Expo Go** từ App Store hoặc Google Play Store.
    *   Kết nối điện thoại của bạn vào **cùng một mạng WiFi** với máy tính đang chạy server.
    *   Mở camera điện thoại quét mã QR (iOS) hoặc dùng ứng dụng Expo Go để quét mã QR (Android).
2.  **Dành cho Trình giả lập (Emulator/Simulator):**
    *   Nhấn phím `a` trên terminal để chạy trên Trình giả lập Android.
    *   Nhấn phím `i` trên terminal để chạy trên Trình giả lập iOS.
3.  **Dành cho Web:**
    *   Nhấn phím `w` để mở phiên bản Web trên trình duyệt.

Chúc bạn có những trải nghiệm tuyệt vời cùng PetcareHub365! 🐾
