/* =========================================================
   CampusFood — checkout.js
   ========================================================= */

let CF_SELECTED_PAYMENT = 'cod';

function cfRenderCheckoutPage(){
  const items = cfCartDetailed();
  const cart = cfGetCart();
  if (items.length === 0){
    window.location.href = 'cart.html';
    return;
  }

  const listEl = document.getElementById('checkout-items');
  if (listEl){
    listEl.innerHTML = items.map(i => `
      <div class="ticket-row">
        <span class="name">${i.product.name} <span class="qty">x${i.qty}</span>${i.optionsText ? `<br><span style="font-weight:400;font-size:11.5px;color:var(--ink-50);">${i.optionsText}</span>` : ''}</span>
        <span>${cfFormatVND(i.unitPrice * i.qty)}</span>
      </div>`).join('');
  }
  const slotEl = document.getElementById('checkout-slot');
  if (slotEl) slotEl.textContent = cart.pickupSlot || 'Chưa chọn';

  const elSub = document.getElementById('co-subtotal');
  const elFee = document.getElementById('co-fee');
  const elTotal = document.getElementById('co-total');
  if (elSub) elSub.textContent = cfFormatVND(cfCartSubtotal());
  if (elFee) elFee.textContent = cfFormatVND(CF_SERVICE_FEE);
  if (elTotal) elTotal.textContent = cfFormatVND(cfCartTotal());

  const user = cfCurrentUser();
  const guestFields = document.getElementById('guest-fields');
  if (guestFields) guestFields.style.display = user ? 'none' : 'block';

  const priorityNote = document.getElementById('priority-note');
  if (priorityNote) priorityNote.style.display = (user && user.role === 'teacher') ? 'flex' : 'none';

  const walletCard = document.getElementById('pay-campuswallet');
  const walletSub = document.getElementById('wallet-balance-sub');
  if (walletCard){
    if (!user){
      walletCard.classList.add('disabled');
      walletCard.querySelector('input').disabled = true;
      if (walletSub) walletSub.textContent = 'Đăng nhập để dùng Ví CampusFood';
    } else if (walletSub){
      walletSub.textContent = `Số dư khả dụng: ${cfFormatVND(user.walletBalance)}`;
    }
  }

  document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', () => {
      const input = card.querySelector('input[type=radio]');
      if (!input || input.disabled) return;
      document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      input.checked = true;
      CF_SELECTED_PAYMENT = input.value;
    });
  });

  const form = document.getElementById('checkout-form');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      cfSubmitOrder();
    });
  }
}

function cfSubmitOrder(){
  const user = cfCurrentUser();
  const opts = { paymentMethod: CF_SELECTED_PAYMENT };
  if (!user){
    const name = document.getElementById('guest-name');
    const phone = document.getElementById('guest-phone');
    if (phone && !phone.value.trim()){
      phone.closest('.field').classList.add('has-error');
      return;
    }
    opts.guestName = name ? name.value.trim() : '';
    opts.guestPhone = phone ? phone.value.trim() : '';
  }

  if (CF_SELECTED_PAYMENT === 'ewallet'){
    cfShowQrPaymentModal(opts);
    return;
  }

  const res = cfCreateOrder(opts);
  if (!res.ok){
    cfToast(res.message, 'error');
    return;
  }
  window.location.href = 'order-success.html?code=' + res.order.code;
}

/* Mô phỏng thanh toán QR (MoMo/ZaloPay/VNPay) trước khi tạo đơn */
function cfShowQrPaymentModal(opts){
  const overlay = document.getElementById('qr-pay-modal');
  const amountEl = document.getElementById('qr-pay-amount');
  if (amountEl) amountEl.textContent = cfFormatVND(cfCartTotal());
  overlay.classList.add('open');

  const confirmBtn = document.getElementById('qr-pay-confirm');
  const cancelBtn = document.getElementById('qr-pay-cancel');
  const newConfirm = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
  newConfirm.addEventListener('click', () => {
    overlay.classList.remove('open');
    const res = cfCreateOrder(opts);
    if (!res.ok){ cfToast(res.message, 'error'); return; }
    window.location.href = 'order-success.html?code=' + res.order.code;
  });
  cancelBtn.onclick = () => overlay.classList.remove('open');
}
