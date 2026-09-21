/* =========================================================
   CampusFood — cart.js
   Giỏ hàng lưu trong localStorage, dùng chung cho khách & tài khoản.
   Hỗ trợ tuỳ chọn size/topping (mỗi tổ hợp khác nhau là 1 dòng riêng)
   và áp mã giảm giá.
   ========================================================= */

const CF_CART_KEY = 'cf_cart';
const CF_SERVICE_FEE = 3000;

function cfGetCart(){
  const raw = localStorage.getItem(CF_CART_KEY);
  const cart = raw ? JSON.parse(raw) : { items: [], pickupSlot: '', voucherCode: '' };
  if (cart.voucherCode === undefined) cart.voucherCode = '';
  // Tương thích ngược: giỏ hàng lưu từ trước khi có tuỳ chọn size/topping
  // chưa có "lineId" — tự bổ sung để các nút tăng/giảm/xoá vẫn hoạt động đúng.
  cart.items = cart.items.map(i => i.lineId ? i : { ...i, lineId: cfBuildLineId(i.productId, i.options), options: i.options || {} });
  return cart;
}
function cfSaveCart(cart){
  localStorage.setItem(CF_CART_KEY, JSON.stringify(cart));
  cfUpdateCartBadge();
}

function cfCartCount(){
  return cfGetCart().items.reduce((sum, it) => sum + it.qty, 0);
}

/* Ghép id tuỳ chọn thành 1 chuỗi để phân biệt các dòng giỏ hàng của cùng
   1 món nhưng khác size/topping — vd MON01|trung,xucxich hay UONG01|L */
function cfBuildLineId(productId, options){
  const o = options || {};
  const topStr = (o.toppingIds || []).slice().sort().join(',');
  return [productId, o.sizeId || '', topStr].join('|');
}

/* Đơn giá thực tế của 1 dòng = giá gốc + chênh lệch size + tổng topping */
function cfLineUnitPrice(product, options){
  let price = product.price;
  const o = options || {};
  if (o.sizeId && product.sizes){
    const size = product.sizes.find(s => s.id === o.sizeId);
    if (size) price += size.delta;
  }
  if (o.toppingIds && product.toppings){
    o.toppingIds.forEach(tid => {
      const t = product.toppings.find(x => x.id === tid);
      if (t) price += t.price;
    });
  }
  return price;
}

function cfOptionsSummaryText(product, options){
  const o = options || {};
  const parts = [];
  if (o.sizeId && product.sizes){
    const size = product.sizes.find(s => s.id === o.sizeId);
    if (size) parts.push(size.label);
  }
  if (o.toppingIds && o.toppingIds.length && product.toppings){
    o.toppingIds.forEach(tid => {
      const t = product.toppings.find(x => x.id === tid);
      if (t) parts.push(t.label);
    });
  }
  return parts.join(' · ');
}

/* Tổng số lượng của 1 productId trong giỏ, cộng dồn mọi dòng size/topping khác nhau
   — dùng để kiểm tra tồn kho vì tồn kho tính theo món, không tính theo tuỳ chọn. */
function cfProductQtyInCart(productId, cart){
  cart = cart || cfGetCart();
  return cart.items.filter(i => i.productId === productId).reduce((s, i) => s + i.qty, 0);
}

function cfAddToCart(productId, qty, options){
  qty = qty || 1;
  const product = cfGetProductById(productId);
  if (!product || product.stock <= 0) return { ok:false, message:'Món này đã hết hàng.' };
  const cart = cfGetCart();
  const currentQty = cfProductQtyInCart(productId, cart);
  if (currentQty + qty > product.stock){
    return { ok:false, message:'Không đủ tồn kho cho số lượng này.' };
  }
  const lineId = cfBuildLineId(productId, options);
  const existing = cart.items.find(i => i.lineId === lineId);
  if (existing){ existing.qty += qty; }
  else { cart.items.push({ lineId, productId, qty, options: options || {} }); }
  cfSaveCart(cart);
  return { ok:true };
}

function cfUpdateCartQty(lineId, qty){
  const cart = cfGetCart();
  const item = cart.items.find(i => i.lineId === lineId);
  if (!item) return { ok:false };
  const product = cfGetProductById(item.productId);
  if (qty <= 0){
    cart.items = cart.items.filter(i => i.lineId !== lineId);
  } else {
    const otherQty = cfProductQtyInCart(item.productId, cart) - item.qty;
    if (product && otherQty + qty > product.stock){
      return { ok:false, message:'Vượt quá số lượng tồn kho.' };
    }
    item.qty = qty;
  }
  cfSaveCart(cart);
  return { ok:true };
}

function cfRemoveFromCart(lineId){
  const cart = cfGetCart();
  cart.items = cart.items.filter(i => i.lineId !== lineId);
  cfSaveCart(cart);
}

function cfClearCart(){
  cfSaveCart({ items: [], pickupSlot: '', voucherCode: '' });
}

function cfCartDetailed(){
  const cart = cfGetCart();
  return cart.items
    .map(i => {
      const product = cfGetProductById(i.productId);
      if (!product) return null;
      const unitPrice = cfLineUnitPrice(product, i.options);
      return { ...i, product, unitPrice, lineTotal: unitPrice * i.qty, optionsText: cfOptionsSummaryText(product, i.options) };
    })
    .filter(Boolean);
}

function cfCartSubtotal(){
  return cfCartDetailed().reduce((sum, i) => sum + i.lineTotal, 0);
}

/* ------------------- Voucher / mã giảm giá ------------------- */
function cfApplyVoucher(code){
  const voucher = cfGetVoucherByCode(code);
  if (!voucher) return { ok:false, message:'Mã giảm giá không tồn tại.' };
  const subtotal = cfCartSubtotal();
  if (subtotal < voucher.minOrder){
    return { ok:false, message:`Đơn cần từ ${cfFormatVND(voucher.minOrder)} để dùng mã này.` };
  }
  const cart = cfGetCart();
  cart.voucherCode = voucher.code;
  cfSaveCart(cart);
  return { ok:true, voucher };
}

function cfRemoveVoucher(){
  const cart = cfGetCart();
  cart.voucherCode = '';
  cfSaveCart(cart);
}

function cfCartDiscount(){
  const cart = cfGetCart();
  const voucher = cfGetVoucherByCode(cart.voucherCode);
  if (!voucher) return 0;
  return cfCalcVoucherDiscount(voucher, cfCartSubtotal());
}

function cfCartTotal(){
  const items = cfCartDetailed();
  if (items.length === 0) return 0;
  const total = cfCartSubtotal() + CF_SERVICE_FEE - cfCartDiscount();
  return Math.max(total, 0);
}

function cfUpdateCartBadge(){
  const el = document.querySelector('[data-cart-badge]');
  if (el){
    const count = cfCartCount();
    el.textContent = count > 9 ? '9+' : count;
    el.style.display = count > 0 ? 'flex' : 'none';
  }
  if (typeof cfRenderFloatingCart === 'function') cfRenderFloatingCart();
}

/* Khung giờ nhận món khả dụng (demo tĩnh) */
const CF_PICKUP_SLOTS = ['11:00 - 11:15','11:15 - 11:30','11:30 - 11:45','11:45 - 12:00','12:00 - 12:15','12:15 - 12:30'];

/* ------------------- Render trang cart.html ------------------- */
function cfRenderCartPage(){
  const body = document.getElementById('cart-body');
  const empty = document.getElementById('cart-empty');
  const summaryWrap = document.getElementById('cart-summary-wrap');
  const items = cfCartDetailed();

  if (items.length === 0){
    if (body) body.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (summaryWrap) summaryWrap.style.display = 'none';
    cfRenderCartAddons();
    return;
  }
  if (empty) empty.style.display = 'none';
  if (summaryWrap) summaryWrap.style.display = 'block';

  body.innerHTML = items.map(i => `
    <tr data-row="${i.lineId}">
      <td>
        <div class="cell-product">
          <div class="cell-thumb" style="background:linear-gradient(135deg,${cfThumbGradient(i.product.category)})">
            ${CF_ICONS[cfCategoryIconKey(i.product.category)]}
            ${i.product.image ? `<img class="thumb-img" src="${i.product.image}" alt="${i.product.name}" onerror="this.remove()">` : ''}
          </div>
          <div>
            <div style="font-weight:700;">${i.product.name}</div>
            <div class="text-muted" style="font-size:12px;">${i.optionsText || cfCategoryLabel(i.product.category)}</div>
          </div>
        </div>
      </td>
      <td>${cfFormatVND(i.unitPrice)}</td>
      <td>
        <div class="qty-stepper">
          <button type="button" data-dec="${i.lineId}" aria-label="Giảm số lượng">−</button>
          <span>${i.qty}</span>
          <button type="button" data-inc="${i.lineId}" aria-label="Tăng số lượng">+</button>
        </div>
      </td>
      <td style="font-weight:800;">${cfFormatVND(i.lineTotal)}</td>
      <td><a href="#" class="remove-link" data-remove="${i.lineId}">Xoá</a></td>
    </tr>
  `).join('');

  // Gắn sự kiện
  body.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
    const it = cfGetCart().items.find(x => x.lineId === b.dataset.inc);
    const res = cfUpdateCartQty(b.dataset.inc, (it ? it.qty : 0) + 1);
    if (!res.ok) cfToast(res.message || 'Không thể cập nhật.', 'error');
    cfRenderCartPage();
  }));
  body.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
    const it = cfGetCart().items.find(x => x.lineId === b.dataset.dec);
    cfUpdateCartQty(b.dataset.dec, (it ? it.qty : 0) - 1);
    cfRenderCartPage();
  }));
  body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    cfRemoveFromCart(b.dataset.remove);
    cfToast('Đã xoá món khỏi giỏ hàng.', 'success');
    cfRenderCartPage();
  }));

  cfRenderCartSummary();
  cfRenderCartAddons();
}

function cfRenderCartSummary(){
  const subtotal = cfCartSubtotal();
  const discount = cfCartDiscount();
  const total = cfCartTotal();
  const elSub = document.getElementById('sum-subtotal');
  const elFee = document.getElementById('sum-fee');
  const elTotal = document.getElementById('sum-total');
  const elDiscountRow = document.getElementById('sum-discount-row');
  const elDiscount = document.getElementById('sum-discount');
  if (elSub) elSub.textContent = cfFormatVND(subtotal);
  if (elFee) elFee.textContent = cfFormatVND(CF_SERVICE_FEE);
  if (elTotal) elTotal.textContent = cfFormatVND(total);
  if (elDiscountRow) elDiscountRow.style.display = discount > 0 ? 'flex' : 'none';
  if (elDiscount) elDiscount.textContent = '−' + cfFormatVND(discount);

  // Thanh tổng tiền nổi (mobile)
  const stickyCount = document.getElementById('sticky-cart-count');
  const stickyTotal = document.getElementById('sticky-cart-total');
  if (stickyCount) stickyCount.textContent = cfCartCount();
  if (stickyTotal) stickyTotal.textContent = cfFormatVND(total);

  cfRenderVoucherBox();

  // Khung giờ nhận món
  const slotWrap = document.getElementById('pickup-slots');
  if (slotWrap && !slotWrap.dataset.built){
    slotWrap.dataset.built = '1';
    const cart = cfGetCart();
    slotWrap.innerHTML = CF_PICKUP_SLOTS.map(s => `
      <button type="button" class="chip slot-chip ${cart.pickupSlot === s ? 'active' : ''}" data-slot="${s}">${s}</button>
    `).join('');
    slotWrap.querySelectorAll('[data-slot]').forEach(btn => btn.addEventListener('click', () => {
      const c = cfGetCart(); c.pickupSlot = btn.dataset.slot; cfSaveCart(c);
      slotWrap.querySelectorAll('.slot-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }));
  }
}

function cfRenderVoucherBox(){
  const wrap = document.getElementById('voucher-box');
  if (!wrap) return;
  const cart = cfGetCart();
  const voucher = cfGetVoucherByCode(cart.voucherCode);
  if (voucher){
    wrap.innerHTML = `
      <div class="voucher-applied">
        <span data-icon="ticket"></span>
        <div style="flex:1;">
          <b>${voucher.code}</b> — ${voucher.label}
          <div class="text-muted" style="font-size:12px;">${voucher.desc}</div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="voucher-remove">Bỏ</button>
      </div>`;
    cfFillIcons(wrap);
    document.getElementById('voucher-remove').addEventListener('click', () => {
      cfRemoveVoucher();
      cfToast('Đã bỏ mã giảm giá.', 'success');
      cfRenderCartPage();
    });
  } else {
    wrap.innerHTML = `
      <div class="voucher-input-row">
        <input type="text" id="voucher-code-input" placeholder="Nhập mã giảm giá">
        <button type="button" class="btn btn-dark btn-sm" id="voucher-apply">Áp dụng</button>
      </div>
      <div class="voucher-suggest">
        ${CF_VOUCHERS.map(v => `<button type="button" class="chip voucher-chip" data-voucher="${v.code}">${v.code}</button>`).join('')}
      </div>`;
    document.getElementById('voucher-apply').addEventListener('click', () => cfTryApplyVoucherFromInput());
    document.getElementById('voucher-code-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){ e.preventDefault(); cfTryApplyVoucherFromInput(); }
    });
    wrap.querySelectorAll('[data-voucher]').forEach(chip => chip.addEventListener('click', () => {
      document.getElementById('voucher-code-input').value = chip.dataset.voucher;
      cfTryApplyVoucherFromInput();
    }));
  }
}

function cfTryApplyVoucherFromInput(){
  const input = document.getElementById('voucher-code-input');
  const code = input ? input.value.trim() : '';
  if (!code){ cfToast('Vui lòng nhập mã giảm giá.', 'error'); return; }
  const res = cfApplyVoucher(code);
  if (!res.ok){ cfToast(res.message, 'error'); return; }
  cfToast(`Áp dụng mã ${res.voucher.code} thành công!`, 'success');
  cfRenderCartPage();
}

/* ------------------- "Món ăn kèm" gợi ý thêm ở giỏ hàng ------------------- */
function cfRenderCartAddons(){
  const wrap = document.getElementById('cart-addons');
  if (!wrap) return;
  const suggestions = cfGetCartAddonSuggestions(6);
  if (suggestions.length === 0){ wrap.innerHTML = ''; wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  wrap.innerHTML = `
    <h3 style="font-size:16px;margin-bottom:12px;">Thêm món ăn kèm?</h3>
    <div class="addon-scroll">
      ${suggestions.map(p => `
        <div class="addon-card">
          <div class="addon-thumb" style="background:linear-gradient(135deg,${cfThumbGradient(p.category)})">
            ${CF_ICONS[cfCategoryIconKey(p.category)]}
            ${p.image ? `<img class="thumb-img" src="${p.image}" alt="${p.name}" onerror="this.remove()">` : ''}
          </div>
          <div class="addon-name">${p.name}</div>
          <div class="addon-foot">
            <span class="addon-price">${cfFormatVND(p.price)}</span>
            <button class="add-btn" data-add="${p.id}" aria-label="Thêm">${CF_ICONS.plus}</button>
          </div>
        </div>
      `).join('')}
    </div>`;
  wrap.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => {
    const res = cfAddToCart(btn.dataset.add, 1);
    if (res.ok){ cfToast('Đã thêm vào giỏ hàng.', 'success'); cfRenderCartPage(); }
    else cfToast(res.message, 'error');
  }));
}
