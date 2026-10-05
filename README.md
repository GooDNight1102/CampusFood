<div align="center">

# 🍜 CampusFood

**Đặt món nhanh — Ăn ngon tại trường**

Nền tảng đặt đồ ăn trực tuyến cho căng tin trường học: sinh viên và giảng viên chốt món, chọn giờ nhận, thanh toán tiện lợi — không còn xếp hàng dài giữa giờ ra chơi.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Trạng thái:** Demo / Đồ án — deploy tại [https://goodnight1102.github.io/CampusFood/CampusFood/](https://goodnight1102.github.io/CampusFood/CampusFood/)

</div>

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tính năng](#2-tính-năng)
3. [Stack công nghệ](#3-stack-công-nghệ)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Cài đặt Local](#5-cài-đặt-local)
6. [Dữ liệu & LocalStorage](#6-dữ-liệu--localstorage)
7. [Tài khoản demo](#7-tài-khoản-demo)
8. [Deploy Production](#8-deploy-production)
9. [Testing & QA](#9-testing--qa)
10. [Troubleshooting](#10-troubleshooting)
11. [Changelog](#11-changelog)
12. [Bảo mật - Cần đọc](#12-bảo-mật---cần-đọc)
13. [License & Credits](#13-license--credits)

---

## 1. Giới thiệu

**CampusFood** là ứng dụng web đặt đồ ăn tại căng tin trường học, viết bằng **HTML, CSS và JavaScript thuần** — không framework, không build tool. Toàn bộ dữ liệu lưu trong `localStorage`, nên ứng dụng chạy hoàn toàn phía client, không cần backend.

Phù hợp cho:
- 🎓 Đồ án môn học **Web Development / UI-UX**
- 🧪 Mẫu thử cho dự án thương mại điện tử nhỏ
- 📚 Học về **PWA, LocalStorage, điều hướng kiểu SPA**
- 🚀 Demo nhanh cho startup F&B, căng tin, quán ăn trong trường

---

## 2. Tính năng

### Sinh viên / Giảng viên (Customer)
- Đăng ký / đăng nhập theo vai trò
- Xem thực đơn, tìm kiếm tức thì (debounced), lọc theo danh mục: Đồ ăn, Đồ uống, Ăn vặt, Bán chạy, Món mới
- Sắp xếp theo giá, đánh giá, độ phổ biến
- Giỏ hàng thông minh: gợi ý món ăn kèm, áp mã giảm giá
- Chọn giờ nhận: khung giờ gợi ý hoặc tự nhập giờ bất kỳ
- Hai hình thức nhận món: **Tự đến lấy** / **Giao tận nơi** (kèm địa chỉ)
- Món yêu thích (nhấn tim để lưu)
- Theo dõi đơn bằng **mã đơn + số điện thoại** (không cần đăng nhập)
- Đánh giá món sau khi nhận hàng
- **Ví CampusFood**: nạp tiền demo, thanh toán một chạm
- Dark mode, cài đặt thông báo, ngôn ngữ

### Nhân viên căng tin (Staff)
- Tiếp nhận và cập nhật trạng thái đơn hàng
- Quản lý món (bật / tắt món đang bán)

### Quản trị viên (Admin)
- Quản lý thực đơn, danh mục, người dùng
- Quản lý mã giảm giá
- Theo dõi đơn hàng và doanh thu

> ✏️ *Mục Nhân viên / Admin: chỉnh lại cho khớp đúng các màn hình thực tế của nhóm.*

### Kỹ thuật
- ⚡ **PWA** — cài được như app thật trên điện thoại
- 📴 **Offline-first** với Service Worker
- 🎯 **Zero dependencies** — không cần Node.js, Webpack hay tool build nào
- ♿ **Accessibility** — `aria-label`, điều hướng bằng bàn phím
- 🌐 **SEO-friendly** — meta description, semantic HTML
- 📱 Responsive 100% từ mobile → desktop, skeleton loading

---

## 3. Stack công nghệ

- **Giao diện:** HTML5, CSS3 thuần (không Tailwind / Bootstrap)
- **Logic:** JavaScript ES6+ thuần (Vanilla JS)
- **Lưu trữ:** `localStorage` (trình duyệt)
- **Offline / cài đặt:** Service Worker + Web App Manifest (PWA)
- **Deploy:** GitHub Pages (hoặc bất kỳ static hosting nào: Vercel, Netlify...)

---

## 4. Cấu trúc thư mục

```text
CampusFood/
├── index.html              # Trang chính
├── manifest.json           # Cấu hình PWA (tên app, icon, màu)
├── sw.js                   # Service Worker (cache offline)
├── css/
│   └── style.css           # Global styles + dark mode
├── js/
│   ├── app.js              # Khởi tạo, điều hướng
│   ├── auth.js             # Đăng ký / đăng nhập / phân quyền
│   ├── menu.js             # Thực đơn, tìm kiếm, lọc, sắp xếp
│   ├── cart.js             # Giỏ hàng, mã giảm giá
│   ├── order.js            # Đặt món, theo dõi đơn
│   └── storage.js          # Đọc / ghi localStorage + seed data
├── assets/
│   ├── images/             # Ảnh món ăn
│   └── icons/              # Icon PWA
├── LICENSE
└── README.md
```

> ✏️ *Cập nhật cây thư mục cho đúng tên file thực tế trong repo.*

---

## 5. Cài đặt Local

### Yêu cầu
- Một trình duyệt hiện đại (Chrome, Edge, Firefox, Safari)
- (Khuyến nghị) **VS Code** + extension **Live Server**
- **Không** cần Node.js, npm hay database

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/goodnight1102/CampusFood.git
cd CampusFood

# 2. Chạy
#   Cách A: Double-click index.html (chạy được, nhưng Service Worker/PWA sẽ KHÔNG hoạt động)
#   Cách B (khuyến nghị): VS Code → chuột phải index.html → "Open with Live Server"
#   Cách C: Dùng server tĩnh bất kỳ, ví dụ:
python -m http.server 8080
#   hoặc
npx serve .
```

Sau khi chạy:
- Live Server: [http://127.0.0.1:5500](http://127.0.0.1:5500)
- Python: [http://localhost:8080](http://localhost:8080)

> **Lưu ý:** Service Worker chỉ hoạt động trên `http://localhost` hoặc `https://`. Mở bằng `file://` thì app vẫn chạy nhưng không cài PWA / không offline được.

---

## 6. Dữ liệu & LocalStorage

Dự án không có backend nên **không có biến môi trường**. Mọi dữ liệu (tài khoản, thực đơn, giỏ hàng, đơn hàng, ví, đánh giá) nằm trong `localStorage` của trình duyệt.

- Lần đầu mở app, dữ liệu mẫu (seed data) được tạo tự động.
- Dữ liệu **riêng cho từng trình duyệt / thiết bị** — đặt món trên điện thoại sẽ không thấy trên máy tính.
- Xoá dữ liệu: DevTools (F12) → **Application** → **Local Storage** → chọn domain → **Clear**, rồi F5 để seed lại.
- Dung lượng `localStorage` giới hạn khoảng **5 MB** / domain → tránh lưu ảnh base64 lớn.

---

## 7. Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 🎓 Sinh viên | `sv1@hvpn.edu.vn` | `123456` |
| 👨‍🏫 Giảng viên | `gv1@vwa.edu.vn` | `123456` |
| 🍳 Nhân viên căng tin | `staff@vwa.edu.vn` | `staff123` |
| ⚙️ Quản trị viên | `admin@vwa.edu.vn` | `admin123` |

> **Lưu ý:** Đây là tài khoản demo nằm trong seed data phía client — chỉ dùng để chấm / trình diễn. Xem mục [12. Bảo mật](#12-bảo-mật---cần-đọc).

---

## 8. Deploy Production

Vì là site tĩnh, chỉ cần đưa thư mục chứa `index.html` lên static hosting.

### GitHub Pages (đang dùng)
1. Push code lên GitHub
2. Repo → **Settings** → **Pages**
3. Source: **Deploy from a branch** → chọn branch `main`, thư mục `/ (root)`
4. Bấm **Save**, chờ 1-2 phút → truy cập `https://<username>.github.io/<repo>/`

> Nếu `index.html` nằm trong thư mục con (vd. `CampusFood/CampusFood/`), URL sẽ có thêm đường dẫn đó. Nên đưa `index.html` lên root repo cho URL gọn hơn.

### Vercel / Netlify (tuỳ chọn)
1. Import repo trên [https://vercel.com](https://vercel.com) hoặc [https://netlify.com](https://netlify.com)
2. Framework: **Other** (không có build)
3. Build command: *để trống*, Output directory: thư mục chứa `index.html`
4. Deploy

### Kiểm tra PWA sau khi deploy
- Mở site bằng Chrome → F12 → **Application** → **Manifest** / **Service Workers** phải không báo lỗi
- Trên điện thoại: menu trình duyệt → **Thêm vào màn hình chính**

---

## 9. Testing & QA

### QA Checklist thủ công (trước khi nộp / demo)

**Sinh viên / Giảng viên:**
- [ ] Đăng ký tài khoản mới, đăng nhập được
- [ ] Tìm kiếm món, lọc theo danh mục, sắp xếp theo giá / đánh giá
- [ ] Thêm món vào giỏ, tăng / giảm số lượng, thấy gợi ý món ăn kèm
- [ ] Áp mã giảm giá hợp lệ → giảm tiền; mã sai → báo lỗi
- [ ] Chọn khung giờ gợi ý và tự nhập giờ
- [ ] Đặt đơn **Tự đến lấy** và **Giao tận nơi** (bắt buộc nhập địa chỉ)
- [ ] Nạp tiền ví demo, thanh toán bằng ví, số dư giảm đúng
- [ ] Tra cứu đơn bằng mã đơn + SĐT khi chưa đăng nhập
- [ ] Đánh giá món sau khi nhận hàng
- [ ] Thả tim món yêu thích, xem lại trong danh sách

**Nhân viên / Admin:**
- [ ] Đăng nhập đúng vai trò, thấy đúng menu chức năng
- [ ] Cập nhật trạng thái đơn, phía khách thấy thay đổi
- [ ] Bật / tắt món, thực đơn cập nhật

**PWA & Mobile:**
- [ ] Cài được app lên màn hình chính
- [ ] Tắt mạng → mở lại app vẫn hiển thị
- [ ] Dark mode hiển thị đúng ở mọi trang
- [ ] Layout không vỡ ở màn hình 360px
- [ ] Điều hướng được bằng bàn phím (Tab / Enter)

---

## 10. Troubleshooting

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| Không cài được PWA / không chạy offline | Mở bằng `file://` | Chạy qua Live Server hoặc `python -m http.server` |
| Sửa code nhưng trình duyệt vẫn hiện bản cũ | Service Worker đang cache | F12 → Application → Service Workers → **Unregister**, rồi Ctrl+Shift+R |
| Dữ liệu lỗi / không đăng nhập được tài khoản demo | `localStorage` cũ không khớp cấu trúc mới | Xoá Local Storage của domain rồi F5 để seed lại |
| Đơn đặt trên điện thoại không thấy trên máy tính | Dữ liệu lưu riêng từng trình duyệt | Bình thường — app không có backend |
| `QuotaExceededError` | `localStorage` vượt ~5 MB | Không lưu ảnh base64 lớn; xoá dữ liệu cũ |
| Mất dữ liệu khi dùng tab ẩn danh | Ẩn danh xoá storage khi đóng tab | Dùng tab thường |
| GitHub Pages báo 404 | Sai thư mục publish / chưa bật Pages | Kiểm tra Settings → Pages, đường dẫn tới `index.html` |

---

## 11. Changelog

### v1.0.0
- Phát hành bản đầu tiên: thực đơn, giỏ hàng, đặt món, ví CampusFood, theo dõi đơn, đánh giá, PWA, dark mode.

> ✏️ *Bổ sung các phiên bản / bản sửa lỗi tiếp theo theo mẫu trên.*

---

## 12. Bảo mật - Cần đọc

### Giới hạn của kiến trúc hiện tại
CampusFood chạy **100% phía client**, nên:
- Mật khẩu và dữ liệu lưu trong `localStorage` → ai mở DevTools cũng xem / sửa được (kể cả số dư ví, vai trò Admin).
- Phân quyền chỉ ở giao diện, **không** thực sự bảo vệ dữ liệu.
- Ví CampusFood và thanh toán là **demo**, không xử lý tiền thật.

➡️ **Không dùng cho môi trường thật** với dữ liệu cá nhân hay tiền thật.

### Đã làm tốt
- Validate input phía client (email, SĐT, giờ nhận, địa chỉ giao)
- Semantic HTML + aria-label
- Không phụ thuộc thư viện bên thứ ba → ít rủi ro supply-chain

### Backlog (nếu phát triển thành sản phẩm thật)
- Thêm backend (Node.js / Express) + database (MongoDB, PostgreSQL...)
- Hash mật khẩu (bcrypt) + xác thực JWT phía server
- Kiểm tra phân quyền và số dư ví ở server
- Tích hợp cổng thanh toán thật (VietQR, MoMo...)
- Rate-limit đăng nhập

---

## 13. License & Credits

**MIT License** — tự do sử dụng, sửa đổi, phân phối. Xem file [LICENSE](./LICENSE).

**Credits:**
- Badges: [shields.io](https://shields.io)
- Hướng dẫn PWA: [web.dev](https://web.dev/progressive-web-apps/)
- Hạ tầng: GitHub Pages

---

<div align="center">

*Made with ❤️ for students — 2026 CampusFood*

</div>
