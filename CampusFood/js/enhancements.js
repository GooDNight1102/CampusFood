/* =========================================================
   CampusFood — Enhancements JS
   Nút về đầu trang, debounce, PWA, theme, tiện ích chung
   ========================================================= */

/* ---------- 1. BACK TO TOP BUTTON ---------- */
(function initBackToTop(){
  if (document.querySelector('.cf-backtop')) return;

  // Inject CSS nếu enhance.css chưa load
  if (!document.getElementById('cf-backtop-style')){
    const style = document.createElement('style');
    style.id = 'cf-backtop-style';
    style.textContent = `
      #bottom-nav { display: none !important; }
      body[data-page] { padding-bottom: 0 !important; }

      .cf-backtop {
        position: fixed; right: 20px; bottom: 20px; z-index: 90;
        width: 48px; height: 48px; border-radius: 50%;
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        background: #17301F; color: #fff;
        box-shadow: 0 6px 20px rgba(23,48,31,.28);
        transition: transform .22s ease, opacity .22s ease, background .22s ease;
        opacity: 0; pointer-events: none;
        transform: translateY(20px) scale(.85);
      }
      .cf-backtop.is-visible {
        opacity: 1; pointer-events: auto;
        transform: translateY(0) scale(1);
      }
      .cf-backtop:hover { background: #E0592C; transform: translateY(-3px) scale(1.06); }
      .cf-backtop:active { transform: translateY(0) scale(.96); }
      .cf-backtop svg { width: 20px; height: 20px; display: block; }
      .cf-backtop::before {
        content: ''; position: absolute; inset: -3px; border-radius: 50%;
        background: conic-gradient(#E0592C var(--cf-scroll-progress, 0deg), transparent 0);
        z-index: -1; opacity: .9;
      }
      @media (max-width: 768px){
        .cf-backtop { right: 14px; bottom: 14px; width: 44px; height: 44px; }
        body.has-sticky-bar .cf-backtop { bottom: 84px; }
      }
    `;
    document.head.appendChild(style);
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cf-backtop';
  btn.setAttribute('aria-label', 'Về đầu trang');
  btn.title = 'Về đầu trang';
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>`;
  document.body.appendChild(btn);

  let rafId = null;
  function update(){
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const progress = h > 0 ? Math.min(100, (y / h) * 100) : 0;
    btn.classList.toggle('is-visible', y > 400);
    btn.style.setProperty('--cf-scroll-progress', (progress * 3.6) + 'deg');
    rafId = null;
  }
  window.addEventListener('scroll', () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(update);
  }, { passive: true });

  // Nếu có sticky-cart-bar, đẩy nút lên
  function checkStickyBar(){
    const bar = document.querySelector('.sticky-cart-bar');
    if (bar && getComputedStyle(bar).display !== 'none'){
      document.body.classList.add('has-sticky-bar');
    } else {
      document.body.classList.remove('has-sticky-bar');
    }
  }
  window.addEventListener('resize', checkStickyBar);
  setTimeout(checkStickyBar, 300);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  update();
})();


/* ---------- 2. DEBOUNCE HELPER ---------- */
function cfDebounce(fn, wait = 250){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}


/* ---------- 3. LAZY LOAD ẢNH ---------- */
function cfLazyImages(selector = 'img[data-src]'){
  const imgs = document.querySelectorAll(selector);
  if (!imgs.length) return;
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          const img = e.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(i => io.observe(i));
  } else {
    imgs.forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  }
}


/* ---------- 4. THEME (Sáng / Tối) ---------- */
const CF_SETTINGS_KEY = 'cf_settings';

function cfGetSettings(){
  const defaults = {
    theme: 'light',
    notifyEmail: true,
    notifySMS: false,
    notifyPromo: true,
    language: 'vi',
    reduceMotion: false,
  };
  try {
    const raw = localStorage.getItem(CF_SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch(e){ return defaults; }
}
function cfSaveSettings(s){
  try { localStorage.setItem(CF_SETTINGS_KEY, JSON.stringify(s)); } catch(e){}
}
function cfApplyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark'){
    document.documentElement.style.setProperty('--paper', '#1a221c');
    document.documentElement.style.setProperty('--line', '#2b3a2f');
    document.documentElement.style.setProperty('--ink', '#e8efe9');
    document.documentElement.style.setProperty('--ink-70', '#b8c4ba');
    document.documentElement.style.setProperty('--ink-40', '#7d8a80');
    document.body.style.background = '#0f1611';
    document.body.style.color = '#e8efe9';
  } else {
    document.documentElement.removeAttribute('data-theme');
    ['--paper','--line','--ink','--ink-70','--ink-40'].forEach(v =>
      document.documentElement.style.removeProperty(v));
    document.body.style.background = '';
    document.body.style.color = '';
  }
}
function cfApplyReduceMotion(on){
  document.body.classList.toggle('reduce-motion', on);
}

// Áp dụng settings ngay khi load
(function applyStoredSettings(){
  const s = cfGetSettings();
  cfApplyTheme(s.theme);
  cfApplyReduceMotion(s.reduceMotion);
})();


/* ---------- 5. FAVORITES ---------- */
const CF_FAV_KEY = 'cf_favorites';

function cfGetFavorites(){
  try { return JSON.parse(localStorage.getItem(CF_FAV_KEY) || '[]'); } catch(e){ return []; }
}
function cfSetFavorites(list){
  try { localStorage.setItem(CF_FAV_KEY, JSON.stringify(list)); } catch(e){}
}
function cfIsFavorite(id){ return cfGetFavorites().includes(id); }
function cfToggleFavorite(id){
  const list = cfGetFavorites();
  const i = list.indexOf(id);
  if (i >= 0){ list.splice(i, 1); cfSetFavorites(list); return false; }
  list.push(id); cfSetFavorites(list); return true;
}

function cfInjectFavoriteButtons(root = document){
  root.querySelectorAll('.product-card').forEach(card => {
    if (card.querySelector('.fav-btn')) return;
    const link = card.querySelector('a');
    if (!link) return;
    const match = (link.getAttribute('href') || '').match(/id=([^&]+)/);
    if (!match) return;
    const id = match[1];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fav-btn' + (cfIsFavorite(id) ? ' is-fav' : '');
    btn.dataset.favId = id;
    btn.title = cfIsFavorite(id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích';
    btn.innerHTML = cfIsFavorite(id) ? '❤️' : '🤍';
    btn.style.cssText = `
      position:absolute; top:10px; right:10px; width:36px; height:36px;
      border-radius:50%; background:rgba(255,255,255,.92); border:none;
      cursor:pointer; font-size:16px; display:flex; align-items:center;
      justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,.12);
      transition:transform .18s, box-shadow .18s; z-index:5; line-height:1;
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const nowFav = cfToggleFavorite(id);
      btn.classList.toggle('is-fav', nowFav);
      btn.innerHTML = nowFav ? '❤️' : '🤍';
      btn.title = nowFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích';
      if (typeof cfToast === 'function')
        cfToast(nowFav ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích', 'success');
    });
    card.style.position = 'relative';
    card.appendChild(btn);
  });
}

// MutationObserver — tự inject khi card mới xuất hiện
if ('MutationObserver' in window){
  new MutationObserver(() => cfInjectFavoriteButtons())
    .observe(document.body, { childList: true, subtree: true });
}


/* ---------- 6. PWA SERVICE WORKER ---------- */
if ('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}


/* ---------- 7. AUTO-INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cfLazyImages();
  setTimeout(() => cfInjectFavoriteButtons(), 100);
});


/* ---------- 8. EXPOSE GLOBALS ---------- */
window.cfDebounce            = cfDebounce;
window.cfLazyImages          = cfLazyImages;
window.cfGetSettings         = cfGetSettings;
window.cfSaveSettings        = cfSaveSettings;
window.cfApplyTheme          = cfApplyTheme;
window.cfApplyReduceMotion   = cfApplyReduceMotion;
window.cfGetFavorites        = cfGetFavorites;
window.cfIsFavorite          = cfIsFavorite;
window.cfToggleFavorite      = cfToggleFavorite;
window.cfInjectFavoriteButtons = cfInjectFavoriteButtons;