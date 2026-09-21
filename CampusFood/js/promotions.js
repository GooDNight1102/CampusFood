/* =========================================================
   CampusFood — promotions.js
   Voucher / mã giảm giá, khung giờ Flash Sale, gợi ý món ăn kèm.
   ========================================================= */

const CF_VOUCHERS = [
  { code: 'CF20K',    label: 'Giảm 20.000đ',  desc: 'Áp dụng cho đơn từ 100.000đ', type: 'fixed',   value: 20000, minOrder: 100000 },
  { code: 'FREESHIP', label: 'Miễn phí dịch vụ', desc: 'Miễn phí phí dịch vụ cho đơn từ 50.000đ', type: 'fixed', value: 3000, minOrder: 50000 },
  { code: 'GIAM10',   label: 'Giảm 10%',      desc: 'Giảm tối đa 15.000đ, đơn từ 60.000đ', type: 'percent', value: 10, maxDiscount: 15000, minOrder: 60000 },
  { code: 'SINHVIEN', label: 'Giảm 5.000đ',   desc: 'Dành riêng cho sinh viên, đơn từ 30.000đ', type: 'fixed', value: 5000, minOrder: 30000 },
];

function cfGetVoucherByCode(code){
  if (!code) return null;
  return CF_VOUCHERS.find(v => v.code.toLowerCase() === String(code).trim().toLowerCase()) || null;
}

/* Tính số tiền giảm của 1 voucher trên 1 mức tạm tính cho trước.
   Trả về 0 nếu chưa đủ điều kiện (chưa đạt đơn tối thiểu). */
function cfCalcVoucherDiscount(voucher, subtotal){
  if (!voucher || subtotal < voucher.minOrder) return 0;
  if (voucher.type === 'fixed') return Math.min(voucher.value, subtotal);
  if (voucher.type === 'percent'){
    const raw = Math.round(subtotal * voucher.value / 100);
    return Math.min(raw, voucher.maxDiscount || raw);
  }
  return 0;
}

/* Flash Sale: các món đang có "oldPrice" (giá gạch) được gom vào khung giờ
   vàng, đếm ngược ~3 giờ kể từ lúc mở trang (mô phỏng khung giờ đang chạy).
   Không gồm combo — combo đã có mục riêng, tránh trùng lặp. */
function cfGetFlashSaleProducts(){
  return cfGetProducts().filter(p => p.oldPrice && p.oldPrice > p.price && p.category !== 'combo');
}

const CF_FLASH_SALE_KEY = 'cf_flash_sale_end';
function cfGetFlashSaleEndTime(){
  let end = sessionStorage.getItem(CF_FLASH_SALE_KEY);
  if (!end || new Date(end) < new Date()){
    end = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // +3 giờ từ lúc mở trang
    sessionStorage.setItem(CF_FLASH_SALE_KEY, end);
  }
  return new Date(end);
}

/* Gợi ý "món ăn kèm" ở trang giỏ hàng — ưu tiên đồ uống/ăn vặt chưa có trong giỏ. */
function cfGetCartAddonSuggestions(limit){
  limit = limit || 6;
  const cart = cfGetCart();
  const inCart = new Set(cart.items.map(i => i.productId));
  const candidates = cfGetProducts().filter(p =>
    p.category !== 'mon' && p.category !== 'combo' && p.stock > 0 && !inCart.has(p.id));
  return candidates.sort((a, b) => b.sold - a.sold).slice(0, limit);
}
