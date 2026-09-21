/* =========================================================
   SETTINGS — Cài đặt người dùng
   ========================================================= */
const CF_SETTINGS_KEY = 'cf_settings';

const CF_DEFAULT_SETTINGS = {
  theme: 'light',
  notifyEmail: true,
  notifySMS: false,
  notifyPromo: true,
  language: 'vi',
  reduceMotion: false,
};

function cfGetSettings(){
  try {
    const raw = localStorage.getItem(CF_SETTINGS_KEY);
    return raw ? { ...CF_DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...CF_DEFAULT_SETTINGS };
  } catch(e){ return { ...CF_DEFAULT_SETTINGS }; }
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
    document.documentElement.style.removeProperty('--paper');
    document.documentElement.style.removeProperty('--line');
    document.documentElement.style.removeProperty('--ink');
    document.documentElement.style.removeProperty('--ink-70');
    document.documentElement.style.removeProperty('--ink-40');
    document.body.style.background = '';
    document.body.style.color = '';
  }
}
function cfApplyReduceMotion(on){
  document.documentElement.style.setProperty('--cf-anim', on ? '0s' : '');
  document.body.classList.toggle('reduce-motion', on);
}

function cfInitSettingsPage(){
  const user = cfRequireLogin();
  if (!user) return;

  const s = cfGetSettings();

  // fill user info
  const nameEl = document.getElementById('set-name');
  const emailEl = document.getElementById('set-email');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;

  // bind toggles
  document.querySelectorAll('[data-setting]').forEach(el => {
    const key = el.dataset.setting;
    if (el.type === 'checkbox'){
      el.checked = !!s[key];
      el.addEventListener('change', () => {
        const next = cfGetSettings();
        next[key] = el.checked;
        cfSaveSettings(next);
        if (key === 'reduceMotion') cfApplyReduceMotion(el.checked);
        cfToast('Đã lưu cài đặt.', 'success');
      });
    } else if (el.tagName === 'SELECT'){
      el.value = s[key];
      el.addEventListener('change', () => {
        const next = cfGetSettings();
        next[key] = el.value;
        cfSaveSettings(next);
        if (key === 'theme') cfApplyTheme(el.value);
        cfToast('Đã lưu cài đặt.', 'success');
      });
    }
  });

  // theme segmented
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === s.theme);
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeBtn;
      document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const next = cfGetSettings();
      next.theme = theme;
      cfSaveSettings(next);
      cfApplyTheme(theme);
    });
  });

  // danger zone
  document.getElementById('btn-clear-history')?.addEventListener('click', () => {
    if (!confirm('Xoá toàn bộ lịch sử đơn hàng? Hành động không thể hoàn tác.')) return;
    try { localStorage.removeItem('cf_orders'); } catch(e){}
    cfToast('Đã xoá lịch sử đơn hàng.', 'success');
  });

  document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
    if (!confirm('Xoá toàn bộ giỏ hàng?')) return;
    if (typeof cfSetCart === 'function') cfSetCart({ items: [], pickupSlot: '' });
    else {
      ['cf_cart', 'campusfood_cart'].forEach(k => localStorage.removeItem(k));
    }
    cfToast('Đã xoá giỏ hàng.', 'success');
  });

  document.getElementById('btn-delete-account')?.addEventListener('click', () => {
    if (!confirm('Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu?')) return;
    if (!confirm('Bạn chắc chắn? Hành động này không thể phục hồi.')) return;
    try {
      ['cf_user', 'cf_orders', 'cf_cart', 'campusfood_cart', 'cf_favorites', 'cf_settings']
        .forEach(k => localStorage.removeItem(k));
    } catch(e){}
    cfToast('Đã xoá tài khoản.', 'success');
    setTimeout(() => location.href = 'index.html', 800);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const s = cfGetSettings();
  cfApplyTheme(s.theme);
  cfApplyReduceMotion(s.reduceMotion);
  cfInitSettingsPage();
});

window.cfGetSettings = cfGetSettings;
window.cfApplyTheme = cfApplyTheme;