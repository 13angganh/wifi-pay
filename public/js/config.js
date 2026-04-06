// ══════════════════════════════════════════
// config.js — Firebase Config & Init
// ══════════════════════════════════════════

firebase.initializeApp({
  apiKey: "AIzaSyAQ5Yn0KuTMCWvLBoFzyU7FQjf9tR4hhkY",
  authDomain: "wifi-pay-online.firebaseapp.com",
  databaseURL: "https://wifi-pay-online-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wifi-pay-online",
  storageBucket: "wifi-pay-online.firebasestorage.app",
  messagingSenderId: "836904224947",
  appId: "1:836904224947:web:2c86e81353542791e008c6"
});

const auth = firebase.auth();
const db = firebase.database();

// ══════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
const YEARS = (()=>{ const y=[]; for(let i=2023;i<=new Date().getFullYear()+2;i++) y.push(i); return y; })();
const QUICK = [50,80,90,100,150,200];

const DEFAULT_KRS = ["ABIL","ADIT","AJI","AKBAR","ALFIN","ANA","ARIFIN","ARPAN","AYU NANDA","B-ANI","B-IKE","B-NINGSIH","B-WULAN","BAGAS","BERI","CECEK","DAYAT","DELLA","DIKA JON","DISTY","DIYAN","EGA","ELLA","ENGGAR","ESRA","FARHAN","FEBI","FEMLI","FERA","FIRLI","GILANG","GO","HABIBAH","HABIL","HALIK","HAMIM","HOLIP","ICAN","IING","IMAM","IMAMAH","INTAN GN","INTAN RIO","JIHAN","LENI","LILIS","LINDA","MAHRUS","MAY","MUHAMMAD","MUIS","NATUL","NIA","NININ","NONIK","NORMA","P-BUDI","POS","PUPUT","QORI","QORI SAS","RAGIL","RANI","RIA","RIFA","RILA","RIRIB","RITA","ROSI","RYAN","SAHYUN","SANTI","SDN","SIFA","SUD","SURYA","TK PGRI","UCI","VINA","VIO","WAHYU","WARSA","WAWAN","WILDA","WILDAN","YENI","ZEN"];
const DEFAULT_SLK = ["AFAN","AIDI","AMIN","ANAS","ANGGUN","ANIS","BAY","CLARA","DAIFI","DHEA","DIKRI","ELIYA","ERFAN","FAHMI","FAIL","FATIA","FIROCH","GUNAWAN","H-MUALIS","HAIKAL","HENDRA","IKROM","INUL","IPUL","IRHAM","LUKMAN","MAHRUS","MAKSUM","MAY","MELLY","NAFIS","NAUFAL","NIA SALAK","NISA","NURIL","OPEK","P-IIL","RIFKI","RINA","ROBI","ROSI","SAMSUDI","SATAM","SHELA","SHOFIA","SOFI","SUKI","SUTIK","UUS","VIVI","WAHYU","WARDA","ZAHDAN"];

// ── UTILITY FUNCTIONS ──
function fbKey(s){ return s.replace(/\./g,'-').replace(/#/g,'-').replace(/\$/g,'-').replace(/\[/g,'-').replace(/]/g,'-').replace(/\//g,'-'); }
function enc(s){ try{ return btoa(unescape(encodeURIComponent(s))); }catch(e){ return ''; } }
function dec(s){ try{ return decodeURIComponent(escape(atob(s))); }catch(e){ return ''; } }
function rp(v){ return 'Rp '+(v*1000).toLocaleString('id-ID'); }
function rpShort(v){ return v!==null&&v!==undefined?(v*1000).toLocaleString('id-ID'):'—'; }

// ── LOCK SVG HELPERS ──
function svgLock(){
  return '<svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle">'
    +'<rect x="1" y="6" width="11" height="8" rx="2" fill="currentColor"/>'
    +'<path d="M3.5 6V4.5a3 3 0 0 1 6 0V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>'
    +'<circle cx="6.5" cy="10" r="1.1" fill="#0a0c12"/>'
    +'</svg>';
}
function svgUnlock(){
  return '<svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle">'
    +'<rect x="1" y="6" width="11" height="8" rx="2" fill="currentColor"/>'
    +'<path d="M3.5 6V4a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>'
    +'<line x1="9.5" y1="4" x2="16" y2="1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    +'<circle cx="16.5" cy="0.8" r="1.3" fill="currentColor"/>'
    +'</svg>';
}
