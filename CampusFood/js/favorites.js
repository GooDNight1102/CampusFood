/* =========================================================
   FAVORITES — Món yêu thích
   ========================================================= */
const CF_FAV_KEY = 'cf_favorites';

function cfGetFavorites(){
  try {
    const raw = localStorage.getItem(CF_FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
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

/* --- Inject nút tim vào mọi .product-card --- */
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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const nowFav = cfToggleFavorite(id);
      btn.classList.toggle('is-fav', nowFav);
      btn.innerHTML = nowFav ? '❤️' : '🤍';
      btn.title = nowFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích';
      cfToast(nowFav ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích', 'success');
    });
    card.style.position = 'relative';
    card.appendChild(btn);
  });
}

/* --- MutationObserver: tự inject khi có card mới --- */
function cfWatchProductCards(){
  if (!('MutationObserver' in window)) return;
  const obs = new MutationObserver(muts => {
    let shouldInject = false;
    muts.forEach(m => {
      if (m.addedNodes && m.addedNodes.length) shouldInject = true;
    });
    if (shouldInject) cfInjectFavoriteButtons();
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/* --- Render trang favorites --- */
function cfRenderFavoritesPage(){
  const grid = document.getElementById('fav-grid');
  const empty = document.getElementById('fav-empty');
  const count = document.getElementById('fav-count');
  if (!grid) return;

  const ids = cfGetFavorites();
  const all = cfGetProducts();
  const items = ids.map(id => all.find(p => p.id === id)).filter(Boolean);

  if (count) count.textContent = `${items.length} món yêu thích`;
  if (items.length === 0){
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = items.map(cfProductCardHtml).join('');
  if (typeof cfBindProductCardEvents === 'function') cfBindProductCardEvents();
  cfInjectFavoriteButtons();
}

document.addEventListener('DOMContentLoaded', () => {
  cfWatchProductCards();
  setTimeout(() => cfInjectFavoriteButtons(), 0);
});

window.cfGetFavorites = cfGetFavorites;
window.cfIsFavorite = cfIsFavorite;
window.cfToggleFavorite = cfToggleFavorite;
window.cfInjectFavoriteButtons = cfInjectFavoriteButtons;
window.cfRenderFavoritesPage = cfRenderFavoritesPage;