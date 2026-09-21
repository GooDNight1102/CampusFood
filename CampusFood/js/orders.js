/* =========================================================
   CampusFood — orders.js
   Tạo đơn hàng, máy trạng thái, timeline theo dõi, tra cứu,
   lịch sử đơn hàng cho sinh viên/giảng viên.
   ========================================================= */

const CF_ORDERS_KEY = 'cf_orders';

const CF_STATUS_FLOW = ['placed','confirmed','preparing','ready','done'];
const CF_STATUS_LABEL = {
  placed: 'Đã đặt hàng',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready: 'Đã sẵn sàng',
  done: 'Đã nhận',
  cancelled: 'Đã huỷ',
};
const CF_STATUS_PILL = {
  placed: 'wait', confirmed: 'confirmed', preparing: 'preparing',
  ready: 'ready', done: 'done', cancelled: 'cancelled',
};

function cfOrderStatusLabel(s){ return CF_STATUS_LABEL[s] || s; }
function cfOrderStatusPillClass(s){ return CF_STATUS_PILL[s] || 'wait'; }

function cfGetOrders(){
  const raw = localStorage.getItem(CF_ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function cfSaveOrders(list){ localStorage.setItem(CF_ORDERS_KEY, JSON.stringify(list)); }

function cfGenOrderCode(){
  const d = new Date();
  const ymd = d.getFullYear().toString() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  const orders = cfGetOrders().filter(o => o.code.includes('CF' + ymd));
  const seq = String(orders.length + 1).padStart(3,'0');
  return 'CF' + ymd + seq;
}

/**
 * Tạo đơn hàng từ giỏ hàng hiện tại.
 * opts: { paymentMethod: 'cod'|'ewallet'|'campuswallet', guestName, guestPhone }
 */
function cfCreateOrder(opts){
  const items = cfCartDetailed();
  if (items.length === 0) return { ok:false, message:'Giỏ hàng đang trống.' };
  if (!cfGetCart().pickupSlot) return { ok:false, message:'Vui lòng chọn khung giờ nhận món.' };

  // Kiểm tra tồn kho lần cuối (UC-01, bước 7)
  const products = cfGetProducts();
  for (const it of items){
    const p = products.find(x => x.id === it.productId);
    if (!p || p.stock < it.qty){
      return { ok:false, message:`Món "${it.product.name}" vừa hết hàng hoặc không đủ số lượng, vui lòng cập nhật lại giỏ hàng.` };
    }
  }

  const user = typeof cfCurrentUser === 'function' ? cfCurrentUser() : null;
  const subtotal = cfCartSubtotal();
  const total = cfCartTotal();

  if (opts.paymentMethod === 'campuswallet'){
    if (!user) return { ok:false, message:'Vui lòng đăng nhập để dùng Ví CampusFood.' };
    if (user.walletBalance < total){
      return { ok:false, message:'Số dư Ví CampusFood không đủ. Vui lòng nạp thêm hoặc chọn phương thức khác.' };
    }
  }

  // Trừ tồn kho
  const updatedProducts = products.map(p => {
    const it = items.find(i => i.productId === p.id);
    return it ? { ...p, stock: p.stock - it.qty, sold: p.sold + it.qty } : p;
  });
  cfSaveProducts(updatedProducts);

  // Trừ ví nếu thanh toán bằng Ví CampusFood
  if (opts.paymentMethod === 'campuswallet' && user){
    user.walletBalance -= total;
    cfUpdateUser(user);
    cfAddWalletTransaction(user.id, { type:'payment', amount:-total, note:'Thanh toán đơn hàng' });
  }

  const order = {
    code: cfGenOrderCode(),
    userId: user ? user.id : null,
    guestName: user ? user.name : (opts.guestName || 'Khách vãng lai'),
    guestPhone: user ? user.phone : (opts.guestPhone || ''),
    items: items.map(i => ({ productId: i.productId, name: i.product.name, price: i.unitPrice, qty: i.qty, category: i.product.category, optionsText: i.optionsText })),
    subtotal, fee: CF_SERVICE_FEE, total,
    pickupSlot: cfGetCart().pickupSlot,
    paymentMethod: opts.paymentMethod,
    paymentStatus: opts.paymentMethod === 'cod' ? 'pending' : 'paid',
    status: 'placed',
    priority: !!(user && user.role === 'teacher'),
    createdAt: new Date().toISOString(),
    rating: null,
  };

  const orders = cfGetOrders();
  orders.push(order);
  cfSaveOrders(orders);
  cfClearCart();
  return { ok:true, order };
}

function cfGetOrderByCode(code){
  return cfGetOrders().find(o => o.code.toUpperCase() === String(code).toUpperCase());
}

function cfFindOrderForTracking(code, phone){
  const order = cfGetOrderByCode(code);
  if (!order) return { ok:false, message:'Không tìm thấy đơn hàng với mã này.' };
  if (order.guestPhone && phone && order.guestPhone.replace(/\D/g,'') !== String(phone).replace(/\D/g,'')){
    return { ok:false, message:'Số điện thoại không khớp với đơn hàng.' };
  }
  return { ok:true, order };
}

function cfMyOrders(){
  const user = cfCurrentUser();
  if (!user) return [];
  return cfGetOrders().filter(o => o.userId === user.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function cfUpdateOrder(updated){
  const orders = cfGetOrders().map(o => o.code === updated.code ? updated : o);
  cfSaveOrders(orders);
}

function cfAdvanceOrderStatus(order){
  const idx = CF_STATUS_FLOW.indexOf(order.status);
  if (idx === -1 || idx === CF_STATUS_FLOW.length - 1) return order;
  order.status = CF_STATUS_FLOW[idx + 1];
  if (order.status === 'confirmed' && order.paymentStatus === 'pending') order.paymentStatus = 'paid';
  cfUpdateOrder(order);
  return order;
}

function cfCancelOrder(order, reason){
  order.status = 'cancelled';
  order.cancelReason = reason || 'Căn tin từ chối đơn';
  cfUpdateOrder(order);
  // Hoàn tiền nếu đã thanh toán qua Ví CampusFood
  if (order.paymentMethod === 'campuswallet' && order.userId){
    const users = cfGetUsers();
    const user = users.find(u => u.id === order.userId);
    if (user){
      user.walletBalance += order.total;
      cfUpdateUser(user);
      cfAddWalletTransaction(user.id, { type:'refund', amount: order.total, note:`Hoàn tiền đơn ${order.code}` });
    }
  }
  return order;
}

/* ------------------- Thanh tiến trình 4 bước (dùng cho tracking.html) ------------------- */
const CF_PROGRESS_STEPS = [
  { key:'placed',    label:'Đã đặt hàng',    matches:['placed'] },
  { key:'preparing', label:'Đang chuẩn bị',  matches:['confirmed','preparing'] },
  { key:'ready',     label:'Sẵn sàng',       matches:['ready'] },
  { key:'done',      label:'Hoàn tất',       matches:['done'] },
];

function cfProgressStepIndex(status){
  const idx = CF_PROGRESS_STEPS.findIndex(s => s.matches.includes(status));
  return idx === -1 ? 0 : idx;
}

function cfRenderTimeline(container, order){
  if (order.status === 'cancelled'){
    container.innerHTML = `
      <div class="empty-state" style="padding:30px 10px;">
        ${CF_ICONS.close}
        <h3>Đơn hàng đã huỷ</h3>
        <p>${order.cancelReason || 'Đơn hàng này đã được huỷ.'}</p>
      </div>`;
    return;
  }
  const curIdx = cfProgressStepIndex(order.status);
  const fillPct = ((curIdx + 1) / CF_PROGRESS_STEPS.length) * 100;
  container.innerHTML = `
    <div class="progress-track">
      <div class="progress-bar-outer"><div class="progress-bar-fill" style="width:${fillPct}%"></div></div>
      <div class="progress-steps">
        ${CF_PROGRESS_STEPS.map((s, i) => {
          const cls = i < curIdx ? 'done' : (i === curIdx ? 'current' : '');
          return `<div class="progress-step ${cls}"><div class="ps-dot">${CF_ICONS.check}</div><div class="ps-label">${s.label}</div></div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ------------------- Đánh giá theo từng món (trang chi tiết món) ------------------- */
const CF_SEED_PRODUCT_REVIEWS = {
  MON01: [{ user:'Ngọc Trâm', stars:5, comment:'Sốt cay vừa miệng, gà giòn, giao đúng khung giờ đã chọn.' }],
  MON04: [{ user:'Bảo Châu', stars:5, comment:'Nước dùng đậm đà, không phải xếp hàng lâu như trước.' }],
  UONG01: [{ user:'Quang Huy', stars:4, comment:'Đào giòn nhưng hơi ít đá vào giờ cao điểm.' }],
  UONG04: [{ user:'Minh Anh', stars:5, comment:'Cà phê đậm, đúng gu, giá sinh viên hợp lý.' }],
  VAT04: [{ user:'Thu Hà', stars:5, comment:'Nem chua rán giòn rụm, chấm tương ớt hợp vị.' }],
};

function cfGetProductReviews(productId){
  const fromOrders = cfGetOrders()
    .filter(o => o.rating && o.items.some(it => it.productId === productId))
    .map(o => ({ user: o.guestName, stars: o.rating.stars, comment: o.rating.comment, date: o.createdAt }));
  const seed = (CF_SEED_PRODUCT_REVIEWS[productId] || []).map(r => ({ ...r, date: null }));
  return [...fromOrders, ...seed];
}

/* ------------------- Ví CampusFood: lịch sử giao dịch ------------------- */
const CF_WALLET_TX_KEY = 'cf_wallet_tx';
function cfGetWalletTx(userId){
  const raw = localStorage.getItem(CF_WALLET_TX_KEY);
  const all = raw ? JSON.parse(raw) : {};
  return all[userId] || [];
}
function cfAddWalletTransaction(userId, tx){
  const raw = localStorage.getItem(CF_WALLET_TX_KEY);
  const all = raw ? JSON.parse(raw) : {};
  if (!all[userId]) all[userId] = [];
  all[userId].unshift({ ...tx, id: cfGenId('TX'), at: new Date().toISOString() });
  localStorage.setItem(CF_WALLET_TX_KEY, JSON.stringify(all));
}
