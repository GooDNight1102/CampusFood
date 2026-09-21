<div align="center">

# 🍜 CampusFood

**Đặt món nhanh — Ăn ngon tại trường**

Nền tảng đặt đồ ăn trực tuyến dành cho căng tin trường học, giúp sinh viên và giảng viên chốt món, chọn giờ nhận, thanh toán tiện lợi — không còn xếp hàng dài giữa giờ ra chơi.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[Tính năng](#-tính-năng) · [Demo](#-demo) · [Cài đặt](#-cài-đặt) · [Cấu trúc](#-cấu-trúc-dự-án) · [Công nghệ](#-công-nghệ-sử-dụng) · [Triển khai](#-triển-khai)

</div>

---

## 📖 Giới thiệu

**CampusFood** là một ứng dụng web đặt đồ ăn tại căng tin trường học, được xây dựng bằng **HTML, CSS và JavaScript thuần** (không cần framework, không cần build tool). Toàn bộ dữ liệu được lưu trong `localStorage`, giúp ứng dụng chạy hoàn toàn ở client mà không cần backend.

Dự án phù hợp cho:
- 🎓 Đồ án môn học về **Web Development / UI-UX**
- 🧪 Mẫu thử nghiệm cho các dự án thương mại điện tử nhỏ
- 📚 Học tập về **PWA, LocalStorage, SPA-like navigation**
- 🚀 Demo nhanh cho các startup F&B, căng tin, quán ăn trong trường

---

## ✨ Tính năng

### 👤 Người dùng
- 🔐 **Đăng ký / Đăng nhập** với phân quyền: Sinh viên, Giảng viên, Nhân viên, Admin
- 🛒 **Giỏ hàng thông minh** với gợi ý món ăn kèm, mã giảm giá
- ⏰ **Chọn thời gian linh hoạt** — chọn nhanh khung giờ gợi ý hoặc tự nhập giờ bất kỳ
- 🛵 **Hai hình thức nhận món**: Tự đến lấy / Giao tận nơi (kèm địa chỉ)
- ❤️ **Món yêu thích** — nhấn tim để lưu, xem lại bất cứ lúc nào
- 📦 **Theo dõi đơn hàng** bằng mã đơn + số điện thoại (không cần login)
- ⭐ **Đánh giá món ăn** sau khi nhận hàng
- 💳 **Ví CampusFood** — nạp tiền demo, thanh toán một chạm
- 🎨 **Dark mode** + cài đặt thông báo, ngôn ngữ

### 🍽️ Thực đơn
- 🔍 Tìm kiếm tức thì (debounced)
- 🏷️ Lọc theo danh mục: Đồ ăn, Đồ uống, Ăn vặt, Bán chạy, Món mới
- 📊 Sắp xếp theo giá, đánh giá, độ phổ biến
- 🖼️ Skeleton loading mượt mà
- 📱 Responsive 100% từ mobile → desktop

### 🚀 Kỹ thuật
- ⚡ **PWA** — cài được như app thật trên điện thoại
- 📴 **Offline-first** với Service Worker
- 🎯 **Zero dependencies** — không cần Node.js, Webpack, hay bất kỳ tool nào
- ♿ **Accessibility** — aria-label, keyboard navigation
- 🌐 **SEO-friendly** — meta description, semantic HTML

---

## 🎬 Demo

> 🚧 **Đang cập nhật** — Link demo sẽ được thêm sau khi deploy lên Netlify/GitHub Pages.

**Tài khoản demo:**

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 🎓 Sinh viên | `sv1@hvpn.edu.vn` | `123456` |
| 👨‍🏫 Giảng viên | `gv1@vwa.edu.vn` | `123456` |
| 🍳 Nhân viên căn tin | `staff@vwa.edu.vn` | `staff123` |
| ⚙️ Quản trị viên | `admin@vwa.edu.vn` | `admin123` |

---

## 🚀 Cài đặt

### Cách 1 — Chạy trực tiếp (đơn giản nhất)

```bash
# Clone dự án
git clone https://github.com/USERNAME/campusfood.git
cd campusfood

# Mở bằng trình duyệt
# Cách A: Double-click vào index.html
# Cách B: Dùng VS Code + Live Server (khuyến nghị)
