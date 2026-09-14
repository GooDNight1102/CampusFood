/* =========================================================
   CampusFood — auth.js
   Đăng nhập / đăng ký / phân quyền demo, lưu trong localStorage.
   Không kết nối server thật — chỉ mô phỏng luồng cho MVP.
   ========================================================= */

const CF_USERS_KEY = 'cf_users';
const CF_SESSION_KEY = 'cf_session';

const CF_ROLE_DOMAIN = { student: 'hvpn.edu.vn', teacher: 'vwa.edu.vn', staff: 'vwa.edu.vn', admin: 'vwa.edu.vn' };

const CF_DEFAULT_USERS = [
  {
    id: 'U-SV001', role: 'student', name: 'Trần Minh Anh',
    email: 'sv1@hvpn.edu.vn', phone: '0901234567', password: '123456',
    mssv: 'SV20241234', lop: 'CNTT16A', khoa: 'Công nghệ thông tin',
    walletBalance: 250000, avatarInitial: 'M', createdAt: '2026-08-01',
  },
  {
    id: 'U-GV001', role: 'teacher', name: 'Nguyễn Thị Hạnh',
    email: 'gv1@vwa.edu.vn', phone: '0912345678', password: '123456',
    magv: 'GV0089', khoabomon: 'Bộ môn Công nghệ phần mềm',
    walletBalance: 500000, avatarInitial: 'H', createdAt: '2026-07-20',
  },
  {
    id: 'U-ST001', role: 'staff', name: 'Lê Văn Khoa',
    email: 'staff@vwa.edu.vn', phone: '0987654321', password: 'staff123',
    walletBalance: 0, avatarInitial: 'K', createdAt: '2026-07-01',
  },
  {
    id: 'U-AD001', role: 'admin', name: 'Phạm Quốc Đạt',
    email: 'admin@vwa.edu.vn', phone: '0977889900', password: 'admin123',
    walletBalance: 0, avatarInitial: 'Đ', createdAt: '2026-07-01',
  },
];

/* Số phiên bản dữ liệu tài khoản demo — tăng số này mỗi khi đổi thông tin
   tài khoản mặc định (email, mật khẩu...) để tự động "vá" lại dữ liệu cũ
   mà trình duyệt người dùng đã lỡ lưu, tránh tình trạng không đăng nhập được. */
const CF_USERS_VERSION = 2;
const CF_USERS_VERSION_KEY = 'cf_users_version';

function cfInitUsers(){
  const storedVersion = localStorage.getItem(CF_USERS_VERSION_KEY);
  if (!localStorage.getItem(CF_USERS_KEY)){
    localStorage.setItem(CF_USERS_KEY, JSON.stringify(CF_DEFAULT_USERS));
    localStorage.setItem(CF_USERS_VERSION_KEY, String(CF_USERS_VERSION));
    return;
  }
  if (String(storedVersion) !== String(CF_USERS_VERSION)){
    // Cập nhật lại 4 tài khoản demo mặc định theo thông tin mới nhất,
    // đồng thời GIỮ NGUYÊN mọi tài khoản người dùng tự đăng ký thêm.
    let users = [];
    try { users = JSON.parse(localStorage.getItem(CF_USERS_KEY)) || []; } catch(e) { users = []; }
    CF_DEFAULT_USERS.forEach(defaultUser => {
      const idx = users.findIndex(u => u.id === defaultUser.id);
      if (idx >= 0) users[idx] = { ...users[idx], ...defaultUser };
      else users.push(defaultUser);
    });
    localStorage.setItem(CF_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CF_USERS_VERSION_KEY, String(CF_USERS_VERSION));
  }
}
function cfGetUsers(){ cfInitUsers(); return JSON.parse(localStorage.getItem(CF_USERS_KEY)); }
function cfSaveUsers(list){ localStorage.setItem(CF_USERS_KEY, JSON.stringify(list)); }

function cfGenId(prefix){
  return prefix + '-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*90+10);
}

function cfGetSession(){
  const raw = localStorage.getItem(CF_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function cfCurrentUser(){
  const s = cfGetSession();
  if (!s || s.guest) return null;
  return cfGetUsers().find(u => u.id === s.userId) || null;
}

function cfIsGuest(){
  const s = cfGetSession();
  return !s || !!s.guest;
}

function cfLogin(email, password){
  const users = cfGetUsers();
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return { ok:false, message:'Không tìm thấy tài khoản với email/SĐT này.' };
  if (user.password !== password) return { ok:false, message:'Mật khẩu không chính xác.' };
  localStorage.setItem(CF_SESSION_KEY, JSON.stringify({ userId:user.id, guest:false }));
  return { ok:true, user };
}

function cfContinueAsGuest(){
  localStorage.setItem(CF_SESSION_KEY, JSON.stringify({ guest:true }));
}

function cfLogout(){
  localStorage.removeItem(CF_SESSION_KEY);
}

function cfRegister(data){
  const users = cfGetUsers();
  // Chuẩn hoá tên miền email theo vai trò: sinh viên @hvpn.edu.vn, giảng viên/nhân viên/quản trị @vwa.edu.vn
  const localPart = String(data.email).split('@')[0].trim();
  const email = localPart + '@' + (CF_ROLE_DOMAIN[data.role] || CF_ROLE_DOMAIN.student);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())){
    return { ok:false, message:'Email này đã được đăng ký.' };
  }
  const newUser = {
    id: cfGenId('U'),
    role: data.role,
    name: data.name,
    email,
    phone: data.phone,
    password: data.password,
    walletBalance: 100000, // tặng demo để trải nghiệm ví
    avatarInitial: data.name.trim().charAt(0).toUpperCase() || 'K',
    createdAt: new Date().toISOString().slice(0,10),
  };
  if (data.role === 'student'){
    newUser.mssv = data.mssv; newUser.lop = data.lop; newUser.khoa = data.khoa;
  } else if (data.role === 'teacher'){
    newUser.magv = data.magv; newUser.khoabomon = data.khoabomon;
  }
  users.push(newUser);
  cfSaveUsers(users);
  localStorage.setItem(CF_SESSION_KEY, JSON.stringify({ userId:newUser.id, guest:false }));
  return { ok:true, user:newUser };
}

function cfUpdateUser(updated){
  const users = cfGetUsers().map(u => u.id === updated.id ? updated : u);
  cfSaveUsers(users);
}

function cfRoleLabel(role){
  return { student:'Sinh viên', teacher:'Giảng viên', staff:'Nhân viên căn tin', admin:'Quản trị viên', guest:'Khách vãng lai' }[role] || role;
}

/* Chặn truy cập trang cần đăng nhập (profile, orders, wallet...) */
function cfRequireLogin(){
  if (cfIsGuest() || !cfCurrentUser()){
    window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop());
    return null;
  }
  return cfCurrentUser();
}

/* Chặn truy cập khu quản trị.
   allowedRoles: mảng vai trò được phép xem TRANG này, mặc định ['staff','admin'].
   - Chưa đăng nhập -> đưa về trang đăng nhập.
   - Đã đăng nhập nhưng không đủ quyền cho trang này (vd. staff vào Dashboard) ->
     báo rõ lý do rồi đưa về trang gần nhất mà họ được phép dùng, KHÔNG đăng xuất họ. */
function cfRequireStaff(allowedRoles){
  allowedRoles = allowedRoles || ['staff', 'admin'];
  const user = cfCurrentUser();
  if (!user || (user.role !== 'staff' && user.role !== 'admin')){
    alert('Khu vực quản trị chỉ dành cho nhân viên căn tin / quản trị viên.\nDùng tài khoản demo: staff@vwa.edu.vn / staff123');
    window.location.href = '../login.html';
    return null;
  }
  if (!allowedRoles.includes(user.role)){
    alert('Tài khoản "' + cfRoleLabel(user.role) + '" không có quyền truy cập trang này.');
    window.location.href = user.role === 'staff' ? 'products.html' : 'index.html';
    return null;
  }
  return user;
}
