-- =========================================================================
-- CAMPUSFOOD — CƠ SỞ DỮ LIỆU (MySQL 8.0+, InnoDB, utf8mb4)
-- =========================================================================
-- Khớp 1-1 với dữ liệu demo đang chạy trên giao diện (js/products.js,
-- js/auth.js, js/orders.js) — dùng để nhóm DEV kết nối backend thật sau này
-- (PHP + MySQL hoặc Java Servlet/JSP + MySQL, đúng như Project Charter).
--
-- CÁCH IMPORT:
--   - phpMyAdmin: tạo database rỗng "campusfood" > tab Import > chọn file này.
--   - Dòng lệnh:   mysql -u root -p < campusfood.sql
--   - NetBeans/MySQL Workbench: mở file này và chạy toàn bộ (Execute Script).
--
-- LƯU Ý BẢO MẬT: cột mat_khau ở đây lưu dạng CHUỖI THƯỜNG chỉ để tiện demo/
-- test nhanh. Khi nối vào backend thật, PHẢI băm mật khẩu bằng
-- password_hash() (PHP) hoặc bcrypt (Java/Node) trước khi lưu — không bao
-- giờ lưu mật khẩu dạng thường trong dự án thật.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS campusfood
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusfood;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS danh_gia;
DROP TABLE IF EXISTS vi_giao_dich;
DROP TABLE IF EXISTS don_hang_chi_tiet;
DROP TABLE IF EXISTS don_hang;
DROP TABLE IF EXISTS mon_an;
DROP TABLE IF EXISTS danh_muc;
DROP TABLE IF EXISTS nguoi_dung;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 1. NGƯỜI DÙNG — dùng chung cho cả 4 vai trò, phân biệt qua cột vai_tro
--    (đúng theo Class Diagram gốc: "NguoiDung ... phân biệt qua vaiTro")
-- =========================================================================
CREATE TABLE nguoi_dung (
  id             VARCHAR(20)  NOT NULL PRIMARY KEY,
  ho_ten         VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  so_dien_thoai  VARCHAR(15),
  mat_khau       VARCHAR(255) NOT NULL,
  vai_tro        ENUM('student','teacher','staff','admin') NOT NULL,
  so_du_vi       DECIMAL(12,0) NOT NULL DEFAULT 0,        -- Ví CampusFood
  avatar_chu     CHAR(1),                                  -- chữ cái đại diện hiển thị avatar

  -- Chỉ dùng khi vai_tro = 'student'
  mssv           VARCHAR(20),
  lop            VARCHAR(30),
  khoa           VARCHAR(100),

  -- Chỉ dùng khi vai_tro = 'teacher'
  ma_gv          VARCHAR(20),
  khoa_bo_mon    VARCHAR(100),

  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Quy tắc domain email theo vai trò (sinh viên @hvpn.edu.vn, còn lại @vwa.edu.vn)
  CONSTRAINT chk_email_domain CHECK (
    (vai_tro = 'student' AND email LIKE '%@hvpn.edu.vn') OR
    (vai_tro <> 'student' AND email LIKE '%@vwa.edu.vn')
  ),
  INDEX idx_vai_tro (vai_tro)
) ENGINE=InnoDB;

-- =========================================================================
-- 2. DANH MỤC & MÓN ĂN
-- =========================================================================
CREATE TABLE danh_muc (
  id   VARCHAR(10)  NOT NULL PRIMARY KEY,   -- 'mon' | 'uong' | 'vat'
  ten  VARCHAR(50)  NOT NULL
) ENGINE=InnoDB;

CREATE TABLE mon_an (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,
  ten_mon      VARCHAR(150) NOT NULL,
  danh_muc_id  VARCHAR(10)  NOT NULL,
  gia          DECIMAL(12,0) NOT NULL,
  mo_ta        VARCHAR(500),
  ton_kho      INT NOT NULL DEFAULT 0,
  da_ban       INT NOT NULL DEFAULT 0,
  danh_gia_tb  DECIMAL(2,1) NOT NULL DEFAULT 0,
  nhan         ENUM('','bestseller','new') NOT NULL DEFAULT '',
  dang_ban     TINYINT(1)  NOT NULL DEFAULT 1,   -- quản trị có thể ẩn món (ngừng bán) mà không cần xoá hẳn
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mon_danh_muc FOREIGN KEY (danh_muc_id) REFERENCES danh_muc(id),
  INDEX idx_danh_muc (danh_muc_id),
  INDEX idx_da_ban (da_ban)
) ENGINE=InnoDB;

-- =========================================================================
-- 3. ĐƠN HÀNG
-- =========================================================================
CREATE TABLE don_hang (
  id              VARCHAR(20)  NOT NULL PRIMARY KEY,   -- mã đơn, vd CF20260914001
  nguoi_dung_id   VARCHAR(20)  NULL,                    -- NULL = khách vãng lai
  ten_khach       VARCHAR(100) NOT NULL,
  sdt_khach       VARCHAR(15),
  tam_tinh        DECIMAL(12,0) NOT NULL,
  phi_dich_vu     DECIMAL(12,0) NOT NULL DEFAULT 3000,
  tong_tien       DECIMAL(12,0) NOT NULL,
  khung_gio_nhan  VARCHAR(30)  NOT NULL,
  phuong_thuc_tt  ENUM('cod','ewallet','campuswallet') NOT NULL,
  trang_thai_tt   ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  trang_thai      ENUM('placed','confirmed','preparing','ready','done','cancelled') NOT NULL DEFAULT 'placed',
  uu_tien_gv      TINYINT(1) NOT NULL DEFAULT 0,        -- đơn của giảng viên -> ưu tiên xử lý
  ly_do_huy       VARCHAR(255),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_don_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE don_hang_chi_tiet (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  don_hang_id  VARCHAR(20)  NOT NULL,
  mon_an_id    VARCHAR(20)  NOT NULL,
  ten_mon_luu  VARCHAR(150) NOT NULL,   -- lưu lại tên món tại thời điểm đặt
  gia_luu      DECIMAL(12,0) NOT NULL,  -- lưu lại giá tại thời điểm đặt (không đổi dù giá món sau này thay đổi)
  so_luong     INT NOT NULL,
  CONSTRAINT fk_ct_don_hang FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_ct_mon_an   FOREIGN KEY (mon_an_id)   REFERENCES mon_an(id),
  INDEX idx_don_hang (don_hang_id)
) ENGINE=InnoDB;

-- =========================================================================
-- 4. VÍ CAMPUSFOOD — LỊCH SỬ GIAO DỊCH (nạp tiền / thanh toán / hoàn tiền)
-- =========================================================================
CREATE TABLE vi_giao_dich (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nguoi_dung_id  VARCHAR(20) NOT NULL,
  loai           ENUM('topup','payment','refund') NOT NULL,
  so_tien        DECIMAL(12,0) NOT NULL,   -- âm nếu là 'payment'
  ghi_chu        VARCHAR(255),
  don_hang_id    VARCHAR(20) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vi_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
  CONSTRAINT fk_vi_don_hang   FOREIGN KEY (don_hang_id)   REFERENCES don_hang(id),
  INDEX idx_vi_nguoi_dung (nguoi_dung_id)
) ENGINE=InnoDB;

-- =========================================================================
-- 5. ĐÁNH GIÁ MÓN ĂN (sau khi đơn ở trạng thái 'done')
-- =========================================================================
CREATE TABLE danh_gia (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  don_hang_id    VARCHAR(20) NOT NULL UNIQUE,   -- mỗi đơn chỉ đánh giá 1 lần
  nguoi_dung_id  VARCHAR(20) NULL,
  so_sao         TINYINT NOT NULL,
  binh_luan      VARCHAR(500),
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dg_don_hang    FOREIGN KEY (don_hang_id)    REFERENCES don_hang(id),
  CONSTRAINT fk_dg_nguoi_dung  FOREIGN KEY (nguoi_dung_id)  REFERENCES nguoi_dung(id),
  CONSTRAINT chk_so_sao CHECK (so_sao BETWEEN 1 AND 5)
) ENGINE=InnoDB;


-- =========================================================================
-- DỮ LIỆU MẪU — khớp đúng với dữ liệu demo trên giao diện (localStorage)
-- =========================================================================

-- ---- 1. Danh mục ----
INSERT INTO danh_muc (id, ten) VALUES
  ('mon',  'Đồ ăn'),
  ('uong', 'Đồ uống'),
  ('vat',  'Đồ ăn vặt');

-- ---- 2. Người dùng (mật khẩu demo ghi rõ trong ghi chú, KHÔNG dùng thật) ----
-- sv1@hvpn.edu.vn   / 123456   | gv1@vwa.edu.vn    / 123456
-- staff@vwa.edu.vn  / staff123 | admin@vwa.edu.vn  / admin123
INSERT INTO nguoi_dung
  (id, ho_ten, email, so_dien_thoai, mat_khau, vai_tro, so_du_vi, avatar_chu, mssv, lop, khoa, ma_gv, khoa_bo_mon, created_at)
VALUES
  ('U-SV001', 'Trần Minh Anh',   'sv1@hvpn.edu.vn',  '0901234567', '123456',   'student', 250000, 'M', 'SV20241234', 'CNTT16A', 'Công nghệ thông tin', NULL, NULL, '2026-08-01'),
  ('U-GV001', 'Nguyễn Thị Hạnh', 'gv1@vwa.edu.vn',   '0912345678', '123456',   'teacher', 500000, 'H', NULL, NULL, NULL, 'GV0089', 'Bộ môn Công nghệ phần mềm', '2026-07-20'),
  ('U-ST001', 'Lê Văn Khoa',     'staff@vwa.edu.vn', '0987654321', 'staff123', 'staff',        0, 'K', NULL, NULL, NULL, NULL, NULL, '2026-07-01'),
  ('U-AD001', 'Phạm Quốc Đạt',   'admin@vwa.edu.vn', '0977889900', 'admin123', 'admin',        0, 'Đ', NULL, NULL, NULL, NULL, NULL, '2026-07-01');

-- ---- 3. Món ăn (18 món — khớp js/products.js) ----
INSERT INTO mon_an (id, ten_mon, danh_muc_id, gia, mo_ta, ton_kho, da_ban, danh_gia_tb, nhan) VALUES
  ('MON01',  'Cơm gà sốt cay',      'mon',  35000, 'Ức gà chiên giòn phủ sốt cay ngọt, ăn kèm dưa leo.',        18, 214, 4.8, 'bestseller'),
  ('MON02',  'Cơm rang dưa bò',     'mon',  40000, 'Cơm rang thơm dưa chua, thịt bò xào săn.',                   12, 156, 4.6, ''),
  ('MON03',  'Mì xào bò',           'mon',  35000, 'Mì trứng xào lửa lớn cùng bò và rau củ giòn.',                0, 132, 4.5, ''),
  ('MON04',  'Phở bò',              'mon',  40000, 'Nước dùng ninh xương 6 tiếng, bánh phở mềm.',                20, 268, 4.9, 'bestseller'),
  ('MON05',  'Bún chả',             'mon',  35000, 'Chả nướng than hoa, nước chấm chua ngọt chuẩn vị.',          14,  98, 4.7, 'new'),
  ('MON06',  'Bánh mì thịt',        'mon',  25000, 'Bánh mì giòn, pate béo, thịt nguội và đồ chua.',             25, 187, 4.4, ''),
  ('UONG01', 'Trà đào',             'uong', 25000, 'Trà ô long lạnh cùng đào ngâm giòn ngọt.',                   30, 201, 4.7, 'bestseller'),
  ('UONG02', 'Trà chanh',           'uong', 15000, 'Vị chua thanh, giải khát nhanh giữa giờ nghỉ.',              40, 176, 4.3, ''),
  ('UONG03', 'Trà tắc',             'uong', 15000, 'Trà tắc mật ong, thơm the mát dịu.',                         22,  89, 4.2, ''),
  ('UONG04', 'Cà phê sữa',          'uong', 25000, 'Cà phê phin truyền thống, sữa đặc béo ngậy.',                26, 233, 4.8, 'bestseller'),
  ('UONG05', 'Nước cam',            'uong', 25000, 'Cam vắt nguyên chất, không đường thêm.',                     15,  64, 4.5, 'new'),
  ('UONG06', 'Coca Cola',           'uong', 15000, 'Lon 330ml ướp lạnh sẵn.',                                    50, 145, 4.1, ''),
  ('VAT01',  'Khoai tây chiên',     'vat',  25000, 'Khoai chiên giòn rụm, chấm tương ớt phô mai.',               20, 178, 4.6, ''),
  ('VAT02',  'Xúc xích',            'vat',  15000, 'Xúc xích chiên xiên que, ăn nhanh gọn.',                      0, 121, 4.2, ''),
  ('VAT03',  'Cá viên chiên',       'vat',  20000, 'Cá viên giòn dai, chấm tương ớt sa tế.',                     18, 143, 4.4, ''),
  ('VAT04',  'Nem chua rán',        'vat',  25000, 'Nem chua chiên vàng, chua nhẹ cay nồng.',                    10,  96, 4.7, 'new'),
  ('VAT05',  'Gà viên',             'vat',  25000, 'Viên gà chiên giòn bên ngoài, mềm bên trong.',               16,  88, 4.5, ''),
  ('VAT06',  'Bánh ngọt',           'vat',  20000, 'Bánh bông lan phủ kem tươi nhẹ nhàng.',                      12,  71, 4.3, '');

-- ---- 4. Đơn hàng mẫu (để trang Dashboard / Doanh thu / Đơn hàng có dữ liệu để xem ngay) ----
INSERT INTO don_hang
  (id, nguoi_dung_id, ten_khach, sdt_khach, tam_tinh, phi_dich_vu, tong_tien, khung_gio_nhan, phuong_thuc_tt, trang_thai_tt, trang_thai, uu_tien_gv, created_at)
VALUES
  ('CF20260913001', 'U-SV001', 'Trần Minh Anh',   '0901234567', 60000, 3000, 63000, '11:00 - 11:15', 'campuswallet', 'paid',    'done',       0, '2026-09-13 10:42:00'),
  ('CF20260913002', 'U-GV001', 'Nguyễn Thị Hạnh', '0912345678', 65000, 3000, 68000, '11:15 - 11:30', 'ewallet',      'paid',    'done',       1, '2026-09-13 11:05:00'),
  ('CF20260914001', 'U-SV001', 'Trần Minh Anh',   '0901234567', 35000, 3000, 38000, '11:30 - 11:45', 'cod',          'pending', 'preparing',  0, '2026-09-14 10:20:00'),
  ('CF20260914002', 'U-GV001', 'Nguyễn Thị Hạnh', '0912345678', 40000, 3000, 43000, '11:45 - 12:00', 'campuswallet', 'paid',    'confirmed',  1, '2026-09-14 10:31:00'),
  ('CF20260914003', NULL,      'Khách vãng lai',  '0900001111', 45000, 3000, 48000, '12:00 - 12:15', 'cod',          'pending', 'placed',     0, '2026-09-14 10:55:00');

INSERT INTO don_hang_chi_tiet (don_hang_id, mon_an_id, ten_mon_luu, gia_luu, so_luong) VALUES
  ('CF20260913001', 'MON01',  'Cơm gà sốt cay', 35000, 1),
  ('CF20260913001', 'UONG01', 'Trà đào',        25000, 1),
  ('CF20260913002', 'MON04',  'Phở bò',         40000, 1),
  ('CF20260913002', 'UONG04', 'Cà phê sữa',     25000, 1),
  ('CF20260914001', 'MON05',  'Bún chả',        35000, 1),
  ('CF20260914002', 'MON02',  'Cơm rang dưa bò',40000, 1),
  ('CF20260914003', 'MON06',  'Bánh mì thịt',   25000, 1),
  ('CF20260914003', 'VAT01',  'Khoai tây chiên',25000, 1);

-- ---- 5. Lịch sử giao dịch ví (khớp với các đơn thanh toán bằng Ví CampusFood ở trên) ----
INSERT INTO vi_giao_dich (nguoi_dung_id, loai, so_tien, ghi_chu, don_hang_id, created_at) VALUES
  ('U-SV001', 'payment', -63000, 'Thanh toán đơn hàng',       'CF20260913001', '2026-09-13 10:42:00'),
  ('U-GV001', 'payment', -43000, 'Thanh toán đơn hàng',       'CF20260914002', '2026-09-14 10:31:00'),
  ('U-SV001', 'topup',   200000, 'Nạp tiền vào ví (demo)',    NULL,            '2026-09-10 09:00:00');

-- ---- 6. Đánh giá món ăn (cho đơn đã ở trạng thái 'done') ----
INSERT INTO danh_gia (don_hang_id, nguoi_dung_id, so_sao, binh_luan, created_at) VALUES
  ('CF20260913001', 'U-SV001', 5, 'Sốt cay vừa miệng, gà giòn, giao đúng giờ hẹn.',                '2026-09-13 12:00:00'),
  ('CF20260913002', 'U-GV001', 5, 'Nước dùng đậm đà, không phải xếp hàng lâu như trước.',           '2026-09-13 12:10:00');


-- =========================================================================
-- VIEW HỖ TRỢ TRANG QUẢN TRỊ (Dashboard / Báo cáo doanh thu)
-- =========================================================================

-- Doanh thu & số đơn theo từng ngày (bỏ qua đơn đã huỷ) — dùng cho biểu đồ doanh thu
CREATE OR REPLACE VIEW v_doanh_thu_theo_ngay AS
SELECT
  DATE(created_at) AS ngay,
  COUNT(*)         AS so_don,
  SUM(tong_tien)   AS doanh_thu
FROM don_hang
WHERE trang_thai <> 'cancelled'
GROUP BY DATE(created_at)
ORDER BY ngay DESC;

-- Món bán chạy nhất — dùng cho khối "Món bán chạy" ở Dashboard/Báo cáo doanh thu
CREATE OR REPLACE VIEW v_mon_ban_chay AS
SELECT id, ten_mon, danh_muc_id, gia, da_ban, danh_gia_tb
FROM mon_an
WHERE dang_ban = 1
ORDER BY da_ban DESC;

-- Đơn đang cần xử lý, ưu tiên đơn giảng viên lên đầu — dùng cho khu Quản lý đơn hàng
CREATE OR REPLACE VIEW v_don_dang_xu_ly AS
SELECT *
FROM don_hang
WHERE trang_thai NOT IN ('done','cancelled')
ORDER BY uu_tien_gv DESC, created_at DESC;

-- Thống kê nhanh cho thẻ số liệu trên Dashboard (doanh thu/số đơn hôm nay...)
CREATE OR REPLACE VIEW v_thong_ke_hom_nay AS
SELECT
  (SELECT COALESCE(SUM(tong_tien),0) FROM don_hang WHERE DATE(created_at) = CURDATE() AND trang_thai <> 'cancelled') AS doanh_thu_hom_nay,
  (SELECT COUNT(*) FROM don_hang WHERE DATE(created_at) = CURDATE()) AS so_don_hom_nay,
  (SELECT COUNT(*) FROM don_hang WHERE trang_thai NOT IN ('done','cancelled')) AS don_dang_xu_ly,
  (SELECT COUNT(*) FROM nguoi_dung WHERE vai_tro IN ('student','teacher')) AS tong_sv_gv;
