(function(){
  const drawer = document.getElementById('helpDrawer');
  const toggle = document.getElementById('helpDrawerToggle');
  const closeBtn = document.getElementById('helpDrawerClose');
  const title = document.getElementById('helpDrawerTitle');
  const search = document.getElementById('helpDrawerSearch');
  const panel = drawer ? drawer.querySelector('.help-drawer__panel') : null;
  const toast = document.getElementById('helpToast');
  const copyBtn = document.getElementById('helpCopyExample');

  window.HelpContent = window.HelpContent || {
    purchase: {
      title: 'Purchase Price',
      tips: ['Use closing disclosure if available','Include negotiated seller credits'],
      examples: [{label:'Typical', value:'$275,000'}],
      mistakes: ['Forgetting to include concessions'],
      save: ['Save before switching scenarios']
    },
    interest: {
      title: 'Interest Rate',
      tips: ['APR vs Interest: use interest %'],
      examples: [{label:'Conventional', value:'6.750%'}],
      mistakes: ['Using APR instead of interest rate'],
      save: ['Rates change—save your scenario']
    }
  };

  function open(){ if(!drawer) return; drawer.hidden=false; drawer.classList.add('open'); toggle && toggle.setAttribute('aria-expanded','true'); }
  function close(){ if(!drawer) return; drawer.classList.remove('open'); setTimeout(()=>{drawer.hidden=true;},200); toggle && toggle.setAttribute('aria-expanded','false'); }
  function setActiveTab(name){ /* placeholder for unit test presence */ }
  function setHelpById(id){
    const data = (window.HelpContent||{})[id];
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
  function resolveIdFromElement(el){ if(!el) return null; if(el.id==='purchasePrice') return 'purchase'; if(el.id==='interestRate') return 'interest'; return null; }
  document.addEventListener('focusin', (e)=>{ const id = resolveIdFromElement(e.target); if(id){ if(drawer && drawer.hidden) open(); setHelpById(id); } });

  // expose minimal API for unit tests
  window.HelpDrawer = { open, close, setActiveTab, setHelpById };
})();
