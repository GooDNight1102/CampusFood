/* =========================================================
   CampusFood — wallet.js
   ========================================================= */

function cfRenderWalletPage(){
  const user = cfRequireLogin();
  if (!user) return;

  const balanceEl = document.getElementById('wallet-balance');
  if (balanceEl) balanceEl.textContent = cfFormatVND(user.walletBalance);

  cfRenderWalletHistory(user.id);

  const topupForm = document.getElementById('topup-form');
  if (topupForm){
    topupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountInput = document.getElementById('topup-amount');
      const amount = parseInt(amountInput.value.replace(/\D/g,''), 10);
      if (!amount || amount < 10000){
        cfToast('Vui lòng nhập số tiền nạp từ 10.000đ trở lên.', 'error');
        return;
      }
      const freshUser = cfCurrentUser();
      freshUser.walletBalance += amount;
      cfUpdateUser(freshUser);
      cfAddWalletTransaction(freshUser.id, { type:'topup', amount, note:'Nạp tiền vào ví (demo)' });
      cfToast('Nạp tiền thành công!', 'success');
      document.getElementById('topup-modal').classList.remove('open');
      amountInput.value = '';
      cfRenderWalletPage();
    });
  }

  document.querySelectorAll('[data-quick-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('topup-amount').value = btn.dataset.quickAmount;
    });
  });
}

function cfRenderWalletHistory(userId){
  const list = document.getElementById('wallet-history');
  if (!list) return;
  const tx = cfGetWalletTx(userId);
  if (tx.length === 0){
    list.innerHTML = `<div class="empty-state"><h3>Chưa có giao dịch</h3><p>Lịch sử nạp tiền, thanh toán và hoàn tiền sẽ hiện ở đây.</p></div>`;
    return;
  }
  const typeMeta = {
    topup: { label:'Nạp tiền', cls:'up' },
    payment: { label:'Thanh toán', cls:'down' },
    refund: { label:'Hoàn tiền', cls:'up' },
  };
  list.innerHTML = tx.map(t => {
    const meta = typeMeta[t.type] || { label:t.type, cls:'up' };
    const sign = t.amount > 0 ? '+' : '';
    const dt = new Date(t.at);
    return `
    <div class="rank-row">
      <div class="wtx-icon" style="background:${t.amount > 0 ? 'var(--success)' : 'var(--citrus-600)'};">${CF_ICONS.wallet}</div>
      <div style="flex:1;">
        <div class="rname">${meta.label} — ${t.note || ''}</div>
        <div class="text-muted" style="font-size:12px;">${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <div class="rval" style="color:${t.amount > 0 ? 'var(--success)' : 'var(--danger)'};font-size:14.5px;">${sign}${cfFormatVND(Math.abs(t.amount))}</div>
    </div>`;
  }).join('');
}
