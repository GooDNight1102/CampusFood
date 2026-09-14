/* =========================================================
   CampusFood — cart.js
   Giỏ hàng lưu trong localStorage, dùng chung cho khách & tài khoản.
   ========================================================= */

const CF_CART_KEY = 'cf_cart';
const CF_SERVICE_FEE = 3000;

function cfGetCart(){
  const raw = localStorage.getItem(CF_CART_KEY);
  return raw ? JSON.parse(raw) : { items: [], pickupSlot: '' };
}
function cfSaveCart(cart){
  localStorage.setItem(CF_CART_KEY, JSON.stringify(cart));
  cfUpdateCartBadge();
}

function cfCartCount(){
  return cfGetCart().items.reduce((sum, it) => sum + it.qty, 0);
}

function cfAddToCart(productId, qty = 1){
  const product = cfGetProductById(productId);
  if (!product || product.stock <= 0) return { ok:false, message:'Món này đã hết hàng.' };
  const cart = cfGetCart();
  const existing = cart.items.find(i => i.productId === productId);
  const currentQty = existing ? existing.qty : 0;
  if (currentQty + qty > product.stock){
    return { ok:false, message:'Không đủ tồn kho cho số lượng này.' };
  }
  if (existing){ existing.qty += qty; } else { cart.items.push({ productId, qty }); }
  cfSaveCart(cart);
  return { ok:true };
}

function cfUpdateCartQty(productId, qty){
  const product = cfGetProductById(productId);
  const cart = cfGetCart();
  const item = cart.items.find(i => i.productId === productId);
  if (!item) return { ok:false };
  if (qty <= 0){
    cart.items = cart.items.filter(i => i.productId !== productId);
  } else if (product && qty > product.stock){
    return { ok:false, message:'Vượt quá số lượng tồn kho.' };
  } else {
    item.qty = qty;
  }
  cfSaveCart(cart);
  return { ok:true };
}

function cfRemoveFromCart(productId){
  const cart = cfGetCart();
  cart.items = cart.items.filter(i => i.productId !== productId);
  cfSaveCart(cart);
}

function cfClearCart(){
  cfSaveCart({ items: [], pickupSlot: '' });
}

function cfCartDetailed(){
  const cart = cfGetCart();
  return cart.items.map(i => ({ ...i, product: cfGetProductById(i.productId) })).filter(i => i.product);
}

function cfCartSubtotal(){
  return cfCartDetailed().reduce((sum, i) => sum + i.product.price * i.qty, 0);
}

function cfCartTotal(){
  const items = cfCartDetailed();
  if (items.length === 0) return 0;
  return cfCartSubtotal() + CF_SERVICE_FEE;
}

function cfUpdateCartBadge(){
  const el = document.querySelector('[data-cart-badge]');
  if (!el) return;
  const count = cfCartCount();
  el.textContent = count > 9 ? '9+' : count;
  el.style.display = count > 0 ? 'flex' : 'none';
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
    return;
  }
  if (empty) empty.style.display = 'none';
  if (summaryWrap) summaryWrap.style.display = 'block';

  body.innerHTML = items.map(i => `
    <tr data-row="${i.productId}">
      <td>
        <div class="cell-product">
          <div class="cell-thumb" style="background:linear-gradient(135deg,${cfThumbGradient(i.product.category)})">
            ${CF_ICONS[cfCategoryIconKey(i.product.category)]}
          </div>
          <div>
            <div style="font-weight:700;">${i.product.name}</div>
            <div class="text-muted" style="font-size:12px;">${cfCategoryLabel(i.product.category)}</div>
          </div>
        </div>
      </td>
      <td>${cfFormatVND(i.product.price)}</td>
      <td>
        <div class="qty-stepper">
          <button type="button" data-dec="${i.productId}" aria-label="Giảm số lượng">−</button>
          <span>${i.qty}</span>
          <button type="button" data-inc="${i.productId}" aria-label="Tăng số lượng">+</button>
        </div>
      </td>
      <td style="font-weight:800;">${cfFormatVND(i.product.price * i.qty)}</td>
      <td><a href="#" class="remove-link" data-remove="${i.productId}">Xoá</a></td>
    </tr>
  `).join('');

  // Gắn sự kiện
  body.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
    const it = cfGetCart().items.find(x => x.productId === b.dataset.inc);
    const res = cfUpdateCartQty(b.dataset.inc, (it ? it.qty : 0) + 1);
    if (!res.ok) cfToast(res.message || 'Không thể cập nhật.', 'error');
    cfRenderCartPage();
  }));
  body.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
    const it = cfGetCart().items.find(x => x.productId === b.dataset.dec);
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
}

function cfRenderCartGradientHelper(){ /* placeholder kept for clarity, see cfThumbGradient in main.js */ }

function cfRenderCartSummary(){
  const subtotal = cfCartSubtotal();
  const total = cfCartTotal();
  const elSub = document.getElementById('sum-subtotal');
  const elFee = document.getElementById('sum-fee');
  const elTotal = document.getElementById('sum-total');
  if (elSub) elSub.textContent = cfFormatVND(subtotal);
  if (elFee) elFee.textContent = cfFormatVND(CF_SERVICE_FEE);
  if (elTotal) elTotal.textContent = cfFormatVND(total);

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
