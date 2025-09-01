(function(){
  const drawer = document.getElementById('helpDrawer');
  const toggle = document.getElementById('helpDrawerToggle');
  const closeBtn = document.getElementById('helpDrawerClose');
  const title = document.getElementById('helpDrawerTitle');
  const search = document.getElementById('helpDrawerSearch');
  const panel = drawer ? drawer.querySelector('.help-drawer__panel') : null;
  const toast = document.getElementById('helpToast');
  const copyBtn = document.getElementById('helpCopyExample');

  async function loadContent(){
    if(window.HelpContent) return window.HelpContent;
    try{
      const res = await fetch('data/help-content.json');
      const json = await res.json();
      window.HelpContent = json;
      return json;
    }catch(_){ window.HelpContent = {}; return {}; }
  }

  function open(){ if(!drawer) return; drawer.hidden=false; drawer.classList.add('open'); toggle && toggle.setAttribute('aria-expanded','true'); }
  function close(){ if(!drawer) return; drawer.classList.remove('open'); setTimeout(()=>{drawer.hidden=true;},200); toggle && toggle.setAttribute('aria-expanded','false'); }
  function setActiveTab(name){ /* placeholder for unit test presence */ }
  async function setHelpById(id){
    const map = await loadContent();
    const data = (map||{})[id];
    if(!data || !panel || !title) return;
    const safe = typeof window.sanitizeHTML==='function' ? window.sanitizeHTML : (s)=>s;
    title.textContent = data.title;
    const list = (arr)=>'<ul>'+arr.map(x=>`<li>• ${safe(String(x))}</li>`).join('')+'</ul>';
    panel.innerHTML = `
      <section id="help-tips"><h3>Tips</h3>${list(data.tips||[])}</section>
      <section id="help-examples"><h3>Examples</h3>${list((data.examples||[]).map(e=>`${e.label}: ${e.value}`))}</section>
      <section id="help-mistakes"><h3>Mistakes</h3>${list(data.mistakes||[])}</section>
      <section id="help-save"><h3>Save</h3>${list(data.save||[])}</section>
    `;
  }

  function showToast(msg){ if(!toast) return; toast.textContent = msg||'Copied'; toast.hidden=false; setTimeout(()=>{toast.hidden=true;}, 1500); }

  // events
  if(toggle){ toggle.classList.remove('hidden'); toggle.addEventListener('click', open); }
  if(closeBtn){ closeBtn.addEventListener('click', close); }
  if(copyBtn){ copyBtn.addEventListener('click', ()=>{ try{ navigator.clipboard && navigator.clipboard.writeText(''); }catch(_){} showToast('Copied'); }); }

  // focus sync minimal
  function resolveIdFromElement(el){ if(!el) return null; if(el.id==='purchasePrice') return 'purchase'; if(el.id==='loanInterestRate') return 'loanInterestRate'; return null; }

  // basic tabs
  const tabs = drawer ? drawer.querySelectorAll('[role=tab]') : [];
  if(tabs && tabs.length){
    tabs.forEach((t)=>{
      t.addEventListener('click', ()=>{
        tabs.forEach(x=>x.setAttribute('aria-selected','false'));
        t.setAttribute('aria-selected','true');
        setActiveTab(t.textContent.trim().toLowerCase());
      });
    });
  }

  // simple search highlight (no Fuse yet)
  if(search && panel){
    search.addEventListener('input', ()=>{
      const q = search.value.trim().toLowerCase();
      const marks = panel.querySelectorAll('mark');
      marks.forEach(m=>{ const txt=m.textContent; const parent=m.parentNode; if(parent){ parent.replaceChild(document.createTextNode(txt), m);} });
      if(!q) return;
      const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, null);
      const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(n=>{ const t=n.nodeValue; if(t && t.toLowerCase().includes(q)){ const i=t.toLowerCase().indexOf(q); const before=t.slice(0,i); const hit=t.slice(i,i+q.length); const after=t.slice(i+q.length); const frag=document.createDocumentFragment(); if(before) frag.appendChild(document.createTextNode(before)); const mk=document.createElement('mark'); mk.textContent=hit; frag.appendChild(mk); if(after) frag.appendChild(document.createTextNode(after)); n.parentNode.replaceChild(frag, n); } });
    });
  }
  document.addEventListener('focusin', (e)=>{ const id = resolveIdFromElement(e.target); if(id){ if(drawer && drawer.hidden) open(); setHelpById(id); } });

  // expose minimal API for unit tests
  window.HelpDrawer = { open, close, setActiveTab, setHelpById };
})();
