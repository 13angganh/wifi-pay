// ══════════════════════════════════════════
// app.js — PWA, Service Worker, Init
// ══════════════════════════════════════════

// ── PWA INSTALL PROMPT ──
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredPrompt=e;
  if(currentView==='entry') render();
});

// ── SERVICE WORKER + AUTO UPDATE ──
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    reg.update();
    if(reg.waiting) showUpdateBanner();
    reg.addEventListener('updatefound',()=>{
      const newSW=reg.installing;
      newSW.addEventListener('statechange',()=>{
        if(newSW.state==='installed'&&navigator.serviceWorker.controller){ showUpdateBanner(); }
      });
    });
  });
  navigator.serviceWorker.addEventListener('message',e=>{
    if(e.data&&e.data.type==='SW_UPDATED') showUpdateBanner();
  });
  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!refreshing){refreshing=true;window.location.reload();}
  });
}

// ── INIT ──
if(!darkMode) document.body.classList.add('light');
setZoneColor('KRS');
updateThemeBtn();
