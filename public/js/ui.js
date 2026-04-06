// ══════════════════════════════════════════
// ui.js — Toast, Modal, Sidebar, Theme, Loading, Lock, Search, Confirm
// ══════════════════════════════════════════

// ── LOADING SCREEN ──
function hideLoadingScreen(){
  const ls=document.getElementById('loading-screen');
  if(!ls||ls.classList.contains('gone')) return;
  ls.classList.add('fadeout');
  setTimeout(()=>ls.classList.add('gone'),450);
}
setTimeout(()=>hideLoadingScreen(),5000);

// ── SIDEBAR ──
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sidebar-overlay');
  if(!sb) return;
  const isOpen=sb.classList.contains('open');
  if(isOpen){closeSidebar();}
  else{sb.classList.add('open');if(ov)ov.classList.add('show');}
}
function closeSidebar(){
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sidebar-overlay');
  if(sb) sb.classList.remove('open');
  if(ov) ov.classList.remove('show');
}
function closeSidebarMobile(){
  if(window.innerWidth<768) closeSidebar();
}

// ── THEME ──
function toggleTheme(){
  darkMode=!darkMode;
  localStorage.setItem('wp_dark_mode',darkMode?'1':'0');
  document.body.classList.toggle('light',!darkMode);
  const thb=document.getElementById('theme-btn');
  if(thb){thb.classList.remove('spinning');void thb.offsetWidth;thb.classList.add('spinning');setTimeout(()=>thb.classList.remove('spinning'),400);}
  render();
}
function updateThemeBtn(){
  const thb=document.getElementById('theme-btn');
  if(thb) thb.textContent=darkMode?'🌙':'☀️';
}

// ── ZONE ──
function setZoneColor(z){
  const zc=z==='KRS'?'#2196F3':'#e05c3a';
  const zcdim=z==='KRS'?'#2196F322':'#e05c3a22';
  document.documentElement.style.setProperty('--zc',zc);
  document.documentElement.style.setProperty('--zcdim',zcdim);
  const logos=document.querySelectorAll('#logo');
  logos.forEach(l=>l.style.background=`linear-gradient(135deg,${zc},${zc}bb)`);
  document.querySelectorAll('.nb').forEach(b=>b.style.setProperty('--zc',zc));
  document.querySelectorAll('.zbtn').forEach(b=>{
    b.className='zbtn';
    if(b.textContent===z){if(z==='KRS')b.classList.add('krs');else b.classList.add('slk');}
  });
}

// ── TOAST ──
let toastT;
function showToast(msg,type='ok'){
  clearTimeout(toastT);
  let el=document.querySelector('.toast');
  if(!el){el=document.createElement('div');document.body.appendChild(el);}
  el.className=`toast t${type}`;el.textContent=msg;el.style.display='block';
  toastT=setTimeout(()=>{if(el)el.style.display='none';},2800);
}

// ── MODAL ──
function closeModal(id){ document.getElementById(id).style.display='none'; }

// ── LOCK BANNER ──
function updateLockBanner(){
  const banner=document.getElementById('lock-banner');
  const icon=document.getElementById('global-lock-icon');
  const lbl=document.getElementById('global-lock-lbl');
  const btn=document.getElementById('global-lock-btn');
  if(banner) banner.classList.toggle('show',globalLocked);
  if(icon) icon.innerHTML=globalLocked?svgLock():svgUnlock();
  if(lbl){lbl.textContent=globalLocked?'KUNCI':'BUKA';lbl.style.color=globalLocked?'#F44336':'#4CAF50';}
  if(btn) btn.style.color=globalLocked?'#F44336':'#4CAF50';
}

// ── GLOBAL SEARCH ──
function openGlobalSearch(){
  const modal=document.getElementById('gsearch-modal');
  if(modal){modal.classList.add('open');setTimeout(()=>{const b=document.getElementById('gsearch-box');if(b){b.value='';b.focus();}doGlobalSearch('');},50);}
}
function closeGlobalSearch(){
  const modal=document.getElementById('gsearch-modal');
  if(modal) modal.classList.remove('open');
}
function doGlobalSearch(q){
  const res=document.getElementById('gsearch-results');
  if(!res) return;
  if(!q.trim()){res.innerHTML='<div style="text-align:center;padding:40px;color:var(--txt4);font-size:13px">Ketik nama untuk mencari...</div>';return;}
  const results=[];
  for(const z of ['KRS','SLK']){
    const mems=z==='KRS'?appData.krsMembers:appData.slkMembers;
    for(const name of mems){
      if(name.toLowerCase().includes(q.toLowerCase())){
        const info=appData.memberInfo?.[z+'__'+name]||{};
        const val=getPay(z,name,selYear,selMonth);
        const paid=val!==null;
        const free=isFree(z,name,selYear,selMonth);
        results.push({z,name,info,paid,free,val});
      }
    }
  }
  if(!results.length){res.innerHTML='<div style="text-align:center;padding:40px;color:var(--txt4);font-size:13px">Tidak ditemukan</div>';return;}
  res.innerHTML=results.map(r=>`<div class="gsr-item" onclick="gotoMember('${r.z}','${r.name.replace(/'/g,"\'")}')">
    <span class="gsr-zone" style="background:${r.z==='KRS'?'#1e2a40':'#3d1f14'};color:${r.z==='KRS'?'#2196F3':'#e05c3a'}">${r.z}</span>
    <div style="flex:1">
      <div class="gsr-name">${r.name}</div>
      ${r.info.id?`<div style="font-size:9px;color:var(--txt4)">${r.info.id}${r.info.ip?' · '+r.info.ip:''}</div>`:''}
    </div>
    <div class="gsr-detail">
      ${r.free?'<span style="color:#4CAF50">🆓 Free</span>':r.paid&&r.val===0?'<span style="color:#3a9e7a">✓ Akumulasi</span>':r.paid?`<span style="color:#4CAF50">✓ ${r.val?.toLocaleString('id-ID')}</span>`:'<span style="color:#e05c5c">✕ Belum</span>'}
      ${r.info.tarif?`<div style="font-size:9px;color:var(--txt4)">Tarif: ${rp(r.info.tarif)}</div>`:''}
    </div>
  </div>`).join('');
}

// ── CONFIRM MODAL ──
function showConfirm(icon,msg,yesLabel,onYes){
  _confirmCallback=onYes;
  const m=document.getElementById('confirm-modal');
  const ic=document.getElementById('confirm-icon');
  const mg=document.getElementById('confirm-msg');
  const yb=document.getElementById('confirm-yes-btn');
  if(ic) ic.textContent=icon;
  if(mg) mg.innerHTML=msg;
  if(yb) yb.textContent=yesLabel||'Ya, Hapus';
  if(m) m.classList.add('open');
}
function closeConfirm(){
  _confirmCallback=null;
  const m=document.getElementById('confirm-modal');
  if(m) m.classList.remove('open');
}
function doConfirm(){
  const cb=_confirmCallback;
  closeConfirm();
  if(cb) cb();
}

// ── UPDATE BANNER ──
function showUpdateBanner(){
  const b=document.getElementById('update-banner');
  if(b) b.classList.add('show');
}
function doUpdate(){
  navigator.serviceWorker.getRegistration().then(reg=>{
    if(reg&&reg.waiting){ reg.waiting.postMessage({type:'SKIP_WAITING'}); }
    else { window.location.reload(true); }
  });
}

// ── SEARCH IN PLACE ──
function filterInPlace(containerSelector,itemSelector,matchFn){
  const container=document.getElementById(containerSelector);
  if(!container) return false;
  const items=container.querySelectorAll(itemSelector);
  if(!items.length) return false;
  items.forEach(el=>{ const show=matchFn(el); el.style.display=show?'':'none'; });
  return true;
}

function doSearch(type,val){
  const q=val.toLowerCase();
  if(type==='log') window._logSearch=val;
  else search=val;
  const clearId={'entry':'entry-search-clear','rekap':'rekap-search-clear','member':'member-search-clear','log':'log-search-clear'};
  const clearBtn=document.getElementById(clearId[type]);
  if(clearBtn) clearBtn.style.display=val?'flex':'none';
  if(type==='entry'){
    document.querySelectorAll('#entry-cards .mcard').forEach(el=>{
      const name=(el.dataset.name||'').toLowerCase();
      el.style.display=name.includes(q)?'':'none';
    });
  } else if(type==='rekap'){
    document.querySelectorAll('#rekap-tbody tr').forEach(el=>{
      const name=(el.dataset.name||'').toLowerCase();
      el.style.display=name.includes(q)?'':'none';
    });
  } else if(type==='member'){
    document.querySelectorAll('#member-rows .mem-row').forEach(el=>{
      const name=(el.dataset.name||'').toLowerCase();
      el.style.display=name.includes(q)?'':'none';
    });
  } else if(type==='log'){
    const logType=window._logType||'all';
    document.querySelectorAll('#log-items .log-item').forEach(el=>{
      const txt=(el.dataset.text||'').toLowerCase();
      const typeOk=logType==='all'||(el.dataset.pay==='1');
      el.style.display=(txt.includes(q)&&typeOk)?'':'none';
    });
  }
}

function clearSearch(type){
  if(type==='log') window._logSearch='';
  else search='';
  const inputId={'entry':'entry-search','rekap':'rekap-search','member':'member-search','log':'log-search'};
  const inp=document.getElementById(inputId[type]);
  if(inp) inp.value='';
  const selMap={'entry':'#entry-cards .mcard','rekap':'#rekap-tbody tr','member':'#member-rows .mem-row','log':'#log-items .log-item'};
  document.querySelectorAll(selMap[type]).forEach(el=>el.style.display='');
  if(type==='log') doSearch('log','');
  const clearId={'entry':'entry-search-clear','rekap':'rekap-search-clear','member':'member-search-clear','log':'log-search-clear'};
  const clearBtn=document.getElementById(clearId[type]);
  if(clearBtn) clearBtn.style.display='none';
}

// ── RIWAYAT MODAL ──
function openRiwayat(zone,name){
  const modal=document.getElementById('riwayat-modal');
  const title=document.getElementById('riwayat-title');
  if(!modal||!title) return;
  title.textContent=`📋 ${name} (${zone})`;
  window._riwayatZone=zone;
  window._riwayatName=name;
  if(!window._riwayatYear) window._riwayatYear=new Date().getFullYear();
  renderRiwayat(zone,name,window._riwayatYear);
  modal.classList.add('open');
  const box=document.getElementById('riwayat-box-inner');
  if(box){
    let tx=0;
    box.ontouchstart=e=>{tx=e.touches[0].clientX;};
    box.ontouchend=e=>{
      const dx=e.changedTouches[0].clientX-tx;
      if(Math.abs(dx)>50){ if(dx<0) riwayatNextYear(); else riwayatPrevYear(); }
    };
  }
}
function closeRiwayat(){
  const modal=document.getElementById('riwayat-modal');
  if(modal) modal.classList.remove('open');
  window._riwayatYear=new Date().getFullYear();
}
function riwayatPrevYear(){
  const minYear=YEARS[0];
  if(window._riwayatYear>minYear){ window._riwayatYear--; renderRiwayat(window._riwayatZone,window._riwayatName,window._riwayatYear); }
}
function riwayatNextYear(){
  const maxYear=YEARS[YEARS.length-1];
  if(window._riwayatYear<maxYear){ window._riwayatYear++; renderRiwayat(window._riwayatZone,window._riwayatName,window._riwayatYear); }
}
