/* =========================================================
   CampusFood — products.js
   Danh mục sản phẩm demo + helper đọc/ghi localStorage.
   ========================================================= */

const CF_PRODUCTS_KEY = 'cf_products';

const CF_DEFAULT_PRODUCTS = [
  // ---- Đồ ăn (mon) ----
  { id: 'MON01', name: 'Cơm gà sốt cay', category: 'mon', price: 35000, desc: 'Ức gà chiên giòn phủ sốt cay ngọt, ăn kèm dưa leo.', rating: 4.8, sold: 214, stock: 18, badge: 'bestseller' },
  { id: 'MON02', name: 'Cơm rang dưa bò', category: 'mon', price: 40000, desc: 'Cơm rang thơm dưa chua, thịt bò xào săn.', rating: 4.6, sold: 156, stock: 12, badge: '' },
  { id: 'MON03', name: 'Mì xào bò', category: 'mon', price: 35000, desc: 'Mì trứng xào lửa lớn cùng bò và rau củ giòn.', rating: 4.5, sold: 132, stock: 0, badge: '' },
  { id: 'MON04', name: 'Phở bò', category: 'mon', price: 40000, desc: 'Nước dùng ninh xương 6 tiếng, bánh phở mềm.', rating: 4.9, sold: 268, stock: 20, badge: 'bestseller' },
  { id: 'MON05', name: 'Bún chả', category: 'mon', price: 35000, desc: 'Chả nướng than hoa, nước chấm chua ngọt chuẩn vị.', rating: 4.7, sold: 98, stock: 14, badge: 'new' },
  { id: 'MON06', name: 'Bánh mì thịt', category: 'mon', price: 25000, desc: 'Bánh mì giòn, pate béo, thịt nguội và đồ chua.', rating: 4.4, sold: 187, stock: 25, badge: '' },
  // ---- Đồ uống (uong) ----
  { id: 'UONG01', name: 'Trà đào', category: 'uong', price: 25000, desc: 'Trà ô long lạnh cùng đào ngâm giòn ngọt.', rating: 4.7, sold: 201, stock: 30, badge: 'bestseller' },
  { id: 'UONG02', name: 'Trà chanh', category: 'uong', price: 15000, desc: 'Vị chua thanh, giải khát nhanh giữa giờ nghỉ.', rating: 4.3, sold: 176, stock: 40, badge: '' },
  { id: 'UONG03', name: 'Trà tắc', category: 'uong', price: 15000, desc: 'Trà tắc mật ong, thơm the mát dịu.', rating: 4.2, sold: 89, stock: 22, badge: '' },
  { id: 'UONG04', name: 'Cà phê sữa', category: 'uong', price: 25000, desc: 'Cà phê phin truyền thống, sữa đặc béo ngậy.', rating: 4.8, sold: 233, stock: 26, badge: 'bestseller' },
  { id: 'UONG05', name: 'Nước cam', category: 'uong', price: 25000, desc: 'Cam vắt nguyên chất, không đường thêm.', rating: 4.5, sold: 64, stock: 15, badge: 'new' },
  { id: 'UONG06', name: 'Coca Cola', category: 'uong', price: 15000, desc: 'Lon 330ml ướp lạnh sẵn.', rating: 4.1, sold: 145, stock: 50, badge: '' },
  // ---- Đồ ăn vặt (vat) ----
  { id: 'VAT01', name: 'Khoai tây chiên', category: 'vat', price: 25000, desc: 'Khoai chiên giòn rụm, chấm tương ớt phô mai.', rating: 4.6, sold: 178, stock: 20, badge: '' },
  { id: 'VAT02', name: 'Xúc xích', category: 'vat', price: 15000, desc: 'Xúc xích chiên xiên que, ăn nhanh gọn.', rating: 4.2, sold: 121, stock: 0, badge: '' },
  { id: 'VAT03', name: 'Cá viên chiên', category: 'vat', price: 20000, desc: 'Cá viên giòn dai, chấm tương ớt sa tế.', rating: 4.4, sold: 143, stock: 18, badge: '' },
  { id: 'VAT04', name: 'Nem chua rán', category: 'vat', price: 25000, desc: 'Nem chua chiên vàng, chua nhẹ cay nồng.', rating: 4.7, sold: 96, stock: 10, badge: 'new' },
  { id: 'VAT05', name: 'Gà viên', category: 'vat', price: 25000, desc: 'Viên gà chiên giòn bên ngoài, mềm bên trong.', rating: 4.5, sold: 88, stock: 16, badge: '' },
  { id: 'VAT06', name: 'Bánh ngọt', category: 'vat', price: 20000, desc: 'Bánh bông lan phủ kem tươi nhẹ nhàng.', rating: 4.3, sold: 71, stock: 12, badge: '' },
];

function cfFormatVND(n){
  return n.toLocaleString('vi-VN') + '\u00A0đ';
}

function cfInitProducts(){
  if (!localStorage.getItem(CF_PRODUCTS_KEY)){
    localStorage.setItem(CF_PRODUCTS_KEY, JSON.stringify(CF_DEFAULT_PRODUCTS));
  }
}

function cfGetProducts(){
  cfInitProducts();
  return JSON.parse(localStorage.getItem(CF_PRODUCTS_KEY));
}

function cfSaveProducts(list){
  localStorage.setItem(CF_PRODUCTS_KEY, JSON.stringify(list));
}

function cfGetProductById(id){
  return cfGetProducts().find(p => p.id === id);
}

function cfCategoryLabel(cat){
  return { mon: 'Đồ ăn', uong: 'Đồ uống', vat: 'Đồ ăn vặt' }[cat] || cat;
}

/* Icon dùng cho từng danh mục khi làm ảnh placeholder (xem CF_ICONS trong main.js) */
function cfCategoryIconKey(cat){
  return { mon: 'bowl', uong: 'cup', vat: 'fries' }[cat] || 'bowl';
}

function cfCategoryThumbClass(cat){
  return { mon: 'mon', uong: 'uong', vat: 'vat' }[cat] || 'mon';
}
