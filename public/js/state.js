// ══════════════════════════════════════════
// state.js — Global State Variables
// ══════════════════════════════════════════

let currentUser = null, uid = null;
let appData = {
  krsMembers: [...DEFAULT_KRS],
  slkMembers: [...DEFAULT_SLK],
  payments: {},
  memberInfo: {},
  activityLog: [],
  freeMembers: {},
  deletedMembers: {},
  operasional: {}
};
let globalLocked = localStorage.getItem('wp_global_locked') === '1';
let lockedEntries = JSON.parse(localStorage.getItem('wp_locked_entries') || '{}');
let activeZone = "KRS", currentView = "dashboard";
let selYear = new Date().getFullYear(), selMonth = new Date().getMonth();
let search = "", filterStatus = "all", expandedCard = null;
let newMemberZone = "KRS";
let shareType = "monthly", shareFmt = "pdf", expFmt = "json";
let dbRef = null, deferredPrompt = null;
let chartInstances = {};
let pendingEdits = {};
let membersLocked = localStorage.getItem('wp_members_locked') === '1';
let darkMode = localStorage.getItem('wp_dark_mode') !== '0';
let _globalSearchOpen = false;
let _confirmCallback = null;

// Entry month state per card
window._entryYear = {};
window._entryMonth = {};

const PAGE_TITLES = {
  dashboard:'Beranda', entry:'Entry', rekap:'Rekap',
  tunggakan:'Tunggakan', grafik:'Grafik', log:'Log',
  members:'Member', operasional:'Operasional'
};
