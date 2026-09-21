/* =========================================================
   CampusFood — products.js
   Danh mục sản phẩm demo + helper đọc/ghi localStorage.
   ========================================================= */

const CF_PRODUCTS_KEY = 'cf_products';

/* Trường "image": đường dẫn tới file ảnh, ví dụ 'images/food/com-ga-sot-cay.jpg'.
   Để trống ('') nếu chưa có ảnh — khi đó món sẽ hiển thị icon minh hoạ như hiện tại.
   Trường "oldPrice" (không bắt buộc): giá gốc trước giảm, dùng để hiện giá gạch.
   Trường "sizes"/"toppings" (không bắt buộc): tuỳ chọn khi xem chi tiết món.
   Xem hướng dẫn thêm ảnh trong images/README.md hoặc phần chat đã hướng dẫn. */
const CF_SIZES_UONG_LON = [
  { id: 'M', label: 'Vừa (M)', delta: 0 },
  { id: 'L', label: 'Lớn (L)', delta: 5000 },
];
const CF_TOPPINGS_COM_GA = [
  { id: 'trung', label: 'Trứng ốp la', price: 5000 },
  { id: 'xucxich', label: 'Xúc xích', price: 8000 },
];
const CF_TOPPINGS_PHO = [
  { id: 'bo-tai', label: 'Thêm thịt bò tái', price: 10000 },
  { id: 'trung-tran', label: 'Trứng trần', price: 5000 },
];

const CF_DEFAULT_PRODUCTS = [
  // ---- Đồ ăn (mon) ----
  { id: 'MON01', name: 'Cơm gà sốt cay', category: 'mon', price: 35000, oldPrice: 42000, desc: 'Ức gà chiên giòn phủ sốt cay ngọt, ăn kèm dưa leo.', rating: 4.8, sold: 214, stock: 18, badge: 'bestseller', image: 'images/food/com-ga-sot-cay.jpg', toppings: CF_TOPPINGS_COM_GA },
  { id: 'MON02', name: 'Cơm rang dưa bò', category: 'mon', price: 40000, desc: 'Cơm rang thơm dưa chua, thịt bò xào săn.', rating: 4.6, sold: 156, stock: 12, badge: '', image: 'images/food/com-rang-dua-bo.jpg' },
  { id: 'MON03', name: 'Mì xào bò', category: 'mon', price: 35000, desc: 'Mì trứng xào lửa lớn cùng bò và rau củ giòn.', rating: 4.5, sold: 132, stock: 0, badge: '', image: 'images/food/mi-xao-bo.jpg' },
  { id: 'MON04', name: 'Phở bò', category: 'mon', price: 40000, oldPrice: 48000, desc: 'Nước dùng ninh xương 6 tiếng, bánh phở mềm.', rating: 4.9, sold: 268, stock: 20, badge: 'bestseller', image: 'images/food/pho-bo.jpg', toppings: CF_TOPPINGS_PHO },
  { id: 'MON05', name: 'Bún chả', category: 'mon', price: 35000, desc: 'Chả nướng than hoa, nước chấm chua ngọt chuẩn vị.', rating: 4.7, sold: 98, stock: 14, badge: 'new', image: 'images/food/bun-cha.jpg' },
  { id: 'MON06', name: 'Bánh mì thịt', category: 'mon', price: 25000, desc: 'Bánh mì giòn, pate béo, thịt nguội và đồ chua.', rating: 4.4, sold: 187, stock: 25, badge: '', image: 'images/food/banh-mi-thit.jpg' },
  // ---- Đồ uống (uong) ----
  { id: 'UONG01', name: 'Trà đào', category: 'uong', price: 25000, oldPrice: 30000, desc: 'Trà ô long lạnh cùng đào ngâm giòn ngọt.', rating: 4.7, sold: 201, stock: 30, badge: 'bestseller', image: 'images/uong/tra-dao.jpg', sizes: CF_SIZES_UONG_LON },
  { id: 'UONG02', name: 'Trà chanh', category: 'uong', price: 15000, desc: 'Vị chua thanh, giải khát nhanh giữa giờ nghỉ.', rating: 4.3, sold: 176, stock: 40, badge: '', image: 'images/uong/tra-chanh.webp', sizes: CF_SIZES_UONG_LON },
  { id: 'UONG03', name: 'Trà tắc', category: 'uong', price: 15000, desc: 'Trà tắc mật ong, thơm the mát dịu.', rating: 4.2, sold: 89, stock: 22, badge: '', image: 'images/uong/tra-tac.webp' },
  { id: 'UONG04', name: 'Cà phê sữa', category: 'uong', price: 25000, oldPrice: 30000, desc: 'Cà phê phin truyền thống, sữa đặc béo ngậy.', rating: 4.8, sold: 233, stock: 26, badge: 'bestseller', image: 'images/uong/ca-phe-sua.jpg', sizes: CF_SIZES_UONG_LON },
  { id: 'UONG05', name: 'Nước cam', category: 'uong', price: 25000, desc: 'Cam vắt nguyên chất, không đường thêm.', rating: 4.5, sold: 64, stock: 15, badge: 'new', image: 'images/uong/nuoc-cam.jpg' },
  { id: 'UONG06', name: 'Coca Cola', category: 'uong', price: 15000, desc: 'Lon 330ml ướp lạnh sẵn.', rating: 4.1, sold: 145, stock: 50, badge: '', image: 'images/uong/coca-cola.webp' },
  // ---- Đồ ăn vặt (vat) ----
  { id: 'VAT01', name: 'Khoai tây chiên', category: 'vat', price: 25000, desc: 'Khoai chiên giòn rụm, chấm tương ớt phô mai.', rating: 4.6, sold: 178, stock: 20, badge: '', image: 'images/vat/khoai-tay-chien.jpg' },
  { id: 'VAT02', name: 'Xúc xích', category: 'vat', price: 15000, desc: 'Xúc xích chiên xiên que, ăn nhanh gọn.', rating: 4.2, sold: 121, stock: 0, badge: '', image: 'images/vat/xuc-xich.jpg' },
  { id: 'VAT03', name: 'Cá viên chiên', category: 'vat', price: 20000, desc: 'Cá viên giòn dai, chấm tương ớt sa tế.', rating: 4.4, sold: 143, stock: 18, badge: '', image: 'images/vat/ca-vien-chien.jpg' },
  { id: 'VAT04', name: 'Nem chua rán', category: 'vat', price: 25000, oldPrice: 30000, desc: 'Nem chua chiên vàng, chua nhẹ cay nồng.', rating: 4.7, sold: 96, stock: 10, badge: 'new', image: 'images/vat/nem-chua-ran.jpg' },
  { id: 'VAT05', name: 'Gà viên', category: 'vat', price: 25000, desc: 'Viên gà chiên giòn bên ngoài, mềm bên trong.', rating: 4.5, sold: 88, stock: 16, badge: '', image: 'images/vat/ga-vien.jpg' },
  { id: 'VAT06', name: 'Bánh ngọt', category: 'vat', price: 20000, desc: 'Bánh bông lan phủ kem tươi nhẹ nhàng.', rating: 4.3, sold: 71, stock: 12, badge: '', image: 'images/vat/banh-ngot.jpeg' },
  // ---- Combo tiết kiệm (combo) — món "ảo" ghép từ 2 món có sẵn, chạy chung mọi luồng giỏ hàng/đơn hàng ----
  { id: 'COMBO01', name: 'Combo Cơm gà + Trà đào', category: 'combo', price: 52000, oldPrice: 60000, desc: 'Gồm: Cơm gà sốt cay + Trà đào size M. Tiết kiệm 8.000đ so với mua lẻ.', rating: 4.8, sold: 64, stock: 999, badge: 'bestseller', image: 'images/food/com-ga-sot-cay.jpg' },
  { id: 'COMBO02', name: 'Combo Phở bò + Cà phê sữa', category: 'combo', price: 58000, oldPrice: 65000, desc: 'Gồm: Phở bò + Cà phê sữa size M. Tiết kiệm 7.000đ so với mua lẻ.', rating: 4.7, sold: 51, stock: 999, badge: '', image: 'images/food/pho-bo.jpg' },
  { id: 'COMBO03', name: 'Combo Bánh mì + Trà tắc', category: 'combo', price: 35000, oldPrice: 40000, desc: 'Gồm: Bánh mì thịt + Trà tắc. Tiết kiệm 5.000đ so với mua lẻ.', rating: 4.6, sold: 39, stock: 999, badge: 'new', image: 'images/food/banh-mi-thit.jpg' },
];

function cfFormatVND(n){
  return n.toLocaleString('vi-VN') + '\u00A0đ';
}

/* Số phiên bản dữ liệu sản phẩm — tăng số này mỗi khi cập nhật dữ liệu demo
   (thêm ảnh, giá khuyến mãi, combo, size/topping...) để tự động bổ sung cho
   những ai đã mở trang từ trước, mà KHÔNG ghi đè lên trường nào admin đã tự
   chỉnh sửa (chỉ điền vào những trường còn thiếu). */
const CF_PRODUCTS_VERSION = 3;
const CF_PRODUCTS_VERSION_KEY = 'cf_products_version';
const CF_PRODUCTS_MERGE_FIELDS = ['image', 'oldPrice', 'sizes', 'toppings', 'gallery'];

function cfInitProducts(){
  const storedVersion = localStorage.getItem(CF_PRODUCTS_VERSION_KEY);
  if (!localStorage.getItem(CF_PRODUCTS_KEY)){
    localStorage.setItem(CF_PRODUCTS_KEY, JSON.stringify(CF_DEFAULT_PRODUCTS));
    localStorage.setItem(CF_PRODUCTS_VERSION_KEY, String(CF_PRODUCTS_VERSION));
    return;
  }
  if (String(storedVersion) !== String(CF_PRODUCTS_VERSION)){
    let products = [];
    try { products = JSON.parse(localStorage.getItem(CF_PRODUCTS_KEY)) || []; } catch(e){ products = []; }
    CF_DEFAULT_PRODUCTS.forEach(defaultP => {
      const idx = products.findIndex(p => p.id === defaultP.id);
      if (idx >= 0){
        CF_PRODUCTS_MERGE_FIELDS.forEach(key => {
          if (products[idx][key] === undefined && defaultP[key] !== undefined) products[idx][key] = defaultP[key];
        });
      } else {
        products.push(defaultP);
      }
    });
    localStorage.setItem(CF_PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(CF_PRODUCTS_VERSION_KEY, String(CF_PRODUCTS_VERSION));
  }
}

function cfGetProducts(){
  cfInitProducts();
  const list = JSON.parse(localStorage.getItem(CF_PRODUCTS_KEY));
  // Đảm bảo món nào lưu từ trước (chưa có trường "image") vẫn hoạt động bình thường.
  return list.map(p => ({ image: '', ...p }));
}

function cfSaveProducts(list){
  localStorage.setItem(CF_PRODUCTS_KEY, JSON.stringify(list));
}

function cfGetProductById(id){
  return cfGetProducts().find(p => p.id === id);
}

function cfCategoryLabel(cat){
  return { mon: 'Đồ ăn', uong: 'Đồ uống', vat: 'Đồ ăn vặt', combo: 'Combo tiết kiệm' }[cat] || cat;
}

/* Icon dùng cho từng danh mục khi làm ảnh placeholder (xem CF_ICONS trong main.js) */
function cfCategoryIconKey(cat){
  return { mon: 'bowl', uong: 'cup', vat: 'fries', combo: 'ticket' }[cat] || 'bowl';
}

function cfCategoryThumbClass(cat){
  return { mon: 'mon', uong: 'uong', vat: 'vat', combo: 'combo' }[cat] || 'mon';
}
