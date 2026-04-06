// ══════════════════════════════════════════
// auth.js — Login, Logout, Session
// ══════════════════════════════════════════

// ────────────────────────────────────────────────────────────
//  LOGIKA SIMPAN KREDENSIAL
//  wp_cred       = kredensial terenkripsi (selalu disimpan saat berhasil login)
//  wp_remember_email / wp_remember_name = info tampilan
//  TIDAK ada auto-login — user harus klik Lanjutkan / Masuk
// ────────────────────────────────────────────────────────────

function _saveCred(email, pass, displayName) {
  localStorage.setItem('wp_cred', enc(email + '::' + pass));
  localStorage.setItem('wp_remember_email', email);
  localStorage.setItem('wp_remember_name', displayName || email.split('@')[0]);
}

function _clearCred() {
  localStorage.removeItem('wp_cred');
  localStorage.removeItem('wp_remember_email');
  localStorage.removeItem('wp_remember_name');
}

function _getSavedCred() {
  const raw = localStorage.getItem('wp_cred');
  if (!raw) return null;
  try {
    const decoded = dec(raw);
    const idx = decoded.indexOf('::');
    if (idx < 0) return null;
    return { email: decoded.slice(0, idx), pass: decoded.slice(idx + 2) };
  } catch (e) { return null; }
}

// ────────────────────────────────────────────────────────────
//  TAMPILKAN LAYAR LOGIN
// ────────────────────────────────────────────────────────────
function showLoginScreen() {
  hideLoadingScreen();
  const loginEl = document.getElementById('screen-login');
  const appEl   = document.getElementById('screen-app');
  if (loginEl) loginEl.classList.remove('hidden');
  if (appEl)   appEl.classList.remove('visible');
  if (dbRef) { try { dbRef.off(); } catch (e) {} dbRef = null; }

  const cred = _getSavedCred();
  if (cred) {
    _showRememberedUI(cred.email, localStorage.getItem('wp_remember_name'));
  } else {
    _showLoginFormUI();
  }
}

// STATE A — Lanjutkan
function _showRememberedUI(email, name) {
  document.getElementById('login-remembered').style.display = '';
  document.getElementById('login-form').style.display       = 'none';
  document.getElementById('register-form').style.display    = 'none';
  document.getElementById('remembered-email').textContent   = email;
  const nameEl = document.getElementById('remembered-name');
  if (nameEl) nameEl.textContent = name || email.split('@')[0];
  const errEl = document.getElementById('lr-err');
  if (errEl) errEl.textContent = '';
  const btn = document.getElementById('btn-lanjut');
  if (btn) { btn.textContent = '🚀 Lanjutkan'; btn.disabled = false; }
}

// STATE B — Form login
function _showLoginFormUI(prefillEmail, prefillPass) {
  document.getElementById('login-remembered').style.display = 'none';
  document.getElementById('login-form').style.display       = '';
  document.getElementById('register-form').style.display    = 'none';
  const emailEl = document.getElementById('lf-email');
  const passEl  = document.getElementById('lf-pass');
  if (emailEl) emailEl.value = prefillEmail || '';
  if (passEl)  passEl.value  = prefillPass  || '';
  document.getElementById('lf-err').textContent = '';
  const submitBtn = document.getElementById('lf-submit');
  if (submitBtn) { submitBtn.textContent = 'Masuk'; submitBtn.disabled = false; }
  // Tampilkan tombol Kembali jika ada kredensial tersimpan
  const backBtn = document.getElementById('lf-back-btn');
  if (backBtn) backBtn.style.display = _getSavedCred() ? '' : 'none';
}

// Ganti Akun: isi form dengan data lama agar bisa diedit
function showSwitchAccount() {
  auth.signOut().catch(() => {});
  const cred = _getSavedCred();
  _showLoginFormUI(cred ? cred.email : '', cred ? cred.pass : '');
}

// Kembali ke STATE A (tombol Kembali di form ganti akun)
function showLogin() {
  const cred = _getSavedCred();
  if (cred) {
    _showRememberedUI(cred.email, localStorage.getItem('wp_remember_name'));
  } else {
    _showLoginFormUI();
  }
}

function showRegister() {
  document.getElementById('login-remembered').style.display = 'none';
  document.getElementById('login-form').style.display       = 'none';
  document.getElementById('register-form').style.display    = '';
  document.getElementById('rf-err').textContent = '';
}

// ────────────────────────────────────────────────────────────
//  LANJUTKAN
// ────────────────────────────────────────────────────────────
async function loginRemembered() {
  const btn   = document.getElementById('btn-lanjut');
  const errEl = document.getElementById('lr-err');
  if (btn)   { btn.textContent = '⏳ Memuat...'; btn.disabled = true; }
  if (errEl)   errEl.textContent = '';

  const user = auth.currentUser;
  if (user) { showAppScreen(user); return; }

  const cred = _getSavedCred();
  if (!cred) {
    if (btn) { btn.textContent = '🚀 Lanjutkan'; btn.disabled = false; }
    _showLoginFormUI();
    return;
  }

  try {
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    const result = await auth.signInWithEmailAndPassword(cred.email, cred.pass);
    const displayName = result.user.displayName || cred.email.split('@')[0];
    _saveCred(cred.email, cred.pass, displayName);
    showAppScreen(result.user);
  } catch (e) {
    if (errEl) errEl.textContent = friendlyAuthError(e.code);
    if (btn)   { btn.textContent = '🚀 Lanjutkan'; btn.disabled = false; }
  }
}

// ────────────────────────────────────────────────────────────
//  LOGIN MANUAL
// ────────────────────────────────────────────────────────────
async function doLogin() {
  const emailEl   = document.getElementById('lf-email');
  const passEl    = document.getElementById('lf-pass');
  const errEl     = document.getElementById('lf-err');
  const submitBtn = document.getElementById('lf-submit');
  const email = emailEl.value.trim();
  const pass  = passEl.value;
  errEl.textContent = '';
  if (!email || !pass) { errEl.textContent = 'Email dan password wajib diisi'; return; }
  submitBtn.textContent = 'Masuk...'; submitBtn.disabled = true;
  try {
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    const result = await auth.signInWithEmailAndPassword(email, pass);
    const displayName = result.user.displayName || email.split('@')[0];
    _saveCred(email, pass, displayName);
    showAppScreen(result.user);
  } catch (e) {
    errEl.textContent = friendlyAuthError(e.code);
    submitBtn.textContent = 'Masuk'; submitBtn.disabled = false;
  }
}

// ────────────────────────────────────────────────────────────
//  REGISTER
// ────────────────────────────────────────────────────────────
async function doRegister() {
  const email = document.getElementById('rf-email').value.trim();
  const pass  = document.getElementById('rf-pass').value;
  const name  = document.getElementById('rf-name').value.trim();
  const errEl = document.getElementById('rf-err');
  errEl.textContent = '';
  if (!email || !pass || !name) { errEl.textContent = 'Semua field wajib diisi'; return; }
  if (pass.length < 6) { errEl.textContent = 'Password minimal 6 karakter'; return; }
  try {
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    const result = await auth.createUserWithEmailAndPassword(email, pass);
    await result.user.updateProfile({ displayName: name });
    _saveCred(email, pass, name);
    showAppScreen(result.user);
  } catch (e) {
    errEl.textContent = friendlyAuthError(e.code);
  }
}

// ────────────────────────────────────────────────────────────
//  ACCOUNT MODAL
// ────────────────────────────────────────────────────────────
function showAccountModal() {
  document.getElementById('acc-email-display').textContent = currentUser?.email || '—';
  document.getElementById('account-modal').style.display = 'flex';
}

// Ganti Akun dari dalam app
function switchAccount() {
  closeModal('account-modal');
  // Kembalikan ke login screen dengan form isi data lama (bisa diedit)
  const loginEl = document.getElementById('screen-login');
  const appEl   = document.getElementById('screen-app');
  if (loginEl) loginEl.classList.remove('hidden');
  if (appEl)   appEl.classList.remove('visible');
  if (dbRef) { try { dbRef.off(); } catch (e) {} dbRef = null; }
  showSwitchAccount();
}

// Logout — kredensial TETAP tersimpan, saat buka lagi tampil Lanjutkan
async function doLogout() {
  closeModal('account-modal');
  window._dashInitDone  = undefined;
  window._riwayatYear   = undefined;
  await auth.signOut().catch(() => {});
  showLoginScreen(); // akan tampil STATE A karena cred masih ada
}

// ────────────────────────────────────────────────────────────
//  SHOW APP SCREEN
// ────────────────────────────────────────────────────────────
function showAppScreen(user) {
  currentUser = user; uid = user.uid;
  const loginEl = document.getElementById('screen-login');
  const appEl   = document.getElementById('screen-app');
  if (loginEl) loginEl.classList.add('hidden');
  if (appEl)   appEl.classList.add('visible');
  const accEmail  = document.getElementById('acc-email-display');
  const accNameSb = document.getElementById('acc-name-sb');
  if (accEmail)  accEmail.textContent  = user.email;
  if (accNameSb) accNameSb.textContent = user.displayName || user.email;
  hideLoadingScreen();
  initDB();
}

// ────────────────────────────────────────────────────────────
//  AUTH STATE LISTENER — sinkronisasi saja, BUKAN auto-login
// ────────────────────────────────────────────────────────────
auth.onAuthStateChanged(user => {
  const appEl      = document.getElementById('screen-app');
  const appVisible = appEl && appEl.classList.contains('visible');
  if (user) {
    if (!appVisible) showAppScreen(user);
  } else {
    showLoginScreen();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const user       = auth.currentUser;
    const appEl      = document.getElementById('screen-app');
    const appVisible = appEl && appEl.classList.contains('visible');
    if (!user && appVisible) showLoginScreen();
  }
});

window.addEventListener('pageshow', e => {
  if (e.persisted) {
    setTimeout(() => {
      const user    = auth.currentUser;
      const appEl   = document.getElementById('screen-app');
      const loginEl = document.getElementById('screen-login');
      if (!user && appEl && appEl.classList.contains('visible')) showLoginScreen();
      else if (user && loginEl && !loginEl.classList.contains('hidden')) showAppScreen(user);
    }, 300);
  }
});

// ────────────────────────────────────────────────────────────
//  HELPER ERROR
// ────────────────────────────────────────────────────────────
function friendlyAuthError(code) {
  const map = {
    'auth/invalid-email'         : 'Email tidak valid',
    'auth/user-not-found'        : 'Akun tidak ditemukan',
    'auth/wrong-password'        : 'Password salah',
    'auth/email-already-in-use'  : 'Email sudah terdaftar',
    'auth/weak-password'         : 'Password terlalu lemah',
    'auth/invalid-credential'    : 'Email atau password salah',
    'auth/network-request-failed': 'Gagal terhubung ke jaringan',
    'auth/too-many-requests'     : 'Terlalu banyak percobaan, coba lagi nanti'
  };
  return map[code] || 'Terjadi kesalahan, coba lagi';
}
