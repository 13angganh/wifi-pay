// ══════════════════════════════════════════
// data.js — Firebase DB, Sync, Helpers, Backup, Import/Export
// ══════════════════════════════════════════

// ── DB INIT ──
function initDB(){
  setSyncStatus('loading');
  dbRef=db.ref('users/'+uid+'/data');

  // ── Listener realtime untuk lock status (terpisah dari data utama) ──
  dbRef.child('_globalLocked').on('value',snap=>{
    const val=snap.val();
    if(val!==null && typeof val==='boolean'){
      globalLocked=val;
      localStorage.setItem('wp_global_locked',val?'1':'0');
      updateLockBanner();
      render();
    }
  });
  dbRef.child('_lockedEntries').on('value',snap=>{
    const val=snap.val();
    if(val!==null && typeof val==='object'){
      lockedEntries=val||{};
      localStorage.setItem('wp_locked_entries',JSON.stringify(lockedEntries));
      render();
    }
  });

  dbRef.on('value',snap=>{
    const val=snap.val();
    // Hanya abaikan update jika SEDANG dalam proses simpan (race condition lokal)
    // Jangan abaikan berdasarkan waktu karena akan memblokir update dari device lain
    if(_isSaving) return;
    if(val&&(val.krsMembers||val.payments)){
      const mergedFree=val.freeMembers||{};
      appData={
        krsMembers: val.krsMembers||[],
        slkMembers: val.slkMembers||[],
        payments: val.payments||{},
        memberInfo: val.memberInfo||{},
        activityLog: val.activityLog||[],
        freeMembers: mergedFree,
        deletedMembers: val.deletedMembers||{},
        operasional: val.operasional||{}
      };
      cleanOldEditLogs();
    } else if(!val){
      appData={
        krsMembers:[...DEFAULT_KRS],
        slkMembers:[...DEFAULT_SLK],
        payments:{},memberInfo:{},activityLog:[],freeMembers:{},deletedMembers:{},operasional:{}
      };
    }
    setSyncStatus('ok');
    render();
    updateLockBanner();
    checkAutoBackup();
  },err=>{setSyncStatus('err');setSyncOffline();});
}

function saveDB(logEntry){
  if(!dbRef) return;
  setSyncStatus('loading');
  if(logEntry){
    if(!appData.activityLog) appData.activityLog=[];
    appData.activityLog.unshift({...logEntry,ts:Date.now(),user:currentUser?.email||'—'});
    if(appData.activityLog.length>200) appData.activityLog=appData.activityLog.slice(0,200);
  }
  _isSaving=true;
  _lastSaveTs=Date.now();
  dbRef.set(appData)
    .then(()=>{
      setSyncStatus('ok');
      // Lepas flag isSaving segera setelah save selesai
      // supaya update realtime dari device lain tidak terblokir
      _isSaving=false;
    })
    .catch(()=>{setSyncStatus('err'); _isSaving=false;});
}

function setSyncStatus(s){
  const dots=[document.getElementById('sdot'),document.getElementById('sdot2')];
  const lbl=document.getElementById('sync-lbl');
  dots.forEach(dot=>{
    if(!dot)return;
    if(s==='ok') dot.classList.remove('off');
    else if(s==='err') dot.classList.add('off');
    else dot.classList.remove('off');
  });
  if(!lbl)return;
  if(s==='ok') lbl.textContent='tersimpan';
  else if(s==='err') lbl.textContent='gagal sync';
  else lbl.textContent='menyimpan...';
}

function setSyncOffline(){
  const dots=[document.getElementById('sdot'),document.getElementById('sdot2')];
  const lbl=document.getElementById('sync-lbl');
  dots.forEach(dot=>{if(dot)dot.classList.add('off');});
  if(lbl) lbl.textContent='offline';
  if(!window._offlineToastShown){
    window._offlineToastShown=true;
    showToast('⚠️ Tidak ada koneksi — data mungkin belum lengkap','err');
    setTimeout(()=>{window._offlineToastShown=false;},30000);
  }
}

// ── HELPERS ──
function getKey(zone,name,year,month){ return `${zone}__${fbKey(name)}__${year}__${month}`; }
function getPay(zone,name,year,month){ return appData.payments?.[getKey(zone,name,year,month)]??null; }

function isFree(zone,name,year,month){
  const key=zone+'__'+name;
  const fm=appData.freeMembers?.[key];
  if(!fm||!fm.active) return false;
  const ym=year*12+month;
  const fromYm=fm.fromYear*12+fm.fromMonth;
  const toYm=(fm.toYear!=null&&fm.toMonth!=null)?fm.toYear*12+fm.toMonth:Infinity;
  return ym>=fromYm && ym<=toYm;
}

function getEffectivePay(zone,name,year,month){
  if(isFree(zone,name,year,month)) return 0;
  return appData.payments?.[getKey(zone,name,year,month)]??null;
}

function isLunas(zone,name,year,month){
  if(isFree(zone,name,year,month)) return true;
  return getPay(zone,name,year,month)!==null;
}

function cleanOldEditLogs(){
  if(!appData.activityLog||!appData.activityLog.length) return;
  const now=Date.now();
  const thirtyDays=30*24*60*60*1000;
  const before=appData.activityLog.length;
  appData.activityLog=appData.activityLog.filter(l=>!(l.ts&&(now-l.ts)>thirtyDays));
  if(appData.activityLog.length>200) appData.activityLog=appData.activityLog.slice(0,200);
  if(appData.activityLog.length<before && dbRef){ dbRef.set(appData); }
}

function members(){
  if(activeZone==='TOTAL') return [...appData.krsMembers,...appData.slkMembers];
  return activeZone==='KRS'?appData.krsMembers:appData.slkMembers;
}
function getInfo(name){ return appData.memberInfo?.[activeZone+'__'+name]||{}; }

function getZoneTotal(zone,year,mi){
  const mems=zone==='KRS'?appData.krsMembers:appData.slkMembers;
  return mems.reduce((s,m)=>s+(appData.payments?.[getKey(zone,m,year,mi)]||0),0);
}

function getArrears(zone,name,upToYear,upToMonth){
  const unpaid=[];
  for(let y of YEARS){
    if(y>upToYear) break;
    const maxM=(y===upToYear)?upToMonth:11;
    for(let mi=0;mi<=maxM;mi++){
      const v=getPay(zone,name,y,mi);
      if(v===null){ unpaid.push({label:`${MONTHS[mi]} ${y}`,y,mi}); }
    }
  }
  return unpaid;
}

// ── BACKUP ──
function doManualBackup(){
  const blob=new Blob([JSON.stringify({...appData,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`wifi-pay-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
  localStorage.setItem('wp_last_backup',Date.now().toString());
  showToast('✅ Backup berhasil!');
  render();
}

function checkAutoBackup(){
  const now=new Date();
  if(now.getDate()!==1) return;
  const lastKey='wp_last_backup';
  const last=localStorage.getItem(lastKey);
  if(last){
    const lastDate=new Date(+last);
    const sameMonth=lastDate.getMonth()===now.getMonth()&&lastDate.getFullYear()===now.getFullYear();
    if(sameMonth) return;
  }
  setTimeout(()=>{
    doManualBackup();
    showToast('💾 Auto backup tanggal 1 selesai!');
  },3000);
}

// ── WA SUMMARY ──
function doWASummary(){
  const now=new Date();
  const dy=now.getFullYear(); const dm=now.getMonth();
  const bulan=MONTHS[dm]+' '+dy;
  const krsTotal=getZoneTotal('KRS',dy,dm);
  const slkTotal=getZoneTotal('SLK',dy,dm);
  const total=krsTotal+slkTotal;
  const krsLunas=(appData.krsMembers||[]).filter(m=>isLunas('KRS',m,dy,dm)&&!isFree('KRS',m,dy,dm)).length;
  const slkLunas=(appData.slkMembers||[]).filter(m=>isLunas('SLK',m,dy,dm)&&!isFree('SLK',m,dy,dm)).length;
  const krsBelum=(appData.krsMembers||[]).filter(m=>getPay('KRS',m,dy,dm)===null&&!isFree('KRS',m,dy,dm)).length;
  const slkBelum=(appData.slkMembers||[]).filter(m=>getPay('SLK',m,dy,dm)===null&&!isFree('SLK',m,dy,dm)).length;
  const opsKey=`${dy}_${dm}`;
  const opsData=appData.operasional?.[opsKey]||{items:[]};
  const totalOps=(opsData.items||[]).reduce((s,it)=>s+(+it.nominal||0),0);
  const netIncome=total-totalOps;
  const tunggakKRS=(appData.krsMembers||[]).filter(m=>getArrears('KRS',m,dy,dm).filter(u=>!isFree('KRS',m,u.y,u.mi)).length>0).length;
  const tunggakSLK=(appData.slkMembers||[]).filter(m=>getArrears('SLK',m,dy,dm).filter(u=>!isFree('SLK',m,u.y,u.mi)).length>0).length;
  const msg=`📶 *WiFi Pay – Rekap ${bulan}*\n\n💰 *Pendapatan*\n  KRS : Rp ${(krsTotal*1000).toLocaleString('id-ID')}\n  SLK : Rp ${(slkTotal*1000).toLocaleString('id-ID')}\n  Total: Rp ${(total*1000).toLocaleString('id-ID')}\n\n✅ *Lunas*\n  KRS: ${krsLunas} | SLK: ${slkLunas}\n\n⚠️ *Belum Bayar ${bulan}*\n  KRS: ${krsBelum} | SLK: ${slkBelum}\n\n🔴 *Ada Tunggakan*\n  KRS: ${tunggakKRS} | SLK: ${tunggakSLK}\n\n💸 Operasional : Rp ${(totalOps*1000).toLocaleString('id-ID')}\n✨ Bersih         : Rp ${(netIncome*1000).toLocaleString('id-ID')}\n\n_WiFi Pay – ${new Date().toLocaleString('id-ID')}_`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

// ── EXPORT / IMPORT ──
function showExportModal(){
  const ey=document.getElementById('exp-year');
  if(ey) ey.innerHTML=YEARS.map(y=>`<option value="${y}"${y===selYear?' selected':''}>${y}</option>`).join('');
  document.getElementById('export-modal').style.display='flex';
}
function setExpFmt(f){
  expFmt=f;
  document.getElementById('exp-fmt-json').className='fmt-btn'+(f==='json'?' on':'');
  document.getElementById('exp-fmt-csv').className='fmt-btn'+(f==='csv'?' on':'');
  document.getElementById('exp-csv-opts').style.display=f==='csv'?'':'none';
}
function doExport(){
  closeModal('export-modal');
  if(expFmt==='json'){
    const blob=new Blob([JSON.stringify({...appData,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=`wifi-pay-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
    showToast('Backup JSON berhasil!');
  } else {
    const zone=document.getElementById('exp-zone').value;
    const year=+document.getElementById('exp-year').value;
    const {blob,filename}=generateExcel(zone,year,null);
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();
    showToast(`CSV ${zone} ${year} berhasil!`);
  }
}

function importData(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const raw=ev.target.result;
      const cleaned=raw.charCodeAt(0)===0xFEFF?raw.slice(1):raw;
      const data=JSON.parse(cleaned);
      if(!data||typeof data!=='object'||(!data.krsMembers&&!data.payments)){
        showToast('File tidak valid!','err');return;
      }
      if(dbRef){dbRef.off();dbRef=null;}
      appData={
        krsMembers: Array.isArray(data.krsMembers)?data.krsMembers:[],
        slkMembers: Array.isArray(data.slkMembers)?data.slkMembers:[],
        payments: (data.payments&&typeof data.payments==='object')?data.payments:{},
        memberInfo: (data.memberInfo&&typeof data.memberInfo==='object')?data.memberInfo:{},
        activityLog:[],
        freeMembers: (data.freeMembers&&typeof data.freeMembers==='object')?data.freeMembers:(appData.freeMembers||{}),
        deletedMembers: (data.deletedMembers&&typeof data.deletedMembers==='object')?data.deletedMembers:{},
        operasional: (data.operasional&&typeof data.operasional==='object')?data.operasional:{}
      };
      render();
      const krsLen=appData.krsMembers.length;
      const slkLen=appData.slkMembers.length;
      const payLen=Object.keys(appData.payments).length;
      showToast('✅ Import OK! '+krsLen+' KRS, '+slkLen+' SLK, '+payLen+' data');
      setSyncStatus('loading');
      const ref=db.ref('users/'+uid+'/data');
      ref.child('krsMembers').set(appData.krsMembers)
      .then(()=>ref.child('slkMembers').set(appData.slkMembers))
      .then(()=>ref.child('memberInfo').set(appData.memberInfo||{}))
      .then(()=>ref.child('activityLog').set([]))
      .then(()=>{
        const entries=Object.entries(appData.payments);
        const chunkSize=200;
        let chain=Promise.resolve();
        for(let i=0;i<entries.length;i+=chunkSize){
          const chunk=entries.slice(i,i+chunkSize);
          const obj={};
          chunk.forEach(([k,v])=>{obj[k]=v;});
          chain=chain.then(()=>ref.child('payments').update(obj));
        }
        return chain;
      })
      .then(()=>{
        setSyncStatus('ok');
        showToast('☁️ Cloud sync selesai!');
        dbRef=ref;
        dbRef.on('value',snap=>{
          const val=snap.val();
          if(val) appData={
            krsMembers:val.krsMembers||[],
            slkMembers:val.slkMembers||[],
            payments:val.payments||{},
            memberInfo:val.memberInfo||{},
            activityLog:val.activityLog||[],
            freeMembers:val.freeMembers||{},
            deletedMembers:val.deletedMembers||{},
            operasional:val.operasional||{}
          };
          render();
        });
      })
      .catch(err=>{
        setSyncStatus('err');
        showToast('Sync gagal: '+err.message,'err');
        dbRef=ref;
        dbRef.on('value',snap=>{
          const val=snap.val();
          if(val) appData={
            krsMembers:val.krsMembers||[],
            slkMembers:val.slkMembers||[],
            payments:val.payments||{},
            memberInfo:val.memberInfo||{},
            activityLog:val.activityLog||[],
            freeMembers:val.freeMembers||{},
            deletedMembers:val.deletedMembers||{},
            operasional:val.operasional||{}
          };
          render();
        });
      });
    }catch(err){
      showToast('Gagal baca file: '+err.message,'err');
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

// ── SHARE / PDF / EXCEL ──
function showShareModal(){
  const sm=document.getElementById('share-month');
  const sy=document.getElementById('share-year');
  sm.innerHTML=MONTHS.map((m,i)=>`<option value="${i}"${i===selMonth?' selected':''}>${m}</option>`).join('');
  sy.innerHTML=YEARS.map(y=>`<option value="${y}"${y===selYear?' selected':''}>${y}</option>`).join('');
  document.getElementById('share-zone').value=activeZone;
  document.getElementById('share-modal').style.display='flex';
}
function setShareType(t){
  shareType=t;
  document.getElementById('share-type-monthly').className='fmt-btn'+(t==='monthly'?' on':'');
  document.getElementById('share-type-yearly').className='fmt-btn'+(t==='yearly'?' on':'');
  document.getElementById('share-month-row').style.display=t==='monthly'?'':'none';
}
function setFmt(f){
  shareFmt=f;
  document.getElementById('fmt-pdf').className='fmt-btn'+(f==='pdf'?' on':'');
  document.getElementById('fmt-excel').className='fmt-btn'+(f==='excel'?' on':'');
}

async function doShare(){
  const zone=document.getElementById('share-zone').value;
  const year=+document.getElementById('share-year').value;
  const month=+document.getElementById('share-month').value;
  closeModal('share-modal');
  showToast('Membuat file...','info');
  try{
    let blob,filename;
    if(shareFmt==='pdf'){
      const result=await generatePDF(zone,year,shareType==='monthly'?month:null);
      blob=result.blob; filename=result.filename;
    } else {
      const result=generateExcel(zone,year,shareType==='monthly'?month:null);
      blob=result.blob; filename=result.filename;
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;a.click();
    setTimeout(()=>{
      const txt=encodeURIComponent(`Rekap WiFi Pay ${zone} ${shareType==='monthly'?MONTHS[month]+' ':''}${year}\nFile: ${filename}`);
      window.open(`https://wa.me/?text=${txt}`,'_blank');
    },1000);
    showToast('File siap, WhatsApp dibuka!');
    saveDB({action:`📤 Share rekap ${zone} ${shareType==='monthly'?MONTHS[month]+' ':''}${year} (${shareFmt.toUpperCase()})`});
  }catch(e){showToast('Gagal generate file','err');console.error(e);}
}

async function generatePDF(zone,year,month){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  const mems=zone==='ALL'?[...appData.krsMembers.map(n=>({n,z:'KRS'})),...appData.slkMembers.map(n=>({n,z:'SLK'}))]
    :(zone==='KRS'?appData.krsMembers:appData.slkMembers).map(n=>({n,z:zone}));
  const title=month!==null?`Rekap WiFi Pay ${zone} - ${MONTHS[month]} ${year}`:`Rekap WiFi Pay ${zone} - ${year}`;
  doc.setFontSize(14);doc.setFont('helvetica','bold');doc.text(title,14,16);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(150);
  doc.text(`Dibuat: ${new Date().toLocaleString('id-ID')}`,14,22);doc.setTextColor(0);
  let head,body,foot;
  if(month!==null){
    head=[['#','Nama','Zona','Tgl Bayar','Jumlah','Status']];
    body=mems.map(({n,z},i)=>{
      const v=getPay(z,n,year,month);
      const info=appData.memberInfo?.[z+'__'+n]||{};
      const dt=info['date_'+year+'_'+month]||'—';
      return [i+1,n,z,dt,v!==null?'Rp '+v.toLocaleString('id-ID'):'—',v!==null?'Lunas':'Belum'];
    });
    const total=mems.reduce((s,{n,z})=>s+(getPay(z,n,year,month)||0),0);
    foot=[['','','','TOTAL','Rp '+total.toLocaleString('id-ID'),'']];
  } else {
    head=[['#','Nama',...MONTHS,'Total']];
    body=mems.map(({n,z},i)=>{
      let t=0;
      const cols=MONTHS.map((_,mi)=>{const v=getPay(z,n,year,mi);t+=v||0;return v!==null?v:'—';});
      return [i+1,n,...cols,t.toLocaleString('id-ID')];
    });
    const totals=MONTHS.map((_,mi)=>mems.reduce((s,{n,z})=>s+(getPay(z,n,year,mi)||0),0));
    foot=[['','TOTAL',...totals.map(t=>t.toLocaleString('id-ID')),totals.reduce((a,b)=>a+b,0).toLocaleString('id-ID')]];
  }
  doc.autoTable({head,body,foot,startY:26,styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[30,34,49],textColor:[170,170,160]},footStyles:{fillColor:[20,24,36],textColor:[90,200,160],fontStyle:'bold'},alternateRowStyles:{fillColor:[15,18,28]},margin:{left:14,right:14}});
  const blob=doc.output('blob');
  const filename=`wifi-pay-${zone}-${month!==null?MONTHS[month]+'-':''}${year}.pdf`;
  return {blob,filename};
}

function generateExcel(zone,year,month){
  const mems=zone==='ALL'?[...appData.krsMembers.map(n=>({n,z:'KRS'})),...appData.slkMembers.map(n=>({n,z:'SLK'}))]
    :(zone==='KRS'?appData.krsMembers:appData.slkMembers).map(n=>({n,z:zone}));
  const wb=XLSX.utils.book_new();
  let ws;
  if(month!==null){
    const rows=[['#','Nama','Zona','Tgl Bayar','Jumlah','Status']];
    mems.forEach(({n,z},i)=>{
      const v=getPay(z,n,year,month);
      const info=appData.memberInfo?.[z+'__'+n]||{};
      rows.push([i+1,n,z,info['date_'+year+'_'+month]||'',v!==null?v:0,v!==null?'Lunas':'Belum']);
    });
    const total=mems.reduce((s,{n,z})=>s+(getPay(z,n,year,month)||0),0);
    rows.push(['','','','TOTAL',total,'']);
    ws=XLSX.utils.aoa_to_sheet(rows);
  } else {
    const rows=[['#','Nama','Zona',...MONTHS,'Total']];
    mems.forEach(({n,z},i)=>{
      let t=0;const cols=MONTHS.map((_,mi)=>{const v=getPay(z,n,year,mi);t+=v||0;return v||0;});
      rows.push([i+1,n,z,...cols,t]);
    });
    const totals=MONTHS.map((_,mi)=>mems.reduce((s,{n,z})=>s+(getPay(z,n,year,mi)||0),0));
    rows.push(['','TOTAL','',...totals,totals.reduce((a,b)=>a+b,0)]);
    ws=XLSX.utils.aoa_to_sheet(rows);
  }
  const sheetName=month!==null?`${MONTHS[month]} ${year}`:`Tahun ${year}`;
  XLSX.utils.book_append_sheet(wb,ws,sheetName);
  const blob=new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const filename=`wifi-pay-${zone}-${month!==null?MONTHS[month]+'-':''}${year}.xlsx`;
  return {blob,filename};
}
