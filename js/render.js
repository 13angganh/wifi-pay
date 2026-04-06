// ══════════════════════════════════════════
// render.js — Semua fungsi render view
// ══════════════════════════════════════════

// ── RENDER ROUTER ──
function render(){
  const c=document.getElementById('content');
  if(!c)return;
  Object.values(chartInstances).forEach(ch=>{try{ch.destroy();}catch(e){}});
  chartInstances={};
  // Simpan scroll position untuk entry agar tidak loncat ke atas saat expand/entry
  const isEntry=currentView==='entry';
  const savedScroll=isEntry?c.scrollTop:0;
  if(currentView==='dashboard') c.innerHTML=renderDashboard();
  else if(currentView==='entry') c.innerHTML=renderEntry();
  else if(currentView==='rekap') c.innerHTML=renderRekap();
  else if(currentView==='tunggakan') c.innerHTML=renderTunggakan();
  else if(currentView==='grafik') c.innerHTML=renderGrafik();
  else if(currentView==='log') c.innerHTML=renderLog();
  else if(currentView==='operasional') c.innerHTML=renderOperasional();
  else if(currentView==='members') c.innerHTML=renderMembers();
  else c.innerHTML=renderDashboard();
  // Entry: kembalikan scroll ke posisi semula (jangan loncat ke atas)
  if(isEntry) c.scrollTop=savedScroll;
  else c.scrollTop=0;
  updateLockBanner();
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('on',b.dataset.v===currentView));
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.v===currentView));
  const titleEl=document.getElementById('page-title');
  if(titleEl) titleEl.textContent=PAGE_TITLES[currentView]||currentView;
  updateThemeBtn();
  attachEvents();
  if(currentView==='grafik') setTimeout(initCharts,50);
}

// ── DASHBOARD ──
function renderDashboard(){
  const now=new Date();
  if(window._dashInitDone===undefined){selYear=now.getFullYear();selMonth=now.getMonth();window._dashInitDone=true;}
  const dy=selYear; const dm=selMonth;
  const krsTotal=getZoneTotal('KRS',dy,dm);
  const slkTotal=getZoneTotal('SLK',dy,dm);
  const totalIncome=krsTotal+slkTotal;
  const prevDm=dm===0?11:dm-1; const prevDy=dm===0?dy-1:dy;
  const krsPrev=getZoneTotal('KRS',prevDy,prevDm); const slkPrev=getZoneTotal('SLK',prevDy,prevDm);
  const krsPct2=krsPrev>0?Math.round(((krsTotal-krsPrev)/krsPrev)*100):null;
  const slkPct2=slkPrev>0?Math.round(((slkTotal-slkPrev)/slkPrev)*100):null;
  const pctBadge=(pct)=>{if(pct===null)return '';const up=pct>=0;return `<span style="font-size:9px;font-weight:600;color:${up?'#4CAF50':'#e05c5c'};margin-left:4px">${up?'▲':'▼'}${Math.abs(pct)}% vs ${MONTHS[prevDm]}</span>`;};
  const opsKey=`${dy}_${dm}`;
  const opsData=appData.operasional?.[opsKey]||{items:[]};
  const totalOps=(opsData.items||[]).reduce((s,it)=>s+(+it.nominal||0),0);
  const netIncome=totalIncome-totalOps;
  const krsAll=appData.krsMembers||[];
  const krsLunas=krsAll.filter(m=>isLunas('KRS',m,dy,dm)&&!isFree('KRS',m,dy,dm)).length;
  const krsBelum=krsAll.filter(m=>getPay('KRS',m,dy,dm)===null&&!isFree('KRS',m,dy,dm)).length;
  const slkAll=appData.slkMembers||[];
  const slkLunas=slkAll.filter(m=>isLunas('SLK',m,dy,dm)&&!isFree('SLK',m,dy,dm)).length;
  const slkBelum=slkAll.filter(m=>getPay('SLK',m,dy,dm)===null&&!isFree('SLK',m,dy,dm)).length;
  const krsPct=krsAll.length?Math.round(krsLunas/krsAll.length*100):0;
  const slkPct=slkAll.length?Math.round(slkLunas/slkAll.length*100):0;
  const krsFree=krsAll.filter(m=>isFree('KRS',m,dy,dm)).length;
  const slkFree=slkAll.filter(m=>isFree('SLK',m,dy,dm)).length;
  const totalFree=krsFree+slkFree;
  const allZones=['KRS','SLK']; const topTunggak=[];
  for(const z of allZones){
    const mems=z==='KRS'?appData.krsMembers:appData.slkMembers;
    for(const name of mems){
      const unpaid=getArrears(z,name,dy,dm).filter(u=>!isFree(z,name,u.y,u.mi));
      if(unpaid.length>0) topTunggak.push({z,name,count:unpaid.length,oldest:unpaid[0].label});
    }
  }
  topTunggak.sort((a,b)=>b.count-a.count);
  const top5=topTunggak.slice(0,5);
  const bulanLbl=`${MONTHS[dm]} ${dy}`;
  const lastBackup=localStorage.getItem('wp_last_backup');
  const backupLbl=lastBackup?new Date(+lastBackup).toLocaleDateString('id-ID'):'Belum pernah';
  const moOpts=MONTHS.map((m,i)=>`<option value="${i}"${i===dm?' selected':''}>${m}</option>`).join('');
  const yrOpts=YEARS.map(y=>`<option value="${y}"${y===dy?' selected':''}>${y}</option>`).join('');
  const tunggakCards=top5.length===0
    ?`<div style="text-align:center;padding:16px;color:#4CAF50;font-size:12px">✅ Semua lunas!</div>`
    :top5.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border2)">
        <div><span style="font-size:12px;color:var(--txt)">${t.name}</span><span style="font-size:9px;color:var(--txt4);margin-left:6px">${t.z}</span></div>
        <div style="text-align:right"><span style="font-size:11px;color:#e05c5c;font-weight:700">${t.count} bulan</span><div style="font-size:9px;color:var(--txt4)">sejak ${t.oldest}</div></div>
      </div>`).join('');
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:var(--txt)">📊 Dashboard</div>
    <div style="display:flex;gap:5px">
      <select class="cs" style="font-size:11px;padding:5px 8px" onchange="selMonth=+this.value;render()">${moOpts}</select>
      <select class="cs" style="font-size:11px;padding:5px 8px" onchange="selYear=+this.value;render()">${yrOpts}</select>
    </div>
  </div>
  <div style="font-size:9px;color:var(--txt4);letter-spacing:.07em;margin-bottom:6px">${bulanLbl.toUpperCase()}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px">
      <div style="font-size:9px;color:var(--txt4);margin-bottom:2px">KRS ${pctBadge(krsPct2)}</div>
      <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#2196F3">${rp(krsTotal)}</div>
      <div style="margin-top:6px">
        <div style="height:4px;background:var(--bg3);border-radius:2px;overflow:hidden"><div style="height:100%;width:${krsPct}%;background:#2196F3;border-radius:2px;transition:width .4s"></div></div>
        <div style="font-size:9px;color:var(--txt4);margin-top:3px">${krsLunas}/${krsAll.length} lunas (${krsPct}%)</div>
      </div>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px">
      <div style="font-size:9px;color:var(--txt4);margin-bottom:2px">SLK ${pctBadge(slkPct2)}</div>
      <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#e05c3a">${rp(slkTotal)}</div>
      <div style="margin-top:6px">
        <div style="height:4px;background:var(--bg3);border-radius:2px;overflow:hidden"><div style="height:100%;width:${slkPct}%;background:#e05c3a;border-radius:2px;transition:width .4s"></div></div>
        <div style="font-size:9px;color:var(--txt4);margin-top:3px">${slkLunas}/${slkAll.length} lunas (${slkPct}%)</div>
      </div>
    </div>
  </div>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <div><div style="font-size:9px;color:var(--txt4);margin-bottom:2px">PENDAPATAN KOTOR</div><div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#4CAF50">${rp(totalIncome)}</div></div>
      <div style="text-align:right"><div style="font-size:9px;color:var(--txt4);margin-bottom:2px">BERSIH (setelah ops)</div><div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:${netIncome>=0?'#4CAF50':'#e05c5c'}">${rp(netIncome)}</div></div>
    </div>
    ${totalOps>0?`<div style="font-size:10px;color:#e05c5c">💸 Operasional: ${rp(totalOps)}</div>`:'<div style="font-size:10px;color:var(--txt4)">💸 Belum ada data operasional</div>'}
  </div>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:11px;font-weight:700;color:var(--txt)">⚠️ Belum Bayar ${bulanLbl}</div>
      <div style="font-size:11px;color:#e05c5c;font-weight:700">${krsBelum+slkBelum} pelanggan</div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <div style="flex:1;background:var(--bg3);border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:var(--txt4)">KRS</div><div style="font-size:18px;font-weight:700;color:#e05c5c">${krsBelum}</div></div>
      <div style="flex:1;background:var(--bg3);border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:var(--txt4)">SLK</div><div style="font-size:18px;font-weight:700;color:#e05c5c">${slkBelum}</div></div>
      <div style="flex:1;background:var(--bg3);border-radius:8px;padding:8px;text-align:center"><div style="font-size:9px;color:var(--txt4)">LUNAS</div><div style="font-size:18px;font-weight:700;color:#4CAF50">${krsLunas+slkLunas}</div></div>
    </div>
    ${totalFree>0?`<div style="display:flex;align-items:center;justify-content:space-between;background:#0a2a1a;border:1px solid #4CAF5022;border-radius:7px;padding:7px 10px"><span style="font-size:10px;color:#4CAF50">🆓 Free member ${bulanLbl}</span><span style="font-size:12px;font-weight:700;color:#4CAF50">${totalFree} member <span style="font-size:9px;opacity:.7">(KRS:${krsFree} SLK:${slkFree})</span></span></div>`:''}
  </div>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px">
    <div style="font-size:11px;font-weight:700;color:var(--txt);margin-bottom:8px">🔴 Tunggakan Terbanyak</div>
    ${tunggakCards}
    ${topTunggak.length>5?`<div style="font-size:10px;color:var(--txt4);text-align:center;margin-top:8px;cursor:pointer" onclick="setView('tunggakan')">+${topTunggak.length-5} lainnya → Lihat semua</div>`:''}
  </div>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
    <div><div style="font-size:11px;font-weight:700;color:var(--txt)">💾 Backup Terakhir</div><div style="font-size:10px;color:var(--txt4);margin-top:2px">${backupLbl}</div></div>
    <button onclick="doManualBackup()" style="background:var(--bg3);border:1px solid var(--border);color:var(--txt2);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:11px">Backup Sekarang</button>
  </div>
  <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px">
    <div style="font-size:11px;font-weight:700;color:var(--txt);margin-bottom:8px">📤 Ringkasan WA</div>
    <button onclick="doWASummary()" style="width:100%;background:#0d2b1f;border:1px solid #4CAF5033;color:#4CAF50;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600">📊 Kirim Ringkasan Bulan Ini ke WA</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px">
    ${[['📝','Entry','entry'],['📊','Rekap','rekap'],['⚠️','Tunggak','tunggakan'],['📈','Grafik','grafik'],['👥','Member','members'],['💼','Ops','operasional']].map(([ic,lb,v])=>`<button onclick="setView('${v}')" style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:18px">${ic}</span><span style="font-size:10px;color:var(--txt2)">${lb}</span></button>`).join('')}
  </div>`;
}

// ── ENTRY ──
function renderEntry(){
  const mems=filteredMembers();
  const total=members().reduce((s,m)=>s+(getPay(activeZone,m,selYear,selMonth)||0),0);
  const paid=members().filter(m=>isLunas(activeZone,m,selYear,selMonth)&&!isFree(activeZone,m,selYear,selMonth)).length;
  const unpaid=members().filter(m=>getPay(activeZone,m,selYear,selMonth)===null&&!isFree(activeZone,m,selYear,selMonth)).length;
  const moOpts=MONTHS.map((m,i)=>`<option value="${i}"${i===selMonth?' selected':''}>${m}</option>`).join('');
  const yrOpts=YEARS.map(y=>`<option value="${y}"${y===selYear?' selected':''}>${y}</option>`).join('');
  const banner=deferredPrompt?`<div class="inst-banner"><div class="inst-txt">📲 Install WiFi Pay ke layar beranda!</div><button class="inst-btn" onclick="installPWA()">Install</button></div>`:'';
  const cards=mems.map((name,i)=>{
    const val=getPay(activeZone,name,selYear,selMonth);
    const freeMember=isFree(activeZone,name,selYear,selMonth);
    const info=getInfo(name);
    const exp=expandedCard===name;
    const idEl=info.id
      ?(info.ip?`<a class="mc-id" href="${info.ip.startsWith('http')?info.ip:'http://'+info.ip}" target="_blank" onclick="event.stopPropagation()">${info.id}</a>`
        :`<span class="mc-id" onclick="event.stopPropagation();openRiwayat('${activeZone}','${name.replace(/'/g,"\\'")}')" style="cursor:pointer">${info.id}</span>`)
      :'';
    const tagEl=freeMember
      ?`<span class="mc-tag" style="background:#0a3a25;color:#4CAF50;border-color:#4CAF5033;font-size:9px">🆓</span>`
      :val>0?`<span class="mc-tag tpaid">✓</span>`
      :val===0?`<span class="mc-tag" style="background:#0a2a1a;color:#3a9e7a;border:1px solid #3a9e7a44;font-size:9px">✓ 0</span>`
      :val===null?`<span class="mc-tag tunpaid">✕</span>`
      :`<span style="font-size:9px;color:var(--txt4)">○</span>`;
    const entryYear=window._entryYear?.[name]??selYear;
    const entryMonth=window._entryMonth?.[name]??selMonth;
    const entryVal=getPay(activeZone,name,entryYear,entryMonth);
    const entryFree=isFree(activeZone,name,entryYear,entryMonth);
    const moOptE=MONTHS.map((m,i)=>`<option value="${i}"${i===entryMonth?' selected':''}>${m}</option>`).join('');
    const yrOptE=YEARS.map(y=>`<option value="${y}"${y===entryYear?' selected':''}>${y}</option>`).join('');
    const body=exp?`
    <div class="mc-body">
      <div class="mc-row" style="margin-bottom:6px">
        <span class="mc-label">BULAN</span>
        <select class="cs" style="font-size:11px;padding:4px 8px" onchange="setEntryMonth('${name}',this.value,'year')">${yrOptE}</select>
        <select class="cs" style="font-size:11px;padding:4px 8px" onchange="setEntryMonth('${name}',this.value,'month')">${moOptE}</select>
      </div>
      ${entryFree?`<div style="background:#0a2a18;border:1px solid #4CAF5033;border-radius:7px;padding:8px;font-size:11px;color:#4CAF50;text-align:center">🆓 Member Gratis periode ini</div>`:`
      <div class="mc-row">
        <span class="mc-label">JUMLAH</span>
        <input class="mc-input" type="number" inputmode="numeric" placeholder="0" value="${entryVal!==null?entryVal:''}" data-name="${name}" id="inp-${name.replace(/\s/g,'_')}" onchange="saveEntryPay('${name}',this.value)" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
        ${entryVal!==null?`<button class="delbtn" onclick="clearEntryPay('${name}')">✕</button>`:''}
      </div>
      <div class="mc-row">
        <span class="mc-label">TGL BAYAR</span>
        <input class="mc-date" type="date" value="${info['date_'+entryYear+'_'+entryMonth]||''}" data-field="date_${entryYear}_${entryMonth}" data-name="${name}" onchange="saveInfoField(this)" autocomplete="off"/>
      </div>
      <div class="mc-row"><span class="mc-label">QUICK</span>
        <div class="qrow">${(()=>{const info2=getInfo(name);const tarif=info2.tarif;const tarifBtn=tarif?`<button class="qb" style="border-color:var(--zc);color:var(--zc);font-weight:700" onclick="quickEntryPay('${name}',${tarif})">${tarif} ★</button>`:'<span style="font-size:9px;color:var(--txt4);align-self:center">★ Belum ada tarif</span>';const others=QUICK.filter(a=>a!==tarif).map(a=>`<button class="qb" onclick="quickEntryPay('${name}',${a})">${a}</button>`).join('');return tarifBtn+others;})()}</div>
      </div>
      ${(()=>{const info2=getInfo(name);return !info2.tarif?'<div style="font-size:9px;color:var(--txt4);margin-top:-4px;margin-bottom:4px">💡 Set tarif di menu <b style="color:var(--txt3)">Member → ✏️ Edit</b></div>':'';})()}`}
    </div>`:'';
    const entLocked=globalLocked||(lockedEntries[activeZone+'__'+name]===true);
    const lockEntryBtn=`<button onclick="event.stopPropagation();toggleEntryLock('${activeZone}','${name.replace(/'/g,"\'")}') " style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px;color:${entLocked?'#4CAF50':"var(--txt4)"};flex-shrink:0" title="${entLocked?'Terkunci':'Tidak terkunci'}">${entLocked?svgLock():svgUnlock()}</button>`;
    return `<div class="mcard${exp?' expanded':''}" id="card-${name.replace(/\s/g,'_')}" data-name="${name}">
      <div class="mc-top" onclick="toggleCard('${name}')">
        ${idEl}<span class="mc-num">${i+1}</span>
        <span class="mc-name">${name}</span>
        ${val!==null?(val===0?'<span style="font-size:10px;color:#3a9e7a">Akm</span>':`<span style="font-size:11px;color:#4CAF50">${val.toLocaleString('id-ID')}</span>`):''}
        ${tagEl}${lockEntryBtn}
        <span style="color:var(--txt4);font-size:12px;margin-left:2px">${exp?'▲':'▼'}</span>
      </div>${body}</div>`;
  }).join('');
  return `${banner}
  <div class="ctrl-row">
    <select class="cs" onchange="selMonth=+this.value;render()">${moOpts}</select>
    <select class="cs" onchange="selYear=+this.value;render()">${yrOpts}</select>
  </div>
  <div class="search-wrap"><input class="search-box" id="entry-search" placeholder="🔍 Cari nama..." value="${search}" oninput="doSearch('entry',this.value)"/><button class="search-clear" id="entry-search-clear" onclick="clearSearch('entry')" style="display:${search?'flex':'none'}">✕</button></div>
  <div class="frow">
    ${[['all','Semua'],['paid','Lunas'],['unpaid','Belum']].map(([v,l])=>`<button class="fchip${filterStatus===v?' on':''}" onclick="filterStatus='${v}';render()">${l}</button>`).join('')}
  </div>
  <div class="sum-bar">
    <div><div class="sum-lbl">${MONTHS[selMonth]} ${selYear} · ${activeZone}</div><div class="sum-val">${rp(total)}</div></div>
    <div style="text-align:right;font-size:11px;color:var(--txt3);line-height:2"><span style="color:#4CAF50">✓ ${paid}</span>&nbsp;<span style="color:#e05c5c">✕ ${unpaid}</span></div>
  </div>
  <div id="entry-cards">${cards}</div>`;
}

// ── REKAP ──
function renderRekap(){
  if(activeZone==='TOTAL') activeZone='KRS';
  const mems=members().filter(m=>m.toLowerCase().includes(search.toLowerCase()));
  const yrOpts=YEARS.map(y=>`<option value="${y}"${y===selYear?' selected':''}>${y}</option>`).join('');
  const grand=MONTHS.reduce((s,_,mi)=>s+members().reduce((ss,m)=>ss+(getPay(activeZone,m,selYear,mi)||0),0),0);
  const rows=mems.map((name,i)=>{
    let rt=0;
    const cells=MONTHS.map((_,mi)=>{
      const raw=getPay(activeZone,name,selYear,mi);
      const free=isFree(activeZone,name,selYear,mi);
      const v=free?0:raw;
      rt+=v||0;
      const cls=v>0?'cv':v===0&&!free?'cz':'cn';
      const disp=free?`<span style="font-size:8px;opacity:.7">🆓</span>`:v===0?`<span style="font-size:8px;opacity:.8">Akm</span>`:v!==null?(v*1000).toLocaleString('id-ID'):'—';
      return `<td class="${cls}" onclick="goEntry('${name}',${mi},${selYear})" title="${free?'Free Member':''}">${disp}</td>`;
    }).join('');
    return `<tr data-name="${name}"><td class="stk" style="left:0;font-size:10px;color:var(--txt5);padding-left:8px;min-width:22px">${i+1}</td>
    <td class="stk" style="left:22px;min-width:95px;font-size:12px;text-align:left;padding-left:6px">${name}</td>
    ${cells}<td style="color:var(--zc);font-family:'Syne',sans-serif;font-weight:700">${rt.toLocaleString('id-ID')}</td></tr>`;
  }).join('');
  const ftCells=MONTHS.map((_,mi)=>{const t=members().reduce((s,m)=>s+(getPay(activeZone,m,selYear,mi)||0),0);return `<td style="color:#4CAF50;font-weight:700">${(t*1000).toLocaleString('id-ID')}</td>`;}).join('');
  return `<div style="display:flex;gap:7px;margin-bottom:10px;align-items:center">
    <select class="cs" style="flex:none;width:auto" onchange="selYear=+this.value;render()">${yrOpts}</select>
    <div class="search-wrap" style="flex:1;margin:0"><input class="search-box" id="rekap-search" style="margin:0" placeholder="🔍 cari..." value="${search}" oninput="doSearch('rekap',this.value)"/><button class="search-clear" id="rekap-search-clear" onclick="clearSearch('rekap')" style="display:${search?'flex':'none'}">✕</button></div>
  </div>
  <div class="sum-bar" style="margin-bottom:10px"><div class="sum-lbl">${activeZone} ${selYear}</div><div class="sum-val">${rp(grand)}</div></div>
  <div class="rekap-wrap">
  <table class="rtable">
    <thead><tr><th class="stk" style="left:0;min-width:22px">#</th><th class="stk" style="left:22px;text-align:left;min-width:95px">NAMA</th>${MONTHS.map(m=>`<th style="min-width:38px">${m}</th>`).join('')}<th style="color:var(--zc);min-width:52px">TOTAL</th></tr></thead>
    <tbody id="rekap-tbody">${rows}</tbody>
    <tfoot><tr style="background:var(--bg3);border-top:2px solid var(--border)"><td colspan="2" class="stk" style="left:0;font-size:10px;color:var(--txt4);padding-left:8px;background:var(--bg3)">TOTAL</td>${ftCells}<td style="color:var(--zc);font-family:'Syne',sans-serif;font-weight:800">${rp(grand)}</td></tr></tfoot>
  </table></div>`;
}

// ── TUNGGAKAN ──
function renderTunggakan(){
  if(activeZone==='TOTAL') activeZone='KRS';
  const yrOpts=YEARS.map(y=>`<option value="${y}"${y===selYear?' selected':''}>${y}</option>`).join('');
  const moOpts=MONTHS.map((m,i)=>`<option value="${i}"${i===selMonth?' selected':''}>${m}</option>`).join('');
  const mems=members();
  const allArrears=mems.map(name=>{
    const unpaid=getArrears(activeZone,name,selYear,selMonth).filter(u=>!isFree(activeZone,name,u.y,u.mi));
    return {name,unpaid,count:unpaid.length};
  }).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  const nakal=allArrears.filter(()=>true);
  const rajin=mems.filter(name=>{
    const nowFree=isFree(activeZone,name,selYear,selMonth);
    if(nowFree) return false;
    const unpaid=getArrears(activeZone,name,selYear,selMonth).filter(u=>!isFree(activeZone,name,u.y,u.mi));
    return unpaid.length===0;
  });
  const freeList=mems.filter(name=>isFree(activeZone,name,selYear,selMonth));
  const mode=window._tunggakanMode||'nakal';
  const nakalCards=nakal.length===0
    ?`<div style="text-align:center;padding:30px;color:#4CAF50;font-size:13px">✅ Semua lunas sampai bulan ini!</div>`
    :nakal.map((x,i)=>{
      const badges=x.unpaid.slice(0,12).map(u=>`<span class="tmonth">${u.label}</span>`).join('');
      const more=x.unpaid.length>12?`<span class="tmonth" style="color:var(--txt2)">+${x.unpaid.length-12} lagi</span>`:'';
      return `<div class="tcard"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span class="tcard-name">${i+1}. ${x.name}</span><span style="font-size:10px;color:#e05c5c;font-weight:600">${x.count} bulan nunggak</span></div><div class="tcard-months">${badges}${more}</div></div>`;
    }).join('');
  const rajinCards=rajin.length===0
    ?`<div style="text-align:center;padding:30px;color:var(--txt3);font-size:13px">Belum ada yang lunas sempurna</div>`
    :rajin.map((name,i)=>`<div class="tcard" style="border-color:#4CAF5033"><div style="display:flex;justify-content:space-between;align-items:center"><span class="tcard-name" style="color:#4CAF50">✅ ${i+1}. ${name}</span><span style="font-size:10px;color:#4CAF50">Lunas semua</span></div></div>`).join('');
  const freeCards=freeList.length===0?'':freeList.map((name,i)=>{
    const fm=appData.freeMembers?.[activeZone+'__'+name];
    const toStr=fm?.toYear!==undefined?` s/d ${MONTHS[fm.toMonth]} ${fm.toYear}`:'(selamanya)';
    return `<div class="tcard" style="border-color:#4CAF5022;background:#0a1a10"><div style="display:flex;justify-content:space-between;align-items:center"><span class="tcard-name" style="color:#4CAF50">🆓 ${i+1}. ${name}</span><span style="font-size:10px;color:#4CAF50">Gratis</span></div><div style="font-size:10px;color:var(--txt4);margin-top:3px">Dari ${MONTHS[fm.fromMonth]} ${fm.fromYear}${toStr}</div></div>`;
  }).join('');
  return `<div class="ctrl-row"><select class="cs" onchange="selMonth=+this.value;render()">${moOpts}</select><select class="cs" onchange="selYear=+this.value;render()">${yrOpts}</select></div>
  <div style="display:flex;gap:4px;margin-bottom:10px;background:var(--bg3);padding:3px;border-radius:20px;border:1px solid var(--border)">
    <button onclick="window._tunggakanMode='nakal';render()" style="flex:1;padding:7px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${mode==='nakal'?'#e05c3a':'transparent'};color:${mode==='nakal'?'#fff':"var(--txt3)"}">⚠️ Nunggak (${nakal.length})</button>
    <button onclick="window._tunggakanMode='rajin';render()" style="flex:1;padding:7px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${mode==='rajin'?'#4CAF50':'transparent'};color:${mode==='rajin'?'#0a0c12':"var(--txt3)"}">🌟 Rajin (${rajin.length})</button>
    <button onclick="window._tunggakanMode='free';render()" style="flex:1;padding:7px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${mode==='free'?'#3a5bce':'transparent'};color:${mode==='free'?'#fff':"var(--txt3)"}">🆓 Free (${freeList.length})</button>
  </div>
  <div class="sum-bar" style="margin-bottom:10px"><div class="sum-lbl">${mode==='nakal'?'TUNGGAKAN S/D':mode==='rajin'?'LUNAS S/D':'FREE MEMBER'} ${MONTHS[selMonth].toUpperCase()} ${selYear} · ${activeZone}</div><div class="sum-val" style="color:${mode==='nakal'?'#e05c5c':mode==='rajin'?'#4CAF50':'#2196F3'}">${mode==='nakal'?nakal.length:mode==='rajin'?rajin.length:freeList.length} pelanggan</div></div>
  ${mode==='nakal'?nakalCards:mode==='rajin'?rajinCards:freeCards}`;
}

// ── GRAFIK ──
function grafikMembers(){
  if(activeZone==='TOTAL') return [...appData.krsMembers,...appData.slkMembers];
  return activeZone==='KRS'?appData.krsMembers:appData.slkMembers;
}
function grafikPay(name,year,mi){
  if(activeZone==='TOTAL') return (appData.payments?.[getKey('KRS',name,year,mi)]||0)+(appData.payments?.[getKey('SLK',name,year,mi)]||0);
  return appData.payments?.[getKey(activeZone,name,year,mi)]||0;
}

function renderGrafik(){
  const yrOpts=YEARS.map(y=>`<option value="${y}"${y===selYear?' selected':''}>${y}</option>`).join('');
  const zc=activeZone==='KRS'?'#2196F3':activeZone==='SLK'?'#e05c3a':'#4CAF50';
  const mData=MONTHS.map((_,mi)=>{
    if(activeZone==='TOTAL') return getZoneTotal('KRS',selYear,mi)+getZoneTotal('SLK',selYear,mi);
    return grafikMembers().reduce((s,m)=>s+(appData.payments?.[getKey(activeZone,m,selYear,mi)]||0),0);
  });
  const mNonZero=mData.filter(v=>v>0);
  const mAvg=mNonZero.length?Math.round(mNonZero.reduce((a,b)=>a+b,0)/mNonZero.length):0;
  const mTotal=mData.reduce((a,b)=>a+b,0);
  const yData=YEARS.map(y=>{
    if(activeZone==='TOTAL') return MONTHS.reduce((s,_,mi)=>s+getZoneTotal('KRS',y,mi)+getZoneTotal('SLK',y,mi),0);
    return MONTHS.reduce((s,_,mi)=>s+grafikMembers().reduce((ss,m)=>ss+(appData.payments?.[getKey(activeZone,m,y,mi)]||0),0),0);
  });
  const yNonZero=yData.filter(v=>v>0);
  const yAvg=yNonZero.length?Math.round(yNonZero.reduce((a,b)=>a+b,0)/yNonZero.length):0;
  const mPct=mData.map((v,i)=>{
    if(i===0){const prevYear=selYear-1;let prevVal=0;if(activeZone==='TOTAL')prevVal=getZoneTotal('KRS',prevYear,11)+getZoneTotal('SLK',prevYear,11);else prevVal=grafikMembers().reduce((s,m)=>s+(appData.payments?.[getKey(activeZone,m,prevYear,11)]||0),0);if(!prevVal)return null;return Math.round(((v-prevVal)/prevVal)*100);}
    const prev=mData[i-1];if(!prev)return null;return Math.round(((v-prev)/prev)*100);
  });
  const yPct=yData.map((v,i)=>{if(i===0)return null;const prev=yData[i-1];if(!prev)return null;return Math.round(((v-prev)/prev)*100);});
  const pctBadge=(pct)=>{if(pct===null)return '';const up=pct>=0;return `<span style="font-size:10px;font-weight:600;color:${up?'#4CAF50':'#e05c5c'};margin-left:6px">${up?'▲':'▼'}${Math.abs(pct)}%</span>`;};
  const curYi=YEARS.indexOf(selYear);
  const curYPct=curYi>0?yPct[curYi]:null;
  const prevYTotal=curYi>0?yData[curYi-1]:0;
  return `<div class="ctrl-row" style="justify-content:space-between;align-items:center">
    <select class="cs" onchange="selYear=+this.value;render()">${yrOpts}</select>
    <div style="display:flex;gap:3px;background:var(--bg3);padding:3px;border-radius:20px;border:1px solid var(--border)">
      <button onclick="switchZone('KRS')" style="padding:5px 14px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${activeZone==='KRS'?'#2196F3':'transparent'};color:${activeZone==='KRS'?'#fff':"var(--txt3)"}">KRS</button>
      <button onclick="switchZone('SLK')" style="padding:5px 14px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${activeZone==='SLK'?'#e05c3a':'transparent'};color:${activeZone==='SLK'?'#fff':"var(--txt3)"}">SLK</button>
      <button onclick="switchZone('TOTAL')" style="padding:5px 14px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${activeZone==='TOTAL'?'#4CAF50':'transparent'};color:${activeZone==='TOTAL'?'#0a0c12':"var(--txt3)"}">TOTAL</button>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px"><div style="font-size:9px;color:var(--txt3);letter-spacing:.06em;margin-bottom:4px">TOTAL ${selYear}${pctBadge(curYPct)}</div><div style="font-size:15px;font-weight:700;color:${zc}">${rp(mTotal)}</div><div style="font-size:10px;color:var(--txt4);margin-top:3px">Avg/bulan: ${rp(mAvg)}</div></div>
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px"><div style="font-size:9px;color:var(--txt3);letter-spacing:.06em;margin-bottom:4px">VS TAHUN LALU${pctBadge(curYPct)}</div><div style="font-size:15px;font-weight:700;color:${zc}">${rp(yAvg)}</div><div style="font-size:10px;color:var(--txt4);margin-top:3px">Prev: ${rp(prevYTotal)}</div></div>
  </div>
  <div class="chart-box"><div class="chart-title">PENDAPATAN BULANAN ${selYear} · ${activeZone}</div><div class="chart-wrap"><canvas id="chart-monthly"></canvas></div></div>
  <div class="chart-box"><div class="chart-title">PERBANDINGAN TAHUNAN · ${activeZone}</div><div class="chart-wrap"><canvas id="chart-yearly"></canvas></div></div>
  <div class="chart-box"><div class="chart-title">KRS vs SLK ${selYear}</div><div class="chart-wrap"><canvas id="chart-compare"></canvas></div></div>`;
}

function initCharts(){
  const zc=activeZone==='KRS'?'#2196F3':activeZone==='SLK'?'#e05c3a':'#4CAF50';
  const cfg={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`Rp ${(ctx.raw*1000).toLocaleString('id-ID')}`}}},scales:{x:{grid:{color:darkMode?'#1e2231':'#d0d4e0'},ticks:{color:darkMode?'#777':'#5a6080',font:{family:'DM Mono',size:10}}},y:{grid:{color:darkMode?'#1e2231':'#d0d4e0'},ticks:{color:darkMode?'#777':'#5a6080',font:{family:'DM Mono',size:10},callback:v=>'Rp '+(v*1000).toLocaleString('id-ID')}}}};
  const mData=MONTHS.map((_,mi)=>{if(activeZone==='TOTAL')return getZoneTotal('KRS',selYear,mi)+getZoneTotal('SLK',selYear,mi);return members().reduce((s,m)=>s+(getPay(activeZone,m,selYear,mi)||0),0);});
  const cm=document.getElementById('chart-monthly');
  if(cm){chartInstances.monthly=new Chart(cm,{type:'bar',data:{labels:MONTHS,datasets:[{data:mData,backgroundColor:zc+'99',borderColor:zc,borderWidth:2,borderRadius:4}]},options:{...cfg}});}
  const yData=YEARS.map(y=>{if(activeZone==='TOTAL')return MONTHS.reduce((s,_,mi)=>s+getZoneTotal('KRS',y,mi)+getZoneTotal('SLK',y,mi),0);return MONTHS.reduce((s,_,mi)=>s+members().reduce((ss,m)=>ss+(getPay(activeZone,m,y,mi)||0),0),0);});
  const cy=document.getElementById('chart-yearly');
  if(cy){chartInstances.yearly=new Chart(cy,{type:'line',data:{labels:YEARS.map(String),datasets:[{data:yData,borderColor:zc,backgroundColor:zc+'22',borderWidth:2,tension:0.4,fill:true,pointBackgroundColor:zc,pointRadius:4}]},options:{...cfg}});}
  const kData=MONTHS.map((_,mi)=>getZoneTotal('KRS',selYear,mi));
  const sData=MONTHS.map((_,mi)=>getZoneTotal('SLK',selYear,mi));
  const tData=MONTHS.map((_,mi)=>kData[mi]+sData[mi]);
  const cc=document.getElementById('chart-compare');
  if(cc){chartInstances.compare=new Chart(cc,{type:'line',data:{labels:MONTHS,datasets:[
    {label:'KRS',data:kData,borderColor:'#2196F3',backgroundColor:'#2196F322',borderWidth:2,tension:0.4,fill:false,pointBackgroundColor:'#2196F3',pointRadius:3},
    {label:'SLK',data:sData,borderColor:'#e05c3a',backgroundColor:'#e05c3a22',borderWidth:2,tension:0.4,fill:false,pointBackgroundColor:'#e05c3a',pointRadius:3},
    {label:'TOTAL',data:tData,borderColor:'#4CAF50',backgroundColor:'#4CAF5022',borderWidth:2,tension:0.4,fill:false,pointBackgroundColor:'#4CAF50',pointRadius:3,borderDash:[4,3]}
  ]},options:{...cfg,plugins:{legend:{display:true,labels:{color:darkMode?'#888':'#5a6080',font:{family:'DM Mono',size:10},boxWidth:12}},tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: Rp ${(ctx.raw*1000).toLocaleString('id-ID')}`}}}}});}
}

// ── LOG ──
function renderLog(){
  const logs=appData.activityLog||[];
  const logSearch=window._logSearch||'';
  const logYear=window._logYear??'';
  const logMonth=window._logMonth??'';
  const logType=window._logType||'all';
  let filtered=logs;
  if(logType==='pay'){filtered=filtered.filter(l=>l.action&&(l.action.includes('💰')||l.action.includes('🗑️ Hapus bayar')||l.action.includes('Quick Pay')||l.action.includes('🆓')));}
  if(logSearch.trim()){const q=logSearch.trim().toLowerCase();filtered=filtered.filter(l=>(l.action||'').toLowerCase().includes(q)||(l.detail||'').toLowerCase().includes(q));}
  if(logYear||logMonth!==''){filtered=filtered.filter(l=>{const d=new Date(l.ts);if(logYear&&d.getFullYear()!==+logYear)return false;if(logMonth!==''&&d.getMonth()!==+logMonth)return false;return true;});}
  const yrOpts=`<option value="">Semua Tahun</option>`+YEARS.map(y=>`<option value="${y}"${logYear==y?' selected':''}>${y}</option>`).join('');
  const moOpts=`<option value="">Semua Bulan</option>`+MONTHS.map((m,i)=>`<option value="${i}"${logMonth===i?' selected':''}>${m}</option>`).join('');
  const logItems=filtered.length===0
    ?`<div style="text-align:center;padding:30px;color:var(--txt3);font-size:13px">📋 Tidak ada log ditemukan</div>`
    :filtered.slice(0,150).map(l=>{
      const d=new Date(l.ts);
      const dt=`${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
      const isPayLog=l.action&&(l.action.includes('💰')||l.action.includes('🗑️ Hapus bayar')||l.action.includes('🆓')||l.action.includes('Quick Pay'));
      return `<div class="log-item" data-text="${((l.action||'')+(l.detail||'')).toLowerCase().replace(/"/g,'')}" data-pay="${isPayLog?1:0}" style="${isPayLog?'border-left:2px solid #4CAF5044':'border-left:2px solid var(--border)'}"><div class="log-time">${dt} · ${l.user||'—'}</div><div class="log-action">${l.action}</div>${l.detail?`<div class="log-detail">${l.detail}</div>`:''}</div>`;
    }).join('');
  return `<div style="margin-bottom:10px">
    <div style="display:flex;gap:4px;margin-bottom:8px;background:var(--bg3);padding:3px;border-radius:20px;border:1px solid var(--border)">
      <button onclick="window._logType='all';render()" style="flex:1;padding:6px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${logType==='all'?'#2196F3':'transparent'};color:${logType==='all'?'#fff':"var(--txt3)"}">📋 Semua</button>
      <button onclick="window._logType='pay';render()" style="flex:1;padding:6px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${logType==='pay'?'#4CAF50':'transparent'};color:${logType==='pay'?'#0a0c12':"var(--txt3)"}">💰 Hanya Bayar</button>
    </div>
    <div class="search-wrap" style="margin-bottom:8px"><input class="search-box" id="log-search" style="margin:0" placeholder="🔍 Cari nama / aksi..." value="${logSearch}" oninput="doSearch('log',this.value)"/><button class="search-clear" id="log-search-clear" onclick="clearSearch('log')" style="display:${logSearch?'flex':'none'}">✕</button></div>
    <div style="display:flex;gap:6px">
      <select class="cs" style="flex:1" onchange="window._logYear=this.value;render()">${yrOpts}</select>
      <select class="cs" style="flex:1" onchange="window._logMonth=this.value===''?'':+this.value;render()">${moOpts}</select>
      <button onclick="window._logSearch='';window._logYear='';window._logMonth='';window._logType='all';render()" style="background:var(--bg3);border:1px solid var(--border);color:var(--txt3);padding:6px 10px;border-radius:7px;cursor:pointer;font-size:11px">Reset</button>
    </div>
  </div>
  <div style="font-size:10px;color:var(--txt3);margin-bottom:10px;letter-spacing:.06em">${filtered.length} dari ${logs.length} LOG · Semua log dihapus otomatis 30 hari</div>
  <div id="log-items">${logItems}</div>`;
}

// ── MEMBERS ──
function renderMembers(){
  const zone=newMemberZone;
  const zc=zone==='KRS'?'#2196F3':'#e05c3a';
  const memberTab=window._memberTab||'active';
  let mems=zone==='KRS'?[...appData.krsMembers]:[...appData.slkMembers];
  const sortMode=window._memberSort||'name-asc';
  if(sortMode==='name-asc') mems.sort((a,b)=>a.localeCompare(b));
  else if(sortMode==='name-desc') mems.sort((a,b)=>b.localeCompare(a));
  else if(sortMode==='id-asc') mems.sort((a,b)=>{const ia=appData.memberInfo?.[zone+'__'+a]?.id||'zzz';const ib=appData.memberInfo?.[zone+'__'+b]?.id||'zzz';return ia.localeCompare(ib,undefined,{numeric:true});});
  else if(sortMode==='id-desc') mems.sort((a,b)=>{const ia=appData.memberInfo?.[zone+'__'+a]?.id||'';const ib=appData.memberInfo?.[zone+'__'+b]?.id||'';return ib.localeCompare(ia,undefined,{numeric:true});});
  else if(sortMode==='ip-asc') mems.sort((a,b)=>{const ia=appData.memberInfo?.[zone+'__'+a]?.ip||'zzz';const ib=appData.memberInfo?.[zone+'__'+b]?.ip||'zzz';return ia.localeCompare(ib,undefined,{numeric:true});});
  else if(sortMode==='ip-desc') mems.sort((a,b)=>{const ia=appData.memberInfo?.[zone+'__'+a]?.ip||'';const ib=appData.memberInfo?.[zone+'__'+b]?.ip||'';return ib.localeCompare(ia,undefined,{numeric:true});});
  const filtered=mems.filter(m=>m.toLowerCase().includes(search.toLowerCase()));
  const rows=filtered.map((name,i)=>{
    const info=appData.memberInfo?.[zone+'__'+name]||{};
    const isFreeNow=isFree(zone,name,selYear,selMonth);
    const idBadge=info.id?`<span class="mem-id-badge">${info.id}</span>`:'<span class="mem-id-badge" style="color:var(--txt4);border-color:var(--border)">—</span>';
    const freeBadge=isFreeNow?`<span style="background:#0a2a18;border:1px solid #4CAF5033;color:#4CAF50;font-size:9px;padding:2px 6px;border-radius:4px;flex-shrink:0">🆓 Free</span>`:'';
    const editBtn=!membersLocked?`<button onclick="openEditMember('${zone}','${name.replace(/'/g,"\'")}') " style="background:none;border:1px solid #1e3a5f;color:#2196F3;padding:4px 8px;border-radius:5px;cursor:pointer;font-size:10px;flex-shrink:0">✏️</button>`:'';
    const freeBtn=!membersLocked?`<button onclick="openFreeModal('${zone}','${name.replace(/'/g,"\'")}') " style="background:${isFreeNow?'#0a2a18':'none'};border:1px solid ${isFreeNow?'#4CAF50':'#1e3a5f'};color:${isFreeNow?'#4CAF50':"var(--txt3)"};padding:4px 8px;border-radius:5px;cursor:pointer;font-size:10px;flex-shrink:0">🆓</button>`:'';
    const delBtn=!membersLocked?`<button class="delbtn" onclick="deleteMember('${zone}','${name.replace(/'/g,"\'")}') " style="flex-shrink:0">✕</button>`:'';
    const ipLink=info.ip?`<a href="${info.ip.startsWith('http')?info.ip:'http://'+info.ip}" target="_blank" rel="noopener" style="color:#2196F3;font-size:10px;text-decoration:none;border:1px solid #1e3a5f;padding:2px 6px;border-radius:4px;flex-shrink:0;font-family:'DM Mono',monospace" onclick="event.stopPropagation()">🔗 ${info.ip}</a>`:'';
    const tarifBadge=info.tarif?`<span style="background:var(--bg3);border:1px solid var(--border);color:var(--txt3);font-size:9px;padding:2px 6px;border-radius:4px;flex-shrink:0">${rp(info.tarif)}</span>`:'';
    return `<div class="mem-row" data-name="${name}" style="flex-direction:column;align-items:stretch;gap:5px">
      <div style="display:flex;align-items:center;gap:6px">
        <span class="mem-num">${i+1}.</span>${idBadge}
        <span class="mem-name-txt" onclick="event.stopPropagation();openRiwayat('${zone}','${name.replace(/'/g,'\'')}')" style="cursor:pointer">${name}</span>
        ${freeBadge}${tarifBadge}${ipLink}
      </div>
      ${!membersLocked?`<div style="display:flex;gap:5px;justify-content:flex-end">${freeBtn}${editBtn}${delBtn}</div>`:''}
    </div>`;
  }).join('');
  const lockBtn=`<button onclick="toggleMembersLock()" style="background:${membersLocked?'#0d2b1f':'#1f0d0d'};border:1px solid ${membersLocked?'#4CAF5033':'#e05c5c33'};color:${membersLocked?'#4CAF50':'#e05c5c'};padding:7px 16px;border-radius:7px;cursor:pointer;font-size:11px">${membersLocked?svgLock()+' Terkunci':svgUnlock()+' Tidak Terkunci'}</button>`;
  const sortLabels={'name-asc':'Nama A-Z','name-desc':'Nama Z-A','id-asc':'ID ↑','id-desc':'ID ↓','ip-asc':'IP ↑','ip-desc':'IP ↓'};
  const sortBtns=Object.entries(sortLabels).map(([k,l])=>`<button onclick="window._memberSort='${k}';render()" style="padding:4px 9px;border-radius:10px;border:none;cursor:pointer;font-size:10px;background:${sortMode===k?'#2196F3':"var(--bg3)"};color:${sortMode===k?'#fff':"var(--txt3)"}">${l}</button>`).join('');
  const deletedList=Object.entries(appData.deletedMembers||{}).filter(([k])=>k.startsWith(zone+'__'));
  const deletedCards=deletedList.length===0
    ?`<div style="text-align:center;padding:30px;color:var(--txt3);font-size:12px">🗑️ Recycle bin kosong</div>`
    :deletedList.sort((a,b)=>b[1].deletedAt-a[1].deletedAt).map(([k,d])=>{
      const dt=new Date(d.deletedAt).toLocaleDateString('id-ID');
      const payCount=Object.keys(d.payments||{}).length;
      return `<div class="del-card"><div><div class="del-card-name">🗑️ ${d.name}</div><div class="del-card-info">Dihapus: ${dt} · ${payCount} data bayar</div></div><div style="display:flex;gap:6px;flex-shrink:0"><button class="restore-btn" onclick="restoreMember('${k}')">♻️ Kembalikan</button><button onclick="permanentDelete('${k}')" style="background:#1f0d0d;border:1px solid #e05c5c55;color:#e05c5c;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px">🗑️</button></div></div>`;
    }).join('');
  const addForm=membersLocked?'':`<div class="add-form"><div class="af-title">TAMBAH MEMBER BARU KE ${zone}</div><div class="af-grid"><div><div style="font-size:10px;color:var(--txt3);margin-bottom:4px">NAMA</div><input class="af-input" id="af-name" placeholder="Nama member" onkeydown="if(event.key==='Enter')addMember()" autocomplete="off" autocorrect="off" autocapitalize="characters"/></div><div><div style="font-size:10px;color:var(--txt3);margin-bottom:4px">ID PELANGGAN</div><input class="af-input" id="af-id" placeholder="Opsional" autocomplete="off"/></div><div style="grid-column:span 2"><div style="font-size:10px;color:var(--txt3);margin-bottom:4px">IP / LINK ROUTER</div><input class="af-input" id="af-ip" placeholder="192.168.x.x atau http://..." autocomplete="off"/></div><div><div style="font-size:10px;color:var(--txt3);margin-bottom:4px">TARIF (×1000)</div><input class="af-input" id="af-tarif" type="number" inputmode="numeric" placeholder="Contoh: 100" autocomplete="off"/></div></div><button style="width:100%;background:${zc};color:#fff;border:none;padding:10px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer" onclick="addMember()">+ Tambah ke ${zone}</button></div>`;
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <div style="display:flex;gap:3px;background:var(--bg3);padding:3px;border-radius:24px;border:1px solid var(--border)">
      <button onclick="newMemberZone='KRS';search='';window._memberTab='active';render()" style="padding:6px 16px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${zone==='KRS'?'#2196F3':'transparent'};color:${zone==='KRS'?'#fff':"var(--txt3)"}">KRS <span style="opacity:.6;font-size:10px">(${appData.krsMembers.length})</span></button>
      <button onclick="newMemberZone='SLK';search='';window._memberTab='active';render()" style="padding:6px 16px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${zone==='SLK'?'#e05c3a':'transparent'};color:${zone==='SLK'?'#fff':"var(--txt3)"}">SLK <span style="opacity:.6;font-size:10px">(${appData.slkMembers.length})</span></button>
    </div>${lockBtn}
  </div>
  <div style="display:flex;gap:4px;margin-bottom:10px;background:var(--bg2);padding:3px;border-radius:20px;border:1px solid var(--border)">
    <button onclick="window._memberTab='active';render()" style="flex:1;padding:6px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${memberTab==='active'?zc:'transparent'};color:${memberTab==='active'?'#fff':"var(--txt3)"}">👥 Aktif (${mems.length})</button>
    <button onclick="window._memberTab='deleted';render()" style="flex:1;padding:6px;border-radius:16px;border:none;cursor:pointer;font-size:11px;font-weight:600;background:${memberTab==='deleted'?'#e05c3a':'transparent'};color:${memberTab==='deleted'?'#fff':"var(--txt3)"}">🗑️ Terhapus (${deletedList.length})</button>
  </div>
  ${memberTab==='deleted'?deletedCards:`${addForm}<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${sortBtns}</div><div class="search-wrap"><input class="search-box" id="member-search" placeholder="🔍 Cari nama di ${zone}..." value="${search}" oninput="doSearch('member',this.value)"/><button class="search-clear" id="member-search-clear" onclick="clearSearch('member')" style="display:${search?'flex':'none'}">✕</button></div><div style="font-size:10px;color:var(--txt4);margin-bottom:8px">${filtered.length} member${search?' ditemukan':''} · ${zone}</div><div id="member-rows">${rows||'<div style="text-align:center;padding:20px;color:var(--txt3);font-size:12px">Tidak ada member</div>'}</div>`}`;
}

// ── OPERASIONAL ──
function renderOperasional(){
  const now=new Date();
  const opsYear=window._opsYear??now.getFullYear();
  const opsMonth=window._opsMonth??now.getMonth();
  const minYear=2026; const minMonth=0;
  const yrOpts=YEARS.filter(y=>y>=2026).map(y=>`<option value="${y}"${y===opsYear?' selected':''}>${y}</option>`).join('');
  const moOpts=MONTHS.map((m,i)=>{const disabled=(opsYear===minYear&&i<minMonth);return `<option value="${i}"${i===opsMonth?' selected':''}${disabled?' disabled':''}>${m}</option>`;}).join('');
  const krsTotal=getZoneTotal('KRS',opsYear,opsMonth);
  const slkTotal=getZoneTotal('SLK',opsYear,opsMonth);
  const grossIncome=krsTotal+slkTotal;
  const opsKey=`${opsYear}_${opsMonth}`;
  const opsData=appData.operasional?.[opsKey]||{items:[]};
  const items=opsData.items||[];
  const totalOps=items.reduce((s,it)=>s+(+it.nominal||0),0);
  const netIncome=grossIncome-totalOps;
  const itemRows=items.map((it,i)=>`<div class="ops-row" style="align-items:stretch"><input class="ops-input wide" placeholder="Keterangan (listrik, internet...)" value="${it.label||''}" onchange="updateOpsItem(${i},'label',this.value)" autocomplete="off" autocorrect="off"/><input class="ops-input num" type="number" inputmode="numeric" placeholder="0" value="${it.nominal||''}" onchange="updateOpsItem(${i},'nominal',this.value)" autocomplete="off"/><button onclick="deleteOpsItem(${i})" style="background:#1f0d0d;border:1px solid #e05c5c55;color:#e05c5c;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;flex-shrink:0">✕</button></div>`).join('');
  return `<div class="ctrl-row" style="margin-bottom:10px"><select class="cs" onchange="setOpsMonth(this.value,'year')">${yrOpts}</select><select class="cs" onchange="setOpsMonth(this.value,'month')">${moOpts}</select><span style="font-size:11px;color:var(--txt3)">${MONTHS[opsMonth]} ${opsYear}</span></div>
  <div class="ops-card"><div style="font-size:10px;color:var(--txt3);letter-spacing:.06em;margin-bottom:10px">PENGELUARAN OPERASIONAL</div>${itemRows}<button onclick="addOpsItem()" style="width:100%;background:var(--bg3);border:1px dashed #1e3a5f;color:#2196F3;padding:9px;border-radius:8px;cursor:pointer;font-size:12px;margin-top:6px">+ Tambah Item</button></div>
  <div class="ops-result">
    <div class="ops-result-row"><span class="ops-result-lbl">📥 Pendapatan KRS</span><span class="ops-result-val" style="color:#2196F3">${rp(krsTotal)}</span></div>
    <div class="ops-result-row"><span class="ops-result-lbl">📥 Pendapatan SLK</span><span class="ops-result-val" style="color:#e05c3a">${rp(slkTotal)}</span></div>
    <div class="ops-result-row" style="border-top:2px solid var(--border);margin-top:4px"><span class="ops-result-lbl" style="color:#4CAF50">💰 Pendapatan Kotor</span><span class="ops-result-val" style="color:#4CAF50;font-size:15px">${rp(grossIncome)}</span></div>
    <div class="ops-result-row"><span class="ops-result-lbl" style="color:#e05c5c">💸 Total Pengeluaran</span><span class="ops-result-val" style="color:#e05c5c">${rp(totalOps)}</span></div>
    <div class="ops-result-row" style="background:#0a2010;border-radius:8px;padding:10px;margin-top:6px;border:1px solid #4CAF5033"><span class="ops-result-lbl" style="color:#4CAF50;font-size:13px;font-weight:700">✅ PENDAPATAN BERSIH</span><span class="ops-result-val" style="color:${netIncome>=0?'#4CAF50':'#e05c5c'};font-size:17px">${rp(netIncome)}</span></div>
  </div>`;
}

// ── RIWAYAT ──
function renderRiwayat(zone,name,year){
  const content=document.getElementById('riwayat-content');
  const sumEl=document.getElementById('riwayat-summary');
  const sumLbl=document.getElementById('rw-sum-lbl');
  const sumVal=document.getElementById('rw-sum-val');
  const yearLbl=document.getElementById('rw-year-lbl');
  const prevBtn=document.getElementById('rw-prev');
  const nextBtn=document.getElementById('rw-next');
  const tabsEl=document.getElementById('rw-year-tabs');
  if(!content) return;
  const nowYear=new Date().getFullYear();
  const minYear=YEARS[0]; const maxYear=YEARS[YEARS.length-1];
  if(yearLbl) yearLbl.textContent=year;
  if(prevBtn) prevBtn.disabled=(year<=minYear);
  if(nextBtn) nextBtn.disabled=(year>=maxYear);
  if(tabsEl){
    tabsEl.innerHTML=YEARS.map(y=>`<button class="rw-year-tab${y===year?' active':''}" onclick="window._riwayatYear=${y};renderRiwayat('${zone}','${name.replace(/'/g,"\'")}',${y})">${y}</button>`).join('');
    setTimeout(()=>{const activeTab=tabsEl.querySelector('.rw-year-tab.active');if(activeTab)activeTab.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});},50);
  }
  const info=appData.memberInfo?.[zone+'__'+name]||{};
  let lunas=0; let totalVal=0;
  const rows=MONTHS.map((mName,mi)=>{
    const v=getPay(zone,name,year,mi);
    const free=isFree(zone,name,year,mi);
    const tgl=info['date_'+year+'_'+mi]||'';
    let statusHtml='';let isLunasMonth=false;
    if(free){statusHtml=`<span style="color:#4CAF50;font-size:11px">🆓 Free</span>`;isLunasMonth=true;}
    else if(v!==null&&v>0){statusHtml=`<span style="color:#4CAF50;font-size:11px;font-weight:600">${rp(v)}</span>`;isLunasMonth=true;totalVal+=v;}
    else if(v===0){statusHtml=`<span style="color:#3a9e7a;font-size:11px">✓ Akumulasi</span>`;isLunasMonth=true;}
    else{statusHtml=`<span style="color:#e05c5c;font-size:11px">✕ Belum</span>`;}
    if(isLunasMonth&&!free) lunas++;
    const nowMonth=new Date().getMonth();
    const isFuture=(year===nowYear&&mi>nowMonth);
    if(isFuture) return '';
    return `<div class="rw-month-row" onclick="goEntryFromRiwayat('${zone}','${name.replace(/'/g,"\'")}',${year},${mi})" title="Tap untuk entry bulan ini">
      <div><div style="font-size:12px;color:var(--txt)">${mName} ${year}</div>${tgl?`<div style="font-size:9px;color:var(--txt4)">${tgl}</div>`:''}</div>
      ${statusHtml}
    </div>`;
  }).filter(Boolean);
  content.innerHTML=rows.join('')||`<div style="text-align:center;padding:20px;color:var(--txt3);font-size:12px">Tidak ada data tahun ${year}</div>`;
  const totalMonths=rows.length;
  if(sumEl&&sumLbl&&sumVal){sumEl.style.display='flex';sumLbl.textContent=`${lunas}/${totalMonths} bulan lunas`;sumVal.textContent=rp(totalVal);}
}
