/* =========================================================
   CampusFood — main.js
   Icon set dùng chung, render header/footer/bottom-nav,
   toast, dropdown tìm kiếm & thông báo, drawer mobile.
   ========================================================= */

const CF_ICONS = {
  bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M12 12V5"/><path d="M8.5 6.5 12 5l3.5 1.5"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l-1 13a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3L6 3Z"/><path d="M9 3 8.4 1.5M15 3l.6-1.5"/><path d="M8 9h6"/></svg>',
  fries: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 21 6 9m3 12 .5-14M12 21l0-15m3 15L14 6m3 15 1.5-13"/><path d="M4 9h16l-1.2-3H5.2L4 9Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.6 12.2A2 2 0 0 0 8.5 17h9.1a2 2 0 0 0 1.9-1.4L21.5 8H6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.3 20a1.8 1.8 0 0 0 3.4 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.7-4.9 4.5 1.3 6.5L12 16.9l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.7Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.4"/><path d="M3 10h18"/><circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.4"/><rect x="13" y="3" width="8" height="5" rx="1.4"/><rect x="13" y="12" width="8" height="9" rx="1.4"/><rect x="3" y="14" width="8" height="7" rx="1.4"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 12.3c2.6.3 4.5 1.9 5 4.2"/></svg>',
  chartline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M4 19V5"/><path d="m6.5 15 3.5-4.5 3 3L18.5 6"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01"/></svg>',
};

/* Điền icon vào mọi phần tử <... data-icon="key"></...> có trên trang.
   Icon SVG gốc không có width/height cố định — nếu không được đặt kích
   thước, trình duyệt sẽ vẽ icon ở cỡ mặc định rất lớn (300×150). Hàm này
   luôn ép icon vừa khít khung chứa nó:
   - Nếu khung đã có inline width/height riêng (vd icon 96px ở trang chi
     tiết món, icon QR to ở modal thanh toán) → icon lấp đầy đúng khung đó.
   - Nếu khung có class đã tự quy định cỡ icon trong CSS (stall-thumb,
     stat-icon, rc-icon, ticket-float, empty-state, search-bar...) → giữ
     nguyên, để CSS của class đó quyết định.
   - Còn lại (icon nằm giữa dòng chữ, chưa được đặt cỡ ở đâu cả) → mặc
     định 1em để tự co theo cỡ chữ xung quanh, không bao giờ bị vỡ layout. */
const CF_ICON_SIZED_SELECTOR = [
  '.stall-thumb','.stat-icon','.rc-icon','.ticket-float','.empty-state',
  '.search-bar','.search-mini','.product-thumb','.cell-thumb','.icon-btn',
  '.add-btn','.tl-dot','.row-actions',
].join(',');
function cfFillIcons(root){
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    const key = el.dataset.icon;
    if (!CF_ICONS[key]) return;
    el.innerHTML = CF_ICONS[key];
    const svg = el.querySelector('svg');
    if (!svg) return;
    const hasInlineSize = !!(el.style.width || el.style.height);
    const hasSizedAncestor = el.closest(CF_ICON_SIZED_SELECTOR);
    if (hasInlineSize){
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.display = 'block';
    } else if (!hasSizedAncestor){
      svg.style.width = '1em';
      svg.style.height = '1em';
      svg.style.display = 'inline-block';
      svg.style.verticalAlign = '-0.125em';
      svg.style.flexShrink = '0';
    }
  });
}

/* ------------------- Thẻ sản phẩm dùng chung (trang chủ, menu, tìm kiếm) ------------------- */
function cfProductCardHtml(p){
  const out = p.stock <= 0;
  const badgeHtml = out ? '<span class="badge badge-out">Hết hàng</span>'
    : p.badge === 'bestseller' ? '<span class="badge badge-bestseller">Bán chạy</span>'
    : p.badge === 'new' ? '<span class="badge badge-new">Mới</span>' : '';
  return `
  <div class="product-card" data-product-card="${p.id}">
    <a href="product-detail.html?id=${p.id}" style="display:block;">
      <div class="product-thumb" style="--tc1:${cfThumbGradient(p.category).split(',')[0]};--tc2:${cfThumbGradient(p.category).split(',')[1]};">
        ${badgeHtml}
        ${CF_ICONS[cfCategoryIconKey(p.category)]}
        <div class="thumb-notch"></div>
      </div>
    </a>
    <div class="product-body">
      <span class="product-cat">${cfCategoryLabel(p.category).toUpperCase()}</span>
      <a href="product-detail.html?id=${p.id}"><h3 class="product-name">${p.name}</h3></a>
      <p class="product-desc">${p.desc}</p>
      <div class="product-meta">
        <span class="rating">${CF_ICONS.star} ${p.rating.toFixed(1)}</span>
        <span>·</span>
        <span>${p.sold} đã bán</span>
      </div>
      <div class="product-foot">
        <span class="price">${cfFormatVND(p.price)}</span>
        <button class="add-btn" data-add="${p.id}" ${out ? 'disabled' : ''} aria-label="Thêm vào giỏ">${CF_ICONS.plus}</button>
      </div>
    </div>
  </div>`;
}

function cfBindProductCardEvents(root){
  (root || document).querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const res = cfAddToCart(btn.dataset.add, 1);
      if (res.ok){
        cfToast('Đã thêm vào giỏ hàng.', 'success');
      } else {
        cfToast(res.message, 'error');
      }
    });
  });
}

function cfThumbGradient(cat){
  return { mon:'#F6DCC0,#EFA346', uong:'#CDE7DA,#5FA980', vat:'#FBE0AE,#E0592C' }[cat] || '#F6DCC0,#EFA346';
}

/* ------------------- Toast ------------------- */
function cfToast(message, type = 'default'){
  let stack = document.querySelector('.toast-stack');
  if (!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const icon = type === 'success' ? CF_ICONS.check : (type === 'error' ? CF_ICONS.close : CF_ICONS.bell);
  el.innerHTML = icon + '<span>' + message + '</span>';
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; setTimeout(() => el.remove(), 260); }, 2600);
}

/* ------------------- Header / Footer / Bottom nav ------------------- */
const CF_NAV_LINKS = [
  { href: 'index.html', label: 'Trang chủ', key: 'home' },
  { href: 'menu.html', label: 'Thực đơn', key: 'menu' },
  { href: 'menu.html?cat=mon', label: 'Đồ ăn', key: 'mon' },
  { href: 'menu.html?cat=uong', label: 'Đồ uống', key: 'uong' },
  { href: 'menu.html?cat=vat', label: 'Đồ ăn vặt', key: 'vat' },
  { href: 'tracking.html', label: 'Tra cứu đơn hàng', key: 'tracking' },
];

function cfRenderHeader(activeKey){
  const mount = document.getElementById('site-header');
  if (!mount) return;
  const user = typeof cfCurrentUser === 'function' ? cfCurrentUser() : null;

  mount.innerHTML = `
  <header class="site-header">
    <div class="container header-row">
      <button class="btn-icon mobile-menu-btn" id="drawer-open" aria-label="Mở menu">${CF_ICONS.menu}</button>
      <a href="index.html" class="brand">
        <svg class="brand-mark" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="11" fill="#17301F"/><path d="M11 21h18M11 21a2.2 2.2 0 0 0 0 4.4M29 21a2.2 2.2 0 0 1 0 4.4M15 25.4h10" stroke="#E0592C" stroke-width="2" stroke-linecap="round"/><path d="M20 21v-7" stroke="#EEA83A" stroke-width="2" stroke-linecap="round"/><path d="M16.7 15.4 20 14l3.3 1.4" stroke="#EEA83A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="brand-name">Campus<em>Food</em></span>
      </a>
      <nav class="main-nav">
        ${CF_NAV_LINKS.map(l => `<a href="${l.href}" class="${activeKey === l.key ? 'active' : ''}">${l.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <div class="search-wrap">
          <button class="icon-btn" id="search-toggle" aria-label="Tìm kiếm">${CF_ICONS.search}</button>
          <div class="search-panel" id="search-panel">
            <input type="text" id="global-search" placeholder="Tìm món ăn, đồ uống...">
            <div class="search-hint">Nhấn Enter để xem trong thực đơn</div>
          </div>
        </div>
        <a class="icon-btn" href="cart.html" aria-label="Giỏ hàng">
          ${CF_ICONS.cart}<span class="badge-count" data-cart-badge style="display:none;">0</span>
        </a>
        <div class="search-wrap notif-toggle">
          <button class="icon-btn" id="notif-toggle" aria-label="Thông báo">${CF_ICONS.bell}</button>
          <div class="notif-panel" id="notif-panel">
            <h4>Thông báo</h4>
            <div id="notif-list"></div>
          </div>
        </div>
        ${user && (user.role === 'staff' || user.role === 'admin') ? `
          <a class="icon-btn" href="admin/${user.role === 'staff' ? 'products' : 'index'}.html" aria-label="Trang quản trị" title="Trang quản trị">${CF_ICONS.dashboard}</a>
        ` : ''}
        ${user ? `
          <a href="profile.html" class="user-chip">
            <span class="avatar">${user.avatarInitial}</span> ${user.name.split(' ').slice(-1)[0]}
          </a>
        ` : `<a href="login.html" class="btn btn-dark btn-sm">${CF_ICONS.user} Đăng nhập</a>`}
      </div>
    </div>
  </header>
  <div class="drawer-overlay" id="drawer-overlay"></div>
  <aside class="drawer" id="drawer">
    <button class="btn-icon drawer-close" id="drawer-close" aria-label="Đóng menu">${CF_ICONS.close}</button>
    ${CF_NAV_LINKS.map(l => `<a href="${l.href}" class="${activeKey === l.key ? 'active' : ''}">${l.label}</a>`).join('')}
    <hr class="divider">
    ${user ? `<a href="profile.html">Tài khoản của tôi</a><a href="orders.html">Đơn hàng</a><a href="wallet.html">Ví CampusFood</a>`
           : `<a href="login.html">Đăng nhập</a><a href="register.html">Đăng ký</a>`}
  </aside>`;

  cfBindHeaderEvents();
  cfUpdateCartBadge();
}

function cfBindHeaderEvents(){
  const searchToggle = document.getElementById('search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const notifToggle = document.getElementById('notif-toggle');
  const notifPanel = document.getElementById('notif-panel');

  if (searchToggle) searchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    searchPanel.classList.toggle('open');
    notifPanel && notifPanel.classList.remove('open');
    if (searchPanel.classList.contains('open')) document.getElementById('global-search').focus();
  });
  const searchInput = document.getElementById('global-search');
  if (searchInput) searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()){
      window.location.href = 'menu.html?q=' + encodeURIComponent(e.target.value.trim());
    }
  });
  if (notifToggle) notifToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('open');
    searchPanel && searchPanel.classList.remove('open');
    cfRenderNotifications();
  });
  document.addEventListener('click', () => {
    searchPanel && searchPanel.classList.remove('open');
    notifPanel && notifPanel.classList.remove('open');
  });

  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const open = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
  document.getElementById('drawer-open') && document.getElementById('drawer-open').addEventListener('click', open);
  document.getElementById('drawer-close') && document.getElementById('drawer-close').addEventListener('click', close);
  overlay && overlay.addEventListener('click', close);
}

function cfRenderNotifications(){
  const list = document.getElementById('notif-list');
  if (!list) return;
  const orders = typeof cfGetOrders === 'function' ? cfGetOrders() : [];
  const mine = orders.slice(-3).reverse();
  if (mine.length === 0){
    list.innerHTML = '<div class="notif-empty">Chưa có thông báo nào.</div>';
    return;
  }
  list.innerHTML = mine.map(o => `
    <div class="notif-item">
      <div class="t">Đơn ${o.code} — ${cfOrderStatusLabel(o.status)}</div>
      <div class="d">Khung giờ nhận: ${o.pickupSlot || '—'}</div>
    </div>
  `).join('');
}

function cfRenderFooter(){
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  mount.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="brand"><span class="brand-name">Campus<em>Food</em></span></a>
          <p>Đặt trước suất ăn, chốt giờ lấy món và bỏ qua hàng chờ giờ cao điểm tại căng tin trường.</p>
        </div>
        <div>
          <h4>KHÁM PHÁ</h4>
          <ul>
            <li><a href="menu.html">Thực đơn</a></li>
            <li><a href="menu.html?cat=mon">Đồ ăn</a></li>
            <li><a href="menu.html?cat=uong">Đồ uống</a></li>
            <li><a href="menu.html?cat=vat">Đồ ăn vặt</a></li>
          </ul>
        </div>
        <div>
          <h4>TÀI KHOẢN</h4>
          <ul>
            <li><a href="profile.html">Tài khoản của tôi</a></li>
            <li><a href="orders.html">Đơn hàng</a></li>
            <li><a href="wallet.html">Ví CampusFood</a></li>
            <li><a href="tracking.html">Tra cứu đơn hàng</a></li>
          </ul>
        </div>
        <div>
          <h4>HỖ TRỢ</h4>
          <ul>
            <li><a href="qr-code.html">Quét QR đặt món</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Liên hệ căng tin</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 CampusFood — Đồ án môn học, nhóm Stingman.</span>
        <span>Được xây dựng cho một cơ sở căng tin duy nhất (demo).</span>
      </div>
    </div>
  </footer>`;
}

function cfRenderBottomNav(activeKey){
  const mount = document.getElementById('bottom-nav');
  if (!mount) return;
  const items = [
    { href:'index.html', key:'home', icon:CF_ICONS.home, label:'Trang chủ' },
    { href:'menu.html', key:'menu', icon:CF_ICONS.list, label:'Menu' },
    { href:'cart.html', key:'cart', icon:CF_ICONS.cart, label:'Giỏ', badge:true },
    { href:'orders.html', key:'orders', icon:CF_ICONS.receipt, label:'Đơn' },
    { href:'profile.html', key:'profile', icon:CF_ICONS.user, label:'Tôi' },
  ];
  mount.innerHTML = `<nav class="bn-row">${items.map(i => `
    <a href="${i.href}" class="${activeKey === i.key ? 'active' : ''}">
      <span style="position:relative;">${i.icon}${i.badge ? `<span class="badge-count" data-cart-badge style="display:none;top:-6px;right:-8px;">0</span>` : ''}</span>
      ${i.label}
    </a>`).join('')}</nav>`;
  cfUpdateCartBadge();
}

/* Khởi tạo mọi trang public: gọi ở cuối mỗi HTML với data-page trên <body> */
function cfBootPage(){
  const activeKey = document.body.dataset.page || '';
  cfRenderHeader(activeKey);
  cfRenderFooter();
  cfRenderBottomNav(activeKey);
  cfFillIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-header')) cfBootPage();
});
