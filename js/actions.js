// ══════════════════════════════════════════
// actions.js — Pay, Member, Lock, Free, Operasional
// ══════════════════════════════════════════

// ── ZONE & VIEW ──
function switchZone(z){
  activeZone=z; search=''; filterStatus='all'; expandedCard=null;
  window._entryYear={}; window._entryMonth={};
  setZoneColor(z);
  render();
}

function setView(v){
  currentView=v; expandedCard=null; search=''; filterStatus='all';
  if(v!=='entry'){window._entryYear={}; window._entryMonth={};}
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  const titleEl=document.getElementById('page-title');
  if(titleEl) titleEl.textContent=PAGE_TITLES[v]||v;
  render();
}

function attachEvents(){
  // Event listeners ditangani via inline onchange/onclick di HTML yang di-render.
}

// ── ENTRY ACTIONS ──
function filteredMembers(){
  let m=members().filter(x=>x.toLowerCase().includes(search.toLowerCase()));
  if(filterStatus==='paid') m=m.filter(x=>isLunas(activeZone,x,selYear,selMonth)&&!isFree(activeZone,x,selYear,selMonth));
  if(filterStatus==='unpaid') m=m.filter(x=>getPay(activeZone,x,selYear,selMonth)===null);
  return m;
}

function toggleCard(name){
  const wasExpanded=expandedCard===name;
  expandedCard=wasExpanded?null:name;
  render();
  if(!wasExpanded && expandedCard){
    // Buka card: scroll supaya card terlihat di atas keyboard
    setTimeout(()=>{
      const el=document.getElementById('card-'+name.replace(/\s/g,'_'));
      if(el){
        // Scroll card ke posisi ~1/3 dari atas layar agar tidak ketutup keyboard
        const c=document.getElementById('content');
        const cardTop=el.offsetTop;
        const targetScroll=cardTop-80;
        if(c) c.scrollTop=Math.max(0,targetScroll);
      }
      const inp=document.getElementById('inp-'+name.replace(/\s/g,'_'));
      if(inp) inp.focus();
    },30);
  }
  // Saat tutup (wasExpanded=true): tidak ada scroll, tetap di posisi sekarang
}

function setEntryMonth(name,val,type){
  if(type==='year') window._entryYear[name]=+val;
  else window._entryMonth[name]=+val;
  expandedCard=name;
  // render() sudah jaga scroll di entry view
  render();
}

function saveEntryPay(name,val){
  if(globalLocked||(lockedEntries[activeZone+'__'+name]===true)){showToast('Data terkunci! Unlock dulu','err');return;}
  const ey=window._entryYear?.[name]??selYear;
  const em=window._entryMonth?.[name]??selMonth;
  if(!appData.payments) appData.payments={};
  const k=getKey(activeZone,name,ey,em);
  const old=getPay(activeZone,name,ey,em);
  if(val===''||val===null||val===undefined){
    delete appData.payments[k];
    saveDB({action:`🗑️ Hapus bayar ${activeZone} - ${name}`,detail:`${MONTHS[em]} ${ey}: ${old??'—'} → dihapus`});
    showToast(`${name} ${MONTHS[em]} ${ey} dihapus`,'err');
  } else {
    const amt=+val;
    if(isNaN(amt)){showToast('Nominal tidak valid','err');return;}
    appData.payments[k]=amt;
    const label=amt===0?'✓ Lunas (akumulasi)':rp(amt);
    const logLabel=amt===0?'Rp 0 (lunas akumulasi)':'Rp '+(amt*1000).toLocaleString('id-ID');
    saveDB({action:`💰 Bayar ${activeZone} - ${name}`,detail:`${MONTHS[em]} ${ey}: ${old??'—'} → ${logLabel}`});
    showToast(`${name} ${MONTHS[em]} ${ey} → ${label}`);
  }
  expandedCard=name;
  // Render tanpa scroll loncat — posisi scroll dipertahankan di render()
  render();
}

function clearEntryPay(name){
  if(globalLocked||(lockedEntries[activeZone+'__'+name]===true)){showToast('Data terkunci! Unlock dulu','err');return;}
  const ey=window._entryYear?.[name]??selYear;
  const em=window._entryMonth?.[name]??selMonth;
  const k=getKey(activeZone,name,ey,em);
  const old=getPay(activeZone,name,ey,em);
  if(old===null) return;
  showConfirm('🗑️',`Hapus pembayaran <b>${name}</b>?<br><span style="font-size:11px;color:var(--txt3)">${MONTHS[em]} ${ey} · ${old>0?rp(old):'Akumulasi'}</span>`,'Ya, Hapus',()=>{
    delete appData.payments[k];
    saveDB({action:`🗑️ Hapus bayar ${activeZone} - ${name}`,detail:`${MONTHS[em]} ${ey}: Rp ${(old||0)*1000} → dihapus`});
    showToast(`${name} ${MONTHS[em]} ${ey} dihapus`,'err');
    render();
  });
}

function quickEntryPay(name,amt){
  if(globalLocked||(lockedEntries[activeZone+'__'+name]===true)){showToast('Data terkunci! Unlock dulu','err');return;}
  const ey=window._entryYear?.[name]??selYear;
  const em=window._entryMonth?.[name]??selMonth;
  if(!appData.payments) appData.payments={};
  const old=getPay(activeZone,name,ey,em);
  appData.payments[getKey(activeZone,name,ey,em)]=amt;
  saveDB({action:`💰 Quick Pay ${activeZone} - ${name}`,detail:`${MONTHS[em]} ${ey}: ${old??'—'} → Rp ${(amt*1000).toLocaleString('id-ID')}`});
  showToast(`${name} ${MONTHS[em]} ${ey} → ${rp(amt)}`);
  expandedCard=name;
  // Render — posisi scroll dipertahankan di render()
  render();
}

function quickPay(name,amt){
  if(!appData.payments) appData.payments={};
  const old=getPay(activeZone,name,selYear,selMonth);
  appData.payments[getKey(activeZone,name,selYear,selMonth)]=amt;
  saveDB({action:`💰 Quick Pay ${activeZone} - ${name}`,detail:`${MONTHS[selMonth]} ${selYear}: ${old??'—'} → Rp ${(amt*1000).toLocaleString('id-ID')}`});
  showToast(`${name} → ${rp(amt)}`);
  expandedCard=null; render();
}

function clearPay(name){
  const k=getKey(activeZone,name,selYear,selMonth);
  const old=getPay(activeZone,name,selYear,selMonth);
  delete appData.payments[k];
  saveDB({action:`🗑️ Hapus bayar ${activeZone} - ${name}`,detail:`${MONTHS[selMonth]} ${selYear}: Rp ${(old||0)*1000} → dihapus`});
  showToast(`${name} dihapus`,'err');
  render();
}

function goEntry(name,month,year){
  selYear=year??selYear; selMonth=month; filterStatus='all';
  expandedCard=name; setView('entry'); search=name; render();
}

function saveInfoField(el){
  const name=el.dataset.name;
  const field=el.dataset.field;
  const val=el.value;
  const k=activeZone+'__'+name;
  if(!appData.memberInfo) appData.memberInfo={};
  if(!appData.memberInfo[k]) appData.memberInfo[k]={};
  appData.memberInfo[k][field]=val;
  saveDB({action:`📅 Update ${activeZone} - ${name}`,detail:`${field}: ${val}`});
  expandedCard=name;
  // render() jaga scroll di entry view
  render();
  showToast(`Tanggal bayar disimpan`);
}

// ── RIWAYAT ──
function goEntryFromRiwayat(zone,name,year,month){
  window._riwayatYear=new Date().getFullYear();
  closeRiwayat();
  activeZone=zone;
  setZoneColor(zone);
  selYear=year; selMonth=month;
  filterStatus='all';
  expandedCard=name;
  search=name;
  window._entryYear=window._entryYear||{};
  window._entryMonth=window._entryMonth||{};
  window._entryYear[name]=year;
  window._entryMonth[name]=month;
  currentView='entry';
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.v==='entry'));
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('on',b.dataset.v==='entry'));
  const titleEl=document.getElementById('page-title');
  if(titleEl) titleEl.textContent=PAGE_TITLES['entry']||'Entry';
  render();
  setTimeout(()=>{
    const el=document.getElementById('card-'+name.replace(/\s/g,'_'));
    if(el) el.scrollIntoView({behavior:'smooth',block:'nearest'});
  },100);
}

function gotoMember(zone,name){
  closeGlobalSearch();
  activeZone=zone;
  setZoneColor(zone);
  expandedCard=name; search=''; currentView='entry';
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.v==='entry'));
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('on',b.dataset.v==='entry'));
  const titleEl=document.getElementById('page-title');
  if(titleEl) titleEl.textContent=PAGE_TITLES['entry']||'Entry';
  render();
  setTimeout(()=>{const el=document.getElementById('card-'+name.replace(/\s/g,'_'));if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'});},100);
}

// ── LOCK ──
function toggleGlobalLock(){
  globalLocked=!globalLocked;
  localStorage.setItem('wp_global_locked',globalLocked?'1':'0');
  showToast(globalLocked?'🔒 Semua data entry terkunci':'🔓 Data entry tidak terkunci',globalLocked?'ok':'err');
  updateLockBanner();
  render();
}

function toggleMembersLock(){
  membersLocked=!membersLocked;
  localStorage.setItem('wp_members_locked',membersLocked?'1':'0');
  showToast(membersLocked?'🔒 Data member terkunci':'🔓 Data member tidak terkunci',membersLocked?'ok':'err');
  render();
}

function toggleEntryLock(zone,name){
  const k=zone+'__'+name;
  lockedEntries[k]=!lockedEntries[k];
  localStorage.setItem('wp_locked_entries',JSON.stringify(lockedEntries));
  showToast(lockedEntries[k]?`🔒 ${name} terkunci`:`🔓 ${name} tidak terkunci`);
  render();
}

// ── MEMBER CRUD ──
function addMember(){
  const name=(document.getElementById('af-name')?.value||'').trim().toUpperCase();
  const id=(document.getElementById('af-id')?.value||'').trim();
  const ip=(document.getElementById('af-ip')?.value||'').trim();
  const tarifRaw=(document.getElementById('af-tarif')?.value||'').trim();
  const tarif=tarifRaw?+tarifRaw:undefined;
  if(!name){showToast('Nama tidak boleh kosong','err');return;}
  const list=newMemberZone==='KRS'?appData.krsMembers:appData.slkMembers;
  if(list.includes(name)){showToast(`${name} sudah ada!`,'err');return;}
  list.push(name);list.sort();
  const k=newMemberZone+'__'+name;
  if(!appData.memberInfo) appData.memberInfo={};
  const info={id:'',ip:''};
  if(id) info.id=id;
  if(ip) info.ip=ip;
  if(tarif) info.tarif=tarif;
  appData.memberInfo[k]=info;
  saveDB({action:`➕ Tambah member ${newMemberZone} - ${name}`,detail:id?`ID: ${id}${ip?', IP: '+ip:''}`:''});
  showToast(`${name} ditambahkan ke ${newMemberZone}!`);
  if(document.getElementById('af-name')) document.getElementById('af-name').value='';
  if(document.getElementById('af-id')) document.getElementById('af-id').value='';
  if(document.getElementById('af-ip')) document.getElementById('af-ip').value='';
  if(document.getElementById('af-tarif')) document.getElementById('af-tarif').value='';
  render();
}

function deleteMember(zone,name){
  if(membersLocked){showToast('Data terkunci! Unlock dulu','err');return;}
  if(globalLocked){showToast('Data global terkunci! Unlock dulu','err');return;}
  showConfirm('🗑️',`Hapus <b>${name}</b> dari ${zone}?<br><span style="font-size:11px;color:var(--txt3)">Member masuk Recycle Bin, bisa dikembalikan.</span>`,'Ya, Hapus',()=>{
    if(zone==='KRS') appData.krsMembers=appData.krsMembers.filter(m=>m!==name);
    else appData.slkMembers=appData.slkMembers.filter(m=>m!==name);
    if(!appData.deletedMembers) appData.deletedMembers={};
    const k=zone+'__'+name;
    appData.deletedMembers[k]={
      zone,name,
      deletedAt:Date.now(),
      payments:Object.fromEntries(Object.entries(appData.payments||{}).filter(([pk])=>pk.startsWith(zone+'__'+name+'__'))),
      memberInfo:appData.memberInfo?.[k]||{}
    };
    saveDB({action:`🗑️ Hapus member ${zone} - ${name}`,detail:`Masuk recycle bin`});
    showToast(`${name} dihapus → Recycle Bin`,'err');
    render();
  });
}

function restoreMember(key){
  const data=appData.deletedMembers?.[key];
  if(!data){showToast('Data tidak ditemukan','err');return;}
  const {zone,name,payments:oldPay,memberInfo:oldInfo}=data;
  const list=zone==='KRS'?appData.krsMembers:appData.slkMembers;
  if(list.includes(name)){showToast(`${name} sudah ada di daftar aktif!`,'err');return;}
  list.push(name); list.sort();
  if(oldPay&&Object.keys(oldPay).length){
    if(!appData.payments) appData.payments={};
    Object.assign(appData.payments,oldPay);
  }
  if(oldInfo&&Object.keys(oldInfo).length){
    if(!appData.memberInfo) appData.memberInfo={};
    appData.memberInfo[zone+'__'+name]=oldInfo;
  }
  delete appData.deletedMembers[key];
  saveDB({action:`♻️ Restore member ${zone} - ${name}`,detail:`Data payment dikembalikan`});
  showToast(`✅ ${name} berhasil dikembalikan!`);
  render();
}

function permanentDelete(key){
  const data=appData.deletedMembers?.[key];
  if(!data)return;
  showConfirm('💀',`Hapus permanen <b>${data.name}</b>?<br><span style="font-size:11px;color:#e05c5c">Data tidak bisa dikembalikan!</span>`,'Ya, Hapus Permanen',()=>{
    delete appData.deletedMembers[key];
    saveDB({action:`💀 Hapus permanen ${data.zone} - ${data.name}`});
    showToast(`${data.name} dihapus permanen`,'err');
    render();
  });
}

function openEditMember(zone,name){
  if(membersLocked){showToast('Data terkunci! Unlock dulu','err');return;}
  const info=appData.memberInfo?.[zone+'__'+name]||{};
  document.getElementById('em-name').value=name;
  document.getElementById('em-id').value=info.id||'';
  document.getElementById('em-ip').value=info.ip||'';
  document.getElementById('em-tarif').value=info.tarif||'';
  document.getElementById('em-original-name').value=name;
  document.getElementById('em-zone').value=zone;
  document.getElementById('edit-member-modal').style.display='flex';
}

function saveEditMember(){
  const zone=document.getElementById('em-zone').value;
  const originalName=document.getElementById('em-original-name').value;
  const newName=document.getElementById('em-name').value.trim().toUpperCase();
  const newId=document.getElementById('em-id').value.trim();
  const newIp=document.getElementById('em-ip').value.trim();
  const newTarif=document.getElementById('em-tarif').value.trim();
  if(!newName){showToast('Nama tidak boleh kosong','err');return;}
  const list=zone==='KRS'?appData.krsMembers:appData.slkMembers;
  const idx=list.indexOf(originalName);
  if(idx===-1){showToast('Member tidak ditemukan','err');return;}
  if(newName!==originalName){
    if(list.includes(newName)){showToast('Nama sudah ada!','err');return;}
    list[idx]=newName;
    list.sort();
    if(!appData.payments) appData.payments={};
    const oldKeys=Object.keys(appData.payments).filter(k=>k.startsWith(zone+'__'+originalName+'__'));
    oldKeys.forEach(k=>{
      const newKey=k.replace(zone+'__'+originalName+'__',zone+'__'+newName+'__');
      appData.payments[newKey]=appData.payments[k];
      delete appData.payments[k];
    });
    if(appData.memberInfo){
      const oldInfoKey=zone+'__'+originalName;
      const info=appData.memberInfo[oldInfoKey]||{};
      delete appData.memberInfo[oldInfoKey];
      const newInfo={...info,id:newId,ip:newIp};
      if(newTarif) newInfo.tarif=+newTarif; else delete newInfo.tarif;
      appData.memberInfo[zone+'__'+newName]=newInfo;
    }
  } else {
    if(!appData.memberInfo) appData.memberInfo={};
    const k2=zone+'__'+newName;
    const existing2=appData.memberInfo[k2]||{};
    const updated2={...existing2,id:newId,ip:newIp};
    if(newTarif) updated2.tarif=+newTarif; else delete updated2.tarif;
    appData.memberInfo[k2]=updated2;
  }
  closeModal('edit-member-modal');
  saveDB({action:`✏️ Edit member ${zone}`,detail:`${originalName} → ${newName}${newId?' | ID:'+newId:''}${newIp?' | IP:'+newIp:''}`});
  showToast(`${newName} berhasil diupdate!`);
  render();
}

// ── FREE MEMBER ──
function openFreeModal(zone,name){
  const key=zone+'__'+name;
  const fm=appData.freeMembers?.[key];
  document.getElementById('fm-zone').value=zone;
  document.getElementById('fm-name').value=name;
  document.getElementById('fm-title').textContent='🆓 Free Member: '+name;
  const yrOpts=YEARS.map(y=>`<option value="${y}">${y}</option>`).join('');
  const moOpts=MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join('');
  ['fm-from-year','fm-to-year'].forEach(id=>{document.getElementById(id).innerHTML=yrOpts;});
  ['fm-from-month','fm-to-month'].forEach(id=>{document.getElementById(id).innerHTML=moOpts;});
  const now=new Date();
  document.getElementById('fm-from-year').value=fm?.fromYear??now.getFullYear();
  document.getElementById('fm-from-month').value=fm?.fromMonth??now.getMonth();
  document.getElementById('fm-to-year').value=fm?.toYear??now.getFullYear();
  document.getElementById('fm-to-month').value=fm?.toMonth??11;
  document.getElementById('fm-no-end').checked=fm?(fm.toYear===undefined):false;
  toggleFmEnd();
  document.getElementById('free-modal').style.display='flex';
}
function toggleFmEnd(){
  const noEnd=document.getElementById('fm-no-end').checked;
  document.getElementById('fm-end-row').style.display=noEnd?'none':'flex';
}
function saveFreeModal(){
  const zone=document.getElementById('fm-zone').value;
  const name=document.getElementById('fm-name').value;
  const fromYear=+document.getElementById('fm-from-year').value;
  const fromMonth=+document.getElementById('fm-from-month').value;
  const noEnd=document.getElementById('fm-no-end').checked;
  const toYear=noEnd?undefined:+document.getElementById('fm-to-year').value;
  const toMonth=noEnd?undefined:+document.getElementById('fm-to-month').value;
  if(!noEnd&&(toYear*12+toMonth)<(fromYear*12+fromMonth)){
    showToast('Tanggal selesai harus setelah tanggal mulai','err');return;
  }
  if(!appData.freeMembers) appData.freeMembers={};
  const key=zone+'__'+name;
  const freeData={active:true,fromYear,fromMonth};
  if(!noEnd){freeData.toYear=toYear;freeData.toMonth=toMonth;}
  appData.freeMembers[key]=freeData;
  saveDB({action:`🆓 Set Free Member ${zone} - ${name}`,detail:`Dari ${MONTHS[fromMonth]} ${fromYear}${noEnd?' (selamanya)':' s/d '+MONTHS[toMonth]+' '+toYear}`});
  showToast(`${name} dijadikan free member ✅`);
  closeFreeModal();
  render();
}
function removeFreeModal(zone,name){
  const key=zone+'__'+name;
  if(!appData.freeMembers?.[key]) return;
  showConfirm('💳',`Kembalikan <b>${name}</b> ke berbayar?<br><span style="font-size:11px;color:var(--txt3)">Status free member akan dihapus. Riwayat bayar tetap aman.</span>`,'Ya, Kembalikan Berbayar',()=>{
    delete appData.freeMembers[key];
    saveDB({action:`💳 Kembalikan ke Berbayar ${zone} - ${name}`,detail:`Free member dihapus`});
    showToast(`${name} dikembalikan ke berbayar`);
    closeFreeModal();
    render();
  });
}
function closeFreeModal(){ document.getElementById('free-modal').style.display='none'; }

// ── OPERASIONAL ──
function setOpsMonth(val,type){
  if(type==='year') window._opsYear=+val;
  else window._opsMonth=+val;
  if((window._opsYear||2026)<2026){window._opsYear=2026;window._opsMonth=0;}
  if(window._opsYear===2026&&(window._opsMonth||0)<0){window._opsMonth=0;}
  render();
}
function getOpsKey(){
  const y=window._opsYear??new Date().getFullYear();
  const m=window._opsMonth??new Date().getMonth();
  return `${y}_${m}`;
}
function addOpsItem(){
  const k=getOpsKey();
  if(!appData.operasional) appData.operasional={};
  if(!appData.operasional[k]) appData.operasional[k]={items:[]};
  appData.operasional[k].items.push({label:'',nominal:0});
  render();
}
function updateOpsItem(idx,field,val){
  const k=getOpsKey();
  if(!appData.operasional?.[k]?.items) return;
  appData.operasional[k].items[idx][field]=field==='nominal'?(+val||0):val;
  saveDB({action:`💼 Update operasional`,detail:`${MONTHS[window._opsMonth??new Date().getMonth()]} ${window._opsYear??new Date().getFullYear()}`});
}
function deleteOpsItem(idx){
  const k=getOpsKey();
  if(!appData.operasional?.[k]?.items) return;
  const item=appData.operasional[k].items[idx];
  const label=item?.label||'item ini';
  showConfirm('🗑️',`Hapus <b>${label}</b> dari operasional?`,'Ya, Hapus',()=>{
    if(!appData.operasional?.[k]?.items) return;
    appData.operasional[k].items.splice(idx,1);
    saveDB({action:`🗑️ Hapus item operasional`,detail:`${MONTHS[window._opsMonth??new Date().getMonth()]} ${window._opsYear??new Date().getFullYear()}`});
    render();
  });
}

// ── PWA ──
function installPWA(){ if(!deferredPrompt)return; deferredPrompt.prompt(); deferredPrompt.userChoice.then(()=>{deferredPrompt=null;render();}); }
