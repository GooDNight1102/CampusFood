/* =========================================================
   CampusFood — admin.js
   Bảng điều khiển cho nhân viên căn tin / quản trị viên.
   ========================================================= */

/* roles: ai được thấy mục này trong sidebar (khớp phân quyền của đề bài) */
const CF_ADMIN_NAV = [
  { href:'index.html', key:'dashboard', icon:'dashboard', label:'Tổng quan', roles:['admin'] },
  { href:'products.html', key:'products', icon:'box', label:'Thực đơn', roles:['staff','admin'] },
  { href:'orders.html', key:'orders', icon:'receipt', label:'Đơn hàng', roles:['staff','admin'] },
  { href:'users.html', key:'users', icon:'users', label:'Người dùng', roles:['admin'] },
  { href:'revenue.html', key:'revenue', icon:'chartline', label:'Doanh thu', roles:['admin'] },
  { href:'reviews.html', key:'reviews', icon:'star', label:'Đánh giá', roles:['admin'] },
];

/**
 * Khởi tạo khung quản trị cho một trang.
 * allowedRoles: vai trò được phép xem CHÍNH trang này (vd Dashboard chỉ admin).
 * Sidebar chỉ hiển thị các mục mà vai trò hiện tại được phép vào.
 */
function cfAdminBoot(activeKey, allowedRoles){
  const staffUser = cfRequireStaff(allowedRoles);
  if (!staffUser) return null;
  const mount = document.getElementById('admin-sidebar');
  if (mount){
    const visibleNav = CF_ADMIN_NAV.filter(i => i.roles.includes(staffUser.role));
    mount.innerHTML = `
      <div class="brand"><span class="brand-name">Campus<em>Food</em></span></div>
      <nav class="admin-nav">
        ${visibleNav.map(i => `<a href="${i.href}" class="${activeKey===i.key?'active':''}">${CF_ICONS[i.icon]}${i.label}</a>`).join('')}
      </nav>
      <div class="admin-sidebar-foot">
        <div style="padding:10px 12px; color:rgba(255,255,255,.6); font-size:12.5px;">
          Đăng nhập: <b style="color:#fff;">${staffUser.name}</b><br>${cfRoleLabel(staffUser.role)}
          ${staffUser.role === 'staff' ? '<br><span style="color:rgba(255,255,255,.4);">Chỉ quản lý thực đơn &amp; đơn hàng</span>' : ''}
        </div>
        <a href="#" class="admin-back" id="admin-logout">${CF_ICONS.logout} Đăng xuất</a>
        <a href="../index.html" class="admin-back">${CF_ICONS.home} Về trang khách</a>
      </div>`;
    document.getElementById('admin-logout').addEventListener('click', (e) => {
      e.preventDefault(); cfLogout(); window.location.href = '../login.html';
    });
  }
  return staffUser;
}

/* ------------------- Mini canvas charts (không dùng thư viện ngoài) ------------------- */
function cfDrawBarChart(canvas, labels, data, color){
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight || 200;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);
  const max = Math.max(...data, 1);
  const padB = 26, padT = 14;
  const barW = (w / data.length) * 0.5;
  const gap = (w / data.length) * 0.5;
  data.forEach((v, i) => {
    const bh = ((h - padB - padT) * v) / max;
    const x = i * (barW + gap) + gap / 2;
    const y = h - padB - bh;
    const grad = ctx.createLinearGradient(0, y, 0, h - padB);
    grad.addColorStop(0, color); grad.addColorStop(1, 'rgba(224,89,44,.35)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, barW, bh, [6,6,0,0]) : ctx.rect(x,y,barW,bh);
    ctx.fill();
    ctx.fillStyle = '#8A8271';
    ctx.font = '11px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, h - 8);
  });
}

function cfDrawLineChart(canvas, labels, data, color){
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight || 220;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);
  const max = Math.max(...data, 1);
  const padB = 26, padT = 18, padL = 10, padR = 10;
  const stepX = (w - padL - padR) / (data.length - 1 || 1);
  const pts = data.map((v, i) => [padL + i * stepX, h - padB - ((h - padB - padT) * v) / max]);

  // vùng tô dưới đường
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, 'rgba(46,90,62,.22)'); grad.addColorStop(1, 'rgba(46,90,62,0)');
  ctx.beginPath();
  ctx.moveTo(pts[0][0], h - padB);
  pts.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.lineTo(pts[pts.length-1][0], h - padB);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0],p[1]) : ctx.lineTo(p[0],p[1]));
  ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();

  pts.forEach((p, i) => {
    ctx.beginPath(); ctx.arc(p[0], p[1], 3.4, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
    ctx.fillStyle = '#8A8271'; ctx.font = '10.5px Manrope, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], p[0], h - 8);
  });
}

/* ------------------- Doanh thu demo (7 ngày gần nhất, kết hợp đơn thật) ------------------- */
function cfLast7DaysRevenue(){
  const orders = cfGetOrders();
  const days = [];
  for (let i = 6; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const dayOrders = orders.filter(o => o.createdAt.slice(0,10) === key && o.status !== 'cancelled');
    const revenue = dayOrders.reduce((s,o) => s + o.total, 0);
    days.push({ label: `${d.getDate()}/${d.getMonth()+1}`, revenue, count: dayOrders.length });
  }
  // demo baseline nếu chưa có đơn thật để biểu đồ không trống trơn khi mới mở
  const hasData = days.some(d => d.revenue > 0);
  if (!hasData){
    const base = [420000, 610000, 380000, 720000, 690000, 810000, 540000];
    days.forEach((d,i) => { d.revenue = base[i]; d.count = Math.round(base[i]/38000); });
  }
  return days;
}

/* ------------------- Dashboard ------------------- */
function cfRenderDashboard(){
  const orders = cfGetOrders();
  const today = new Date().toISOString().slice(0,10);
  const todayOrders = orders.filter(o => o.createdAt.slice(0,10) === today);
  const todayRevenue = todayOrders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0);
  const processing = orders.filter(o => ['placed','confirmed','preparing','ready'].includes(o.status)).length;
  const completed = orders.filter(o => o.status === 'done').length;
  const users = cfGetUsers().filter(u => u.role === 'student' || u.role === 'teacher').length;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-revenue', cfFormatVND(todayRevenue));
  set('stat-orders', todayOrders.length);
  set('stat-processing', processing);
  set('stat-users', users);

  const days = cfLast7DaysRevenue();
  const canvas = document.getElementById('revenue-chart');
  if (canvas) cfDrawLineChart(canvas, days.map(d=>d.label), days.map(d=>d.revenue), '#2E5A3E');

  // Đơn hàng mới nhất
  const recentEl = document.getElementById('recent-orders');
  if (recentEl){
    const recent = [...orders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
    recentEl.innerHTML = recent.length === 0 ? '<div class="empty-state"><h3>Chưa có đơn hàng</h3></div>' : recent.map(o => `
      <div class="rank-row">
        <div style="flex:1;">
          <div class="rname">${o.code} — ${o.guestName}</div>
          <div class="text-muted" style="font-size:12px;">${o.items.length} món · ${o.pickupSlot}</div>
        </div>
        <span class="status-pill ${cfOrderStatusPillClass(o.status)}">${cfOrderStatusLabel(o.status)}</span>
      </div>`).join('');
  }

  // Món bán chạy
  const topEl = document.getElementById('top-products');
  if (topEl){
    const top = [...cfGetProducts()].sort((a,b)=>b.sold-a.sold).slice(0,5);
    topEl.innerHTML = top.map((p,i) => `
      <div class="rank-row">
        <div class="rank-num">${i+1}</div>
        <div class="rname">${p.name}</div>
        <div class="rval">${p.sold} đã bán</div>
      </div>`).join('');
  }
}

/* ------------------- Quản lý sản phẩm ------------------- */
let CF_EDITING_PRODUCT = null;

function cfRenderProductsAdmin(){
  const list = () => {
    const q = (document.getElementById('prod-search')?.value || '').toLowerCase();
    const cat = document.getElementById('prod-filter-cat')?.value || 'all';
    return cfGetProducts().filter(p =>
      (cat === 'all' || p.category === cat) &&
      p.name.toLowerCase().includes(q));
  };

  const render = () => {
    const body = document.getElementById('products-admin-body');
    const items = list();
    body.innerHTML = items.map(p => `
      <tr>
        <td>
          <div class="cell-product">
            <div class="cell-thumb prod-thumb-sm" style="background:linear-gradient(135deg,${cfThumbGradient(p.category)});display:flex;align-items:center;justify-content:center;">
              ${CF_ICONS[cfCategoryIconKey(p.category)]}
            </div>
            <div><div style="font-weight:700;">${p.name}</div><div class="text-muted" style="font-size:12px;">${p.id}</div></div>
          </div>
        </td>
        <td>${cfCategoryLabel(p.category)}</td>
        <td>${cfFormatVND(p.price)}</td>
        <td>${p.stock}</td>
        <td><span class="status-pill ${p.stock > 0 ? 'ready' : 'cancelled'}">${p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td>
        <td>
          <div class="row-actions">
            <button type="button" data-edit="${p.id}" aria-label="Sửa">${CF_ICONS.edit}</button>
            <button type="button" data-del="${p.id}" aria-label="Xoá">${CF_ICONS.trash}</button>
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="6"><div class="empty-state"><h3>Không có món nào khớp</h3></div></td></tr>`;

    body.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => cfOpenProductModal(b.dataset.edit)));
    body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      if (confirm('Xoá món này khỏi thực đơn?')){
        cfSaveProducts(cfGetProducts().filter(p => p.id !== b.dataset.del));
        render();
        cfToast('Đã xoá món khỏi thực đơn.', 'success');
      }
    }));
  };

  document.getElementById('prod-search')?.addEventListener('input', render);
  document.getElementById('prod-filter-cat')?.addEventListener('change', render);
  document.getElementById('btn-add-product')?.addEventListener('click', () => cfOpenProductModal(null));

  const form = document.getElementById('product-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const products = cfGetProducts();
    const data = {
      name: document.getElementById('pf-name').value.trim(),
      category: document.getElementById('pf-category').value,
      price: parseInt(document.getElementById('pf-price').value, 10) || 0,
      stock: parseInt(document.getElementById('pf-stock').value, 10) || 0,
      desc: document.getElementById('pf-desc').value.trim(),
    };
    if (!data.name){ cfToast('Vui lòng nhập tên món.', 'error'); return; }

    if (CF_EDITING_PRODUCT){
      const idx = products.findIndex(p => p.id === CF_EDITING_PRODUCT);
      products[idx] = { ...products[idx], ...data };
      cfToast('Đã cập nhật món ăn.', 'success');
    } else {
      products.push({ id: cfGenId(data.category.toUpperCase()), rating:0, sold:0, badge:'', ...data });
      cfToast('Đã thêm món mới vào thực đơn.', 'success');
    }
    cfSaveProducts(products);
    document.getElementById('product-modal').classList.remove('open');
    render();
  });

  render();
}

function cfOpenProductModal(id){
  CF_EDITING_PRODUCT = id;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  if (id){
    const p = cfGetProductById(id);
    title.textContent = 'Sửa món ăn';
    document.getElementById('pf-name').value = p.name;
    document.getElementById('pf-category').value = p.category;
    document.getElementById('pf-price').value = p.price;
    document.getElementById('pf-stock').value = p.stock;
    document.getElementById('pf-desc').value = p.desc;
  } else {
    title.textContent = 'Thêm món mới';
    document.getElementById('product-form').reset();
  }
  modal.classList.add('open');
}

/* ------------------- Quản lý đơn hàng ------------------- */
function cfRenderOrdersAdmin(){
  const render = () => {
    const filter = document.getElementById('order-filter-status')?.value || 'all';
    // Đơn của giảng viên được ưu tiên xử lý: xếp lên đầu trong các đơn đang chờ xử lý.
    let orders = [...cfGetOrders()].sort((a,b) => {
      const aActive = a.status !== 'done' && a.status !== 'cancelled';
      const bActive = b.status !== 'done' && b.status !== 'cancelled';
      if (aActive && bActive && !!a.priority !== !!b.priority) return a.priority ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    if (filter !== 'all') orders = orders.filter(o => o.status === filter);
    const body = document.getElementById('orders-admin-body');
    body.innerHTML = orders.map(o => `
      <tr>
        <td style="font-weight:800;">${o.code}${o.priority ? ' <span class="badge badge-bestseller" style="position:static;display:inline-block;">Ưu tiên GV</span>' : ''}</td>
        <td>${o.guestName}<div class="text-muted" style="font-size:12px;">${o.guestPhone || '—'}</div></td>
        <td>${cfFormatVND(o.total)}</td>
        <td>${o.paymentMethod === 'cod' ? 'Tiền mặt' : o.paymentMethod === 'ewallet' ? 'Ví điện tử' : 'Ví CampusFood'}</td>
        <td>${new Date(o.createdAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</td>
        <td><span class="status-pill ${cfOrderStatusPillClass(o.status)}">${cfOrderStatusLabel(o.status)}</span></td>
        <td>
          <div class="row-actions">
            ${o.status !== 'done' && o.status !== 'cancelled' ? `<button type="button" data-advance="${o.code}" title="Chuyển trạng thái tiếp theo">${CF_ICONS.check}</button>` : ''}
            ${o.status === 'placed' ? `<button type="button" data-reject="${o.code}" title="Từ chối đơn">${CF_ICONS.close}</button>` : ''}
            <button type="button" data-view="${o.code}" title="Xem chi tiết">${CF_ICONS.eye}</button>
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="7"><div class="empty-state"><h3>Không có đơn hàng nào</h3></div></td></tr>`;

    body.querySelectorAll('[data-advance]').forEach(b => b.addEventListener('click', () => {
      const order = cfGetOrderByCode(b.dataset.advance);
      cfAdvanceOrderStatus(order);
      cfToast(`Đơn ${order.code} → ${cfOrderStatusLabel(order.status)}`, 'success');
      render();
    }));
    body.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', () => {
      const reason = prompt('Lý do từ chối đơn hàng:', 'Hết nguyên liệu chuẩn bị món');
      if (reason === null) return;
      const order = cfGetOrderByCode(b.dataset.reject);
      cfCancelOrder(order, reason);
      cfToast(`Đã từ chối đơn ${order.code}.`, 'error');
      render();
    }));
    body.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => cfShowOrderDetailModal(b.dataset.view)));
  };
  document.getElementById('order-filter-status')?.addEventListener('change', render);
  render();
}

function cfShowOrderDetailModal(code){
  const order = cfGetOrderByCode(code);
  const modal = document.getElementById('order-detail-modal');
  document.getElementById('od-code').textContent = order.code;
  document.getElementById('od-customer').textContent = `${order.guestName} — ${order.guestPhone || 'Không có SĐT'}`;
  document.getElementById('od-slot').textContent = order.pickupSlot;
  document.getElementById('od-items').innerHTML = order.items.map(i => `
    <div class="ticket-row"><span class="name">${i.name} <span class="qty">x${i.qty}</span></span><span>${cfFormatVND(i.price*i.qty)}</span></div>
  `).join('');
  document.getElementById('od-total').textContent = cfFormatVND(order.total);
  modal.classList.add('open');
}

/* ------------------- Quản lý người dùng ------------------- */
function cfRenderUsersAdmin(){
  const body = document.getElementById('users-admin-body');
  const roleLabelCls = { student:'confirmed', teacher:'preparing', staff:'ready', admin:'done' };
  const render = () => {
    const q = (document.getElementById('user-search')?.value || '').toLowerCase();
    const users = cfGetUsers().filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    body.innerHTML = users.map(u => `
      <tr>
        <td>
          <div class="cell-product">
            <div class="avatar" style="width:38px;height:38px;">${u.avatarInitial}</div>
            <div><div style="font-weight:700;">${u.name}</div><div class="text-muted" style="font-size:12px;">${u.email}</div></div>
          </div>
        </td>
        <td><span class="status-pill ${roleLabelCls[u.role]||'wait'}">${cfRoleLabel(u.role)}</span></td>
        <td>${u.phone || '—'}</td>
        <td>${u.mssv || u.magv || '—'}</td>
        <td>${cfFormatVND(u.walletBalance || 0)}</td>
        <td>${u.createdAt}</td>
      </tr>`).join('');
  };
  document.getElementById('user-search')?.addEventListener('input', render);
  render();
}

/* ------------------- Báo cáo doanh thu ------------------- */
function cfRenderRevenueAdmin(){
  const days = cfLast7DaysRevenue();
  const canvas = document.getElementById('revenue-bar-chart');
  if (canvas) cfDrawBarChart(canvas, days.map(d=>d.label), days.map(d=>d.revenue), '#E0592C');

  const totalRevenue = days.reduce((s,d)=>s+d.revenue,0);
  const totalOrders = days.reduce((s,d)=>s+d.count,0);
  document.getElementById('rev-total') && (document.getElementById('rev-total').textContent = cfFormatVND(totalRevenue));
  document.getElementById('rev-orders') && (document.getElementById('rev-orders').textContent = totalOrders);
  document.getElementById('rev-avg') && (document.getElementById('rev-avg').textContent = cfFormatVND(Math.round(totalRevenue / (totalOrders||1))));

  const tbody = document.getElementById('revenue-table-body');
  if (tbody) tbody.innerHTML = days.map(d => `
    <tr><td>${d.label}</td><td>${d.count}</td><td style="font-weight:700;">${cfFormatVND(d.revenue)}</td></tr>
  `).join('');

  const topEl = document.getElementById('revenue-top-products');
  if (topEl){
    const top = [...cfGetProducts()].sort((a,b)=>b.sold-a.sold).slice(0,6);
    const maxSold = Math.max(...top.map(p=>p.sold),1);
    topEl.innerHTML = top.map(p => `
      <div class="rank-row" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div class="flex justify-between"><span class="rname">${p.name}</span><span class="rval">${p.sold} đã bán</span></div>
        <div class="progress-bar"><span style="width:${(p.sold/maxSold)*100}%"></span></div>
      </div>`).join('');
  }
}

/* ------------------- Đánh giá món ăn ------------------- */
const CF_SEED_REVIEWS = [
  { name:'Cơm gà sốt cay', user:'Ngọc Trâm', stars:5, comment:'Sốt cay vừa miệng, gà giòn, giao đúng giờ hẹn.' },
  { name:'Trà đào', user:'Quang Huy', stars:4, comment:'Đào giòn nhưng hơi ít đá vào giờ cao điểm.' },
  { name:'Phở bò', user:'Bảo Châu', stars:5, comment:'Nước dùng đậm đà, không phải xếp hàng lâu như trước.' },
];

function cfRenderReviewsAdmin(){
  const orderReviews = cfGetOrders().filter(o => o.rating).map(o => ({
    name: o.items[0]?.name + (o.items.length>1?` +${o.items.length-1} món khác`:''),
    user: o.guestName, stars: o.rating.stars, comment: o.rating.comment, code: o.code,
  }));
  const all = [...orderReviews, ...CF_SEED_REVIEWS];
  const list = document.getElementById('reviews-list');
  if (!list) return;
  list.innerHTML = all.map(r => `
    <div class="panel" style="padding:18px;">
      <div class="flex justify-between items-center">
        <div>
          <b>${r.user}</b> <span class="text-muted" style="font-size:12.5px;">đánh giá ${r.name}</span>
        </div>
        <div class="stars-input">${Array.from({length:5}).map((_,i)=> i < r.stars ? CF_ICONS.star : CF_ICONS.star.replace('fill="currentColor"','fill="none" stroke="currentColor" stroke-width="1.5"')).join('')}</div>
      </div>
      <p style="margin-top:10px; font-size:14px; color:var(--ink-70);">${r.comment}</p>
    </div>`).join('');
}
