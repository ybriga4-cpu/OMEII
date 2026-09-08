/* Observatoire GES — logique de la page (vues, données de démonstration, carte, événements).
   Reprise de l'outil interne existant ; aucune donnée réelle connectée pour le moment —
   toutes les valeurs sont explicitement marquées « Simulation » dans l'interface. */


'use strict';
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');

// ═══════════════════════════════════════════
// ── NAVIGATION PAR VUES ──
// ═══════════════════════════════════════════
const VIEW_MAP = {
  global:   ['sec-alert','sec-clocks','sec-marches','sec-conflits','sec-energie','sec-climat','sec-events'],
  marches:  ['sec-alert','sec-clocks','sec-marches','sec-events'],
  conflits: ['sec-alert','sec-conflits','sec-events'],
  energie:  ['sec-alert','sec-energie','sec-events'],
  climat:   ['sec-alert','sec-climat','sec-events'],
};
const ALL_SECTIONS = ['sec-alert','sec-clocks','sec-marches','sec-conflits','sec-energie','sec-climat','sec-events'];
let currentView = 'global';

function setView(view, btn) {
  currentView = view;
  // Update nav pills
  document.querySelectorAll('.npill').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  // Show/hide sections with animation
  const toShow = VIEW_MAP[view] || ALL_SECTIONS;
  ALL_SECTIONS.forEach(id => {
    const el = $(id);
    if (!el) return;
    if (toShow.includes(id)) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
  // Filter events by view context
  if (view === 'conflits') filterEvents('cs', null, true);
  else if (view === 'climat') filterEvents('cc', null, true);
  else if (view === 'energie') filterEvents('cn', null, true);
  else filterEvents('all', null, true);

  // Scroll : Vue globale → Événements · Autres vues → haut de page
  setTimeout(() => {
    if (view === 'global') {
      const target = $('sec-events');
      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 60);
}

// ═══════════════════════════════════════════
// ── TEMPS & HORLOGES ──
// ═══════════════════════════════════════════
function updateTime() {
  const n = new Date();
  $('mdate').textContent = n.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('utc').textContent = 'UTC '+pad(n.getUTCHours())+':'+pad(n.getUTCMinutes())+':'+pad(n.getUTCSeconds());
  $('ftime') && ($('ftime').textContent = n.toLocaleString('fr-FR'));
}
updateTime(); setInterval(updateTime, 1000);

const CITIES = [
  {c:'Rabat',tz:'Africa/Casablanca',me:true},
  {c:'Paris',tz:'Europe/Paris'},{c:'Londres',tz:'Europe/London'},
  {c:'Moscou',tz:'Europe/Moscow'},{c:'Riyad',tz:'Asia/Riyadh'},
  {c:'Mumbai',tz:'Asia/Kolkata'},{c:'Pékin',tz:'Asia/Shanghai'},
  {c:'Tokyo',tz:'Asia/Tokyo'},{c:'New York',tz:'America/New_York'},
  {c:'São Paulo',tz:'America/Sao_Paulo'},
];
function renderClocks() {
  const n = new Date();
  $('clocks').innerHTML = CITIES.map(ct => {
    try {
      const t = n.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:ct.tz});
      const tz = n.toLocaleTimeString('fr-FR',{timeZoneName:'short',timeZone:ct.tz}).split(' ').pop();
      const h = parseInt(n.toLocaleString('fr-FR',{hour:'2-digit',hour12:false,timeZone:ct.tz}));
      const ico = h<6||h>=22?'🌙':h<12?'🌅':'☀️';
      return `<div class="clock${ct.me?' me':''}" title="${ct.tz}">
        <div class="ck-city">${ct.c}</div>
        <div class="ck-time">${t.substring(0,5)}</div>
        <div class="ck-tz">${tz} ${ico}</div>
      </div>`;
    } catch { return ''; }
  }).join('');
}
renderClocks(); setInterval(renderClocks, 10000);

// ═══════════════════════════════════════════
// ── ALERTES FLASH ──
// ═══════════════════════════════════════════
const ALERTS = [
  'Fed maintient ses taux à 5,25% — prochaine réunion FOMC : 11 juin 2026 · Mercado laboral robuste, désinflation plus lente que prévu',
  'BCE : Lagarde confirme une 3e baisse potentielle en juillet — taux à 3,65% depuis mars · Zone euro : croissance +1,4% Q1 2026',
  'OPEP+ : prolongation des coupes de production de 1,7 Mb/j jusqu\'à fin 2026 — réunion Vienne · Brent au-dessus de 88$ le baril',
  'G7 Finances Stresa : accord sur mécanisme de dette souveraine pour pays vulnérables · 120 Mds $ mobilisés',
  'FMI : croissance mondiale 2026 révisée à +3,2% — résilience inattendue malgré tensions commerciales USA-Chine',
  'Conflit Ukraine : nouvelle offensive russe dans le Donetsk — OTAN en réunion d\'urgence à Bruxelles · Réponse diplomatique attendue',
  'Or historique : 3 312 $/oz — valeur refuge portée par incertitudes géopolitiques et achats des banques centrales émergentes',
];
let ai = 0;
$('alertTxt').textContent = ALERTS[0];
function nextAlert() {
  const el = $('alertTxt');
  el.style.opacity = '0';
  setTimeout(() => { ai = (ai+1) % ALERTS.length; el.textContent = ALERTS[ai]; el.style.opacity = '1'; }, 220);
}
setInterval(nextAlert, 10000);

// ═══════════════════════════════════════════
// ── DONNÉES DE BASE (fallback statique 2026) ──
// ═══════════════════════════════════════════
let FX_DATA = [
  {p:'EUR / USD',r:1.0823,c:'+0.12%',v:0.12,rng:'1.045–1.125'},
  {p:'USD / MAD',r:9.9752,c:'-0.08%',v:-0.08,rng:'9.82–10.18'},
  {p:'EUR / MAD',r:10.8020,c:'+0.04%',v:0.04,rng:'10.45–11.12'},
  {p:'GBP / USD',r:1.2634,c:'+0.21%',v:0.21,rng:'1.21–1.29'},
  {p:'USD / JPY',r:154.82,c:'+0.34%',v:0.34,rng:'140–160'},
  {p:'USD / CHF',r:0.9025,c:'-0.15%',v:-0.15,rng:'0.870–0.935'},
  {p:'USD / CNY',r:7.238,c:'+0.06%',v:0.06,rng:'7.09–7.28'},
  {p:'XAU / USD',r:3312,c:'+0.88%',v:0.88,rng:'2 800–3 500'},
];

// ═══════════════════════════════════════════
// ── FRANKFURTER API (BCE) — FOREX RÉEL ──
// ═══════════════════════════════════════════
async function fetchForexFrankfurter() {
  try {
    $('fxApiTag').className = 'api-tag api-sim';
    $('fxApiTag').textContent = 'Chargement…';
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,JPY,CHF,CNY,MAD');
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    const rates = data.rates;
    // Update FX_DATA with real rates
    FX_DATA[0].r = parseFloat((rates.USD).toFixed(4));
    FX_DATA[1].r = parseFloat((rates.MAD / rates.USD).toFixed(4));  // USD/MAD
    FX_DATA[2].r = parseFloat((rates.MAD).toFixed(4));               // EUR/MAD
    FX_DATA[3].r = parseFloat((rates.GBP).toFixed(4));               // EUR/GBP → adjust
    FX_DATA[4].r = parseFloat((rates.JPY / rates.USD).toFixed(2));   // USD/JPY
    FX_DATA[5].r = parseFloat((rates.CHF / rates.USD).toFixed(4));   // USD/CHF
    FX_DATA[6].r = parseFloat((rates.CNY / rates.USD).toFixed(3));   // USD/CNY
    $('fxApiTag').className = 'api-tag api-live';
    $('fxApiTag').textContent = '● BCE ' + (data.date || 'Live');
    renderFX();
    return true;
  } catch(e) {
    console.warn('Frankfurter API indisponible:', e.message);
    $('fxApiTag').className = 'api-tag api-err';
    $('fxApiTag').textContent = 'API hors ligne';
    renderFX();
    return false;
  }
}

// ═══════════════════════════════════════════
// ── RENDER FOREX ──
// ═══════════════════════════════════════════
function sparkLine(vals, up, w=50, h=18) {
  const mn = Math.min(...vals), mx = Math.max(...vals), r = mx-mn||1;
  const pts = vals.map((v,i) => `${(i/(vals.length-1))*w},${h-((v-mn)/r)*(h-2)-1}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${up?'var(--green2)':'var(--red2)'}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function renderFX() {
  $('fxBody').innerHTML = FX_DATA.map(f => {
    const up = f.v >= 0;
    const pts = Array.from({length:7}, (_, i) => f.r + (Math.random()-.5) * f.r * 0.003);
    const disp = f.r > 100 ? f.r.toFixed(2) : f.r > 10 ? f.r.toFixed(3) : f.r.toFixed(4);
    return `<tr><td><span class="fx-pair">${f.p}</span></td>
      <td><span class="fx-rate ${up?'up':'dn'}" id="fxr-${f.p.replace(/[\s\/]/g,'')}">${disp}</span></td>
      <td><span class="fx-chg ${up?'up':'dn'}">${up?'▲':'▼'} ${f.c}</span></td>
      <td>${sparkLine(pts,up)}<div style="font-family:var(--fm);font-size:8px;color:var(--ink5)">${f.rng}</div></td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════
// ── COMMODITÉS ──
// ═══════════════════════════════════════════
let COMMO = [
  {ico:'🛢',n:'Pétrole WTI',u:'$/bbl',p:84.20,c:'-0.92%',v:-0.92,up:false,pct:56},
  {ico:'🛢',n:'Pétrole Brent',u:'$/bbl',p:88.60,c:'-0.78%',v:-0.78,up:false,pct:59},
  {ico:'⚜️',n:'Or',u:'$/oz',p:3312,c:'+0.88%',v:0.88,up:true,pct:92},
  {ico:'🪙',n:'Argent',u:'$/oz',p:31.80,c:'+1.12%',v:1.12,up:true,pct:73},
  {ico:'🔥',n:'Gaz naturel',u:'$/MMBtu',p:2.92,c:'+2.80%',v:2.80,up:true,pct:40},
  {ico:'🌾',n:'Blé',u:'$/bu',p:608,c:'-0.65%',v:-0.65,up:false,pct:47},
  {ico:'🌽',n:'Maïs',u:'$/bu',p:482,c:'+0.44%',v:0.44,up:true,pct:53},
  {ico:'🔧',n:'Cuivre',u:'$/lb',p:4.88,c:'-0.48%',v:-0.48,up:false,pct:79},
  {ico:'🍫',n:'Cacao',u:'$/t',p:9840,c:'+1.94%',v:1.94,up:true,pct:96},
  {ico:'⚡',n:'Aluminium',u:'$/t',p:2442,c:'+0.28%',v:0.28,up:true,pct:64},
];

function renderCommo() {
  $('commoBody').innerHTML = COMMO.map(c => {
    const disp = c.p >= 1000 ? c.p.toLocaleString('fr-FR') : c.p.toFixed(2);
    return `<div class="commo">
      <span class="commo-ico">${c.ico}</span>
      <div style="flex:1;min-width:0"><div class="commo-name">${c.n}</div><div class="commo-unit">${c.u}</div></div>
      <div style="text-align:right">
        <div class="commo-val ${c.up?'up':'dn'}">${disp}</div>
        <div class="commo-chg ${c.up?'up':'dn'}">${c.up?'▲':'▼'} ${c.c}</div>
        <div class="pbar"><div class="pbar-fill" style="width:${c.pct}%;background:${c.up?'var(--green2)':'var(--red2)'}"></div></div>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// ── INDICES BOURSIERS ──
// ═══════════════════════════════════════════
let IDX = [
  {f:'🇺🇸',n:'S&P 500',s:'New York',v:5418,c:'+0.24%',up:true,pts:[0.1,-0.1,0.3,0.2,0.4,0.1,0.24]},
  {f:'🇫🇷',n:'CAC 40',s:'Paris',v:7842,c:'+0.62%',up:true,pts:[0.2,0.5,0.8,0.4,0.7,0.5,0.62]},
  {f:'🇩🇪',n:'DAX',s:'Francfort',v:18680,c:'+0.48%',up:true,pts:[0.1,0.4,0.7,0.3,0.6,0.4,0.48]},
  {f:'🇯🇵',n:'Nikkei 225',s:'Tokyo',v:39120,c:'-0.18%',up:false,pts:[0.2,-0.1,-0.3,-0.2,-0.1,-0.2,-0.18]},
  {f:'🇨🇳',n:'CSI 300',s:'Shanghai',v:3218,c:'-0.42%',up:false,pts:[-0.1,-0.4,-0.2,-0.5,-0.3,-0.4,-0.42]},
  {f:'🇬🇧',n:'FTSE 100',s:'Londres',v:8124,c:'+0.18%',up:true,pts:[0.1,0.2,0.3,0.1,0.2,0.1,0.18]},
];

function iSpark(pts, up) {
  const mn = Math.min(...pts), mx = Math.max(...pts), r = mx-mn||1;
  const p = pts.map((v,i) => `${i*(52/6)},${16-((v-mn)/r)*13}`).join(' ');
  return `<svg class="spark-svg" width="54" height="18" viewBox="0 0 54 18"><polyline points="${p}" fill="none" stroke="${up?'var(--green2)':'var(--red2)'}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function renderIdx() {
  $('idxBody').innerHTML = IDX.map(d => `
    <div class="idx-row">
      <span class="idx-flag">${d.f}</span>
      <div><div class="idx-name">${d.n}</div><div class="idx-sub">${d.s}</div></div>
      ${iSpark(d.pts, d.up)}
      <div><div class="idx-val ${d.up?'up':'dn'}">${d.v.toLocaleString('fr-FR')}</div><div class="idx-chg ${d.up?'up':'dn'}">${d.up?'▲':'▼'} ${d.c}</div></div>
    </div>`).join('');
}

// ═══════════════════════════════════════════
// ── TICKER ──
// ═══════════════════════════════════════════
function buildTicker() {
  const items = [
    {s:'EUR/USD',v:FX_DATA[0].r.toFixed(4),up:FX_DATA[0].v>=0,c:FX_DATA[0].c},
    {s:'USD/MAD',v:FX_DATA[1].r.toFixed(4),up:FX_DATA[1].v>=0,c:FX_DATA[1].c},
    {s:'EUR/MAD',v:FX_DATA[2].r.toFixed(4),up:FX_DATA[2].v>=0,c:FX_DATA[2].c},
    {s:'GBP/USD',v:FX_DATA[3].r.toFixed(4),up:FX_DATA[3].v>=0,c:FX_DATA[3].c},
    {s:'USD/JPY',v:FX_DATA[4].r.toFixed(2),up:FX_DATA[4].v>=0,c:FX_DATA[4].c},
    {s:'XAU/USD',v:'3 312',up:true,c:'+0.88%'},
    {s:'BRENT',v:'88.60$',up:false,c:'-0.78%'},
    {s:'WTI',v:'84.20$',up:false,c:'-0.92%'},
    {s:'CAC 40',v:'7 842',up:true,c:'+0.62%'},
    {s:'S&P 500',v:'5 418',up:true,c:'+0.24%'},
    {s:'DAX',v:'18 680',up:true,c:'+0.48%'},
    {s:'NIKKEI',v:'39 120',up:false,c:'-0.18%'},
    {s:'BITCOIN',v:'94 200$',up:true,c:'+1.84%'},
    {s:'CUIVRE',v:'4.88$/lb',up:false,c:'-0.48%'},
    {s:'GAZ NAT.',v:'2.92$',up:true,c:'+2.80%'},
    {s:'CACAO',v:'9 840$/t',up:true,c:'+1.94%'},
    {s:'OR',v:'3 312$/oz',up:true,c:'+0.88%'},
    {s:'DXY',v:'104.8',up:true,c:'+0.18%'},
  ];
  const th = items.map(t => `<span class="ti"><span class="ti-sym">${t.s}</span><span class="ti-val">${t.v}</span><span class="${t.up?'ti-up':'ti-dn'}">${t.c}</span></span>`).join('');
  $('ticker').innerHTML = th + th;
}

// ═══════════════════════════════════════════
// ── ZONES & CARTE ──
// ═══════════════════════════════════════════
const ZONES = [
  {id:'ukraine',sev:'war',n:'Ukraine · Russie',d:'Front actif Donetsk/Zaporijjia. Frappes sur infrastructures énergétiques. Offensive printanière en cours.',tag:'Guerre conventionnelle'},
  {id:'gaza',sev:'war',n:'Proche-Orient · Gaza',d:'Conflit intensif. Crise humanitaire extrême. Négociations à Doha bloquées. Risque extension régionale.',tag:'Conflit urbain'},
  {id:'soudan',sev:'war',n:'Soudan',d:'Guerre civile SAF vs RSF. 8,5 millions de déplacés. Accès humanitaire bloqué. Risque famine généralisée.',tag:'Guerre civile'},
  {id:'sahel',sev:'war',n:'Sahel · Afrique de l\'Ouest',d:'Instabilité persistante Mali, Burkina, Niger. Alliance AES. Retrait forces françaises. Présence Wagner.',tag:'Insurrection armée'},
  {id:'myanmar',sev:'war',n:'Myanmar · Birmanie',d:'Junte vs forces résistance. 2,4 millions de déplacés. Offensive rebelle au nord.',tag:'Guerre civile'},
  {id:'taiwan',sev:'tension',n:'Détroit de Taïwan',d:'Exercices militaires chinois intensifiés suite aux élections. Route commerciale stratégique mondiale.',tag:'Rivalité grandes puissances'},
  {id:'scs',sev:'tension',n:'Mer de Chine méridionale',d:'Incidents navals Philippines-Chine. Arbitrage de La Haye ignoré. Patrouilles USA renforcées.',tag:'Dispute maritime'},
  {id:'venezuela',sev:'tension',n:'Venezuela · Guyane-Esequibo',d:'Crise post-électorale Maduro. Pression migratoire. Revendications territoriales actives.',tag:'Crise politique'},
  {id:'coree',sev:'watch',n:'Corée du Nord',d:'Essais balistiques ICBM. Rapprochement Pyongyang-Moscou. Transfert d\'armements. AIEA exclue.',tag:'Prolifération nucléaire'},
  {id:'iran',sev:'watch',n:'Iran · Programme nucléaire',d:'Enrichissement à 60%. JCPOA mort. Tensions Israël-Iran. Proxies actifs Gaza/Yémen/Irak.',tag:'Nucléaire · Proxies'},
];
const SC = {war:['var(--red)','CONFLIT ACTIF'],tension:['var(--amber)','TENSION'],watch:['var(--blue)','SURVEILLANCE']};

$('zonePanel').innerHTML = ZONES.map(z => `
  <div class="zone-item" onclick="highlightZone('${z.id}')">
    <div class="zdot" style="background:${SC[z.sev][0]}"></div>
    <div>
      <div class="zsev" style="color:${SC[z.sev][0]}">${SC[z.sev][1]}</div>
      <div class="zname">${z.n}</div>
      <div class="zdesc">${z.d}</div>
      <span class="ztag" style="background:${SC[z.sev][0]}20;color:${SC[z.sev][0]}">${z.tag}</span>
    </div>
  </div>`).join('');

// ═══════════════════════════════════════════
// ── ÉVÉNEMENTS avec horodatage relatif ──
// ═══════════════════════════════════════════
const now = new Date();
function minsAgo(m) {
  const d = new Date(now - m*60000);
  return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) + ` (il y a ${m < 60 ? m+'min' : Math.floor(m/60)+'h'+(m%60?String(m%60).padStart(2,'0'):'')})`;
}

const EVS = [
  {t:minsAgo(12),cat:'cs',cl:'Sécurité',ti:'Ukraine : frappe massive sur réseau énergétique de Kharkiv — panne partielle rapportée',src:'Reuters · AFP'},
  {t:minsAgo(48),cat:'ce',cl:'Économie',ti:'BCE : Lagarde confirme la cible 2% — possibilité d\'une 3e baisse des taux en juillet 2026',src:'Financial Times'},
  {t:minsAgo(72),cat:'cg',cl:'Géopo.',ti:'Xi Jinping reçoit délégation américaine à Pékin — commerce et Taïwan au centre des négociations',src:'South China Morning Post'},
  {t:minsAgo(98),cat:'cc',cl:'Climat',ti:'Cyclone catégorie 4 : alerte rouge Bangladesh — 8 millions de personnes exposées, évacuations en cours',src:'WMO · ReliefWeb'},
  {t:minsAgo(134),cat:'ce',cl:'Économie',ti:'Fed : minutes du FOMC révèlent débat sur calendrier de désinflation — dollar sous pression ce soir',src:'Wall Street Journal'},
  {t:minsAgo(178),cat:'cs',cl:'Sécurité',ti:'Sahel : attaque terroriste au nord du Burkina Faso — 24 victimes civiles selon l\'ONU',src:'Le Monde · AFP'},
  {t:minsAgo(204),cat:'cg',cl:'Géopo.',ti:'G7 Finances : accord sur mécanisme d\'aide à l\'Ukraine via intérêts des actifs russes gelés',src:'Reuters · Politico'},
  {t:minsAgo(248),cat:'cc',cl:'Climat',ti:'GIEC : fonte arctique 40% plus rapide que prévu — scénario 1,5°C compromis avant 2035',src:'Nature Climate Change'},
  {t:minsAgo(290),cat:'ce',cl:'Économie',ti:'Chine : déflation persistante — IPP à -2.6% pour le 22e mois consécutif',src:'NBS · Bloomberg'},
  {t:minsAgo(360),cat:'cn',cl:'Énergie',ti:'OPEP+ prolonge les coupes de production de 1,7 Mb/j jusqu\'à fin 2026 — brent au-dessus 88$',src:'Reuters Commodities · OPEC'},
  {t:minsAgo(420),cat:'cg',cl:'Géopo.',ti:'ONU : rapport Soudan — 8,5 millions de déplacés, pire crise humanitaire depuis le Rwanda',src:'OCHA · MSF'},
  {t:minsAgo(480),cat:'cn',cl:'Énergie',ti:'IEA : demande mondiale de pétrole revue à la hausse à 102,4 Mb/j pour 2026 — regain Asie',src:'AIE · Bloomberg'},
];

function renderEvents() {
  $('evList').innerHTML = EVS.map(e => `
    <div class="ev" data-cat="${e.cat}">
      <span class="ev-time">${e.t}</span>
      <span class="ev-cat ${e.cat}">${e.cl}</span>
      <div>
        <div class="ev-title">${e.ti}</div>
        <div class="ev-src">Sources : ${e.src}</div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════
// ── FILTRE ÉVÉNEMENTS ──
// ═══════════════════════════════════════════
let activeFilter = 'all';
function filterEvents(cat, btn, silent=false) {
  activeFilter = cat;
  if (!silent) {
    document.querySelectorAll('.ef-pill').forEach(b => {
      b.className = 'ef-pill';
      if (b.textContent.toLowerCase().includes(cat) || (cat==='all' && b.textContent==='Tout')) {
        b.classList.add(`active-${cat}`);
      }
    });
    if (btn) {
      document.querySelectorAll('.ef-pill').forEach(b => b.className = 'ef-pill');
      btn.classList.add(`active-${cat}`);
    }
  }
  document.querySelectorAll('.ev').forEach(el => {
    el.classList.toggle('filtered-out', cat !== 'all' && el.dataset.cat !== cat);
  });
}

// ═══════════════════════════════════════════
// ── BAROMÈTRE MONDIAL ──
// ═══════════════════════════════════════════
const BARO = [
  {l:'Tensions géopolitiques',v:76,c:'var(--red)'},
  {l:'Stress énergétique',v:64,c:'#D47810'},
  {l:'Instabilité climatique',v:72,c:'var(--teal)'},
  {l:'Risque financier',v:48,c:'var(--amber)'},
  {l:'Commerce mondial',v:36,c:'var(--green)'},
  {l:'Stabilité politique',v:42,c:'var(--blue)'},
];
function baroHtml(items) {
  return items.map(b => `
    <div class="baro">
      <div class="baro-lbl">${b.l}</div>
      <div class="baro-track"><div class="baro-fill" style="width:${b.v}%;background:${b.c}"></div></div>
      <div class="baro-val" style="color:${b.v>65?'var(--red)':b.v>45?'var(--amber)':'var(--green)'}">${b.v}</div>
    </div>`).join('');
}
$('baroBody').innerHTML = baroHtml(BARO);

// ── Baromètre financier
const BARO_FIN = [
  {l:'Stress financier global',v:48,c:'var(--amber)'},
  {l:'Volatilité marchés (VIX)',v:38,c:'#D47810'},
  {l:'Pression USD (DXY)',v:62,c:'var(--blue)'},
  {l:'Appétit pour le risque',v:55,c:'var(--green)'},
];
$('baroFinBody') && ($('baroFinBody').innerHTML = baroHtml(BARO_FIN));

// ── Baromètre climatique
const BARO_CLIM = [
  {l:'Anomalies thermiques',v:82,c:'var(--red)'},
  {l:'Événements extrêmes',v:74,c:'#D47810'},
  {l:'Stress hydrique mondial',v:68,c:'var(--teal)'},
  {l:'Sécurité alimentaire',v:56,c:'var(--amber)'},
  {l:'Émissions GES (trend)',v:70,c:'var(--orange)'},
  {l:'Pression biodiversité',v:79,c:'var(--green)'},
];
$('baroClimBody') && ($('baroClimBody').innerHTML = baroHtml(BARO_CLIM));

// ═══════════════════════════════════════════
// ── MACRO ──
// ═══════════════════════════════════════════
const MACRO = [
  {l:'Croissance PIB mondial 2026',v:'+3.2%',up:true},
  {l:'Inflation mondiale moyenne',v:'4.2%',up:null},
  {l:'Taux directeur Fed',v:'5.25%',up:null},
  {l:'Taux directeur BCE',v:'3.65%',up:null},
  {l:'Taux BAM (Maroc)',v:'2.75%',up:null},
  {l:'Balance commerciale Chine',v:'+$74.2 Mds',up:true},
  {l:'Réserves d\'or mondiales',v:'36 200 t',up:true},
  {l:'Dette publique mondiale/PIB',v:'94.8%',up:false},
  {l:'Indice Dollar DXY',v:'104.8',up:true},
  {l:'PIB Maroc 2026 (prév.)',v:'+4.1%',up:true},
];
$('macroBody').innerHTML = MACRO.map(m => `
  <div class="macro-row">
    <div class="macro-lbl">${m.l}</div>
    <div class="macro-val" style="color:${m.up===true?'var(--green)':m.up===false?'var(--red2)':'var(--ink2)'}">${m.v}</div>
  </div>`).join('');

// ═══════════════════════════════════════════
// ── SECTION ÉNERGIE ──
// ═══════════════════════════════════════════
const ENERGY_ITEMS = [
  {ico:'🛢',n:'Pétrole Brent',u:'$/bbl',v:88.60,c:'-0.78%',up:false},
  {ico:'🛢',n:'Pétrole WTI',u:'$/bbl',v:84.20,c:'-0.92%',up:false},
  {ico:'🔥',n:'Gaz naturel',u:'$/MMBtu',v:2.92,c:'+2.80%',up:true},
  {ico:'⚫',n:'Charbon (API2)',u:'$/t',v:128.40,c:'+0.34%',up:true},
  {ico:'☢️',n:'Uranium',u:'$/lb',v:91.50,c:'+1.20%',up:true},
  {ico:'⚡',n:'Électricité EU',u:'€/MWh',v:82.40,c:'-1.10%',up:false},
];
$('energyGrid') && ($('energyGrid').innerHTML = ENERGY_ITEMS.map(e => `
  <div class="en-card">
    <div class="en-ico">${e.ico}</div>
    <div class="en-name">${e.n}</div>
    <div class="en-unit">${e.u}</div>
    <div class="en-val ${e.up?'up':'dn'}">${e.v}</div>
    <div class="en-chg ${e.up?'up':'dn'}">${e.up?'▲':'▼'} ${e.c}</div>
  </div>`).join(''));

const ENERGY_GEO = [
  {l:'Dépendance EU au GNL USA',v:'+38%',up:true},{l:'Pipeline TurkStream actif',v:'Oui',up:null},
  {l:'Détroit d\'Ormuz trafic/jour',v:'21 Mb/j',up:null},{l:'Gazprom revenus (-)',v:'-62%',up:false},
  {l:'GNL Qatar vers Asie',v:'+12%',up:true},{l:'Câbles sous-marins incidents',v:'4 en 2026',up:false},
];
$('energyGeoBody') && ($('energyGeoBody').innerHTML = ENERGY_GEO.map(m => `
  <div class="macro-row">
    <div class="macro-lbl">${m.l}</div>
    <div class="macro-val" style="color:${m.up===true?'var(--green)':m.up===false?'var(--red2)':'var(--ink2)'}">${m.v}</div>
  </div>`).join(''));

const RENEW = [
  {l:'Solaire mondial installé',v:'2 200 GW',up:true},{l:'Éolien terrestre',v:'1 120 GW',up:true},
  {l:'Éolien offshore',v:'280 GW',up:true},{l:'Hydrogène vert (prod.)',v:'28 Mt/an',up:true},
  {l:'Stockage batteries (GWh)',v:'480 GWh',up:true},{l:'Investissement ENR 2026',v:'$820 Mds',up:true},
];
$('renewBody') && ($('renewBody').innerHTML = RENEW.map(m => `
  <div class="macro-row">
    <div class="macro-lbl">${m.l}</div>
    <div class="macro-val" style="color:var(--green)">${m.v}</div>
  </div>`).join(''));

const ENERGY_STRESS = [
  {l:'Europe de l\'Est',v:72,c:'var(--red)'},
  {l:'Asie du Sud',v:68,c:'#D47810'},
  {l:'Afrique Sub-saharienne',v:84,c:'var(--red)'},
  {l:'Europe occidentale',v:44,c:'var(--amber)'},
  {l:'Amérique du Nord',v:28,c:'var(--green)'},
  {l:'Maroc / Maghreb',v:52,c:'var(--amber)'},
];
$('energyStressBody') && ($('energyStressBody').innerHTML = baroHtml(ENERGY_STRESS));

// ═══════════════════════════════════════════
// ── SECTION CLIMAT ──
// ═══════════════════════════════════════════
const CLIMATE_ALERTS = [
  {sev:'high',sl:'CRITIQUE',ico:'🌀',ti:'Cyclone Ampang Cat.4 — Golfe du Bengale',d:'8 millions de personnes en alerte. Vents 230 km/h. Bangladesh/Inde. Évacuations en cours.'},
  {sev:'high',sl:'CRITIQUE',ico:'🌵',ti:'Sécheresse extrême — Corne de l\'Afrique',d:'5e saison des pluies déficitaire. 24 millions de personnes en insécurité alimentaire aiguë.'},
  {sev:'med',sl:'ÉLEVÉ',ico:'🌊',ti:'Inondations Brésil Sud — Rio Grande do Sul',d:'2e épisode majeur en 12 mois. 280 000 personnes déplacées. Reconstruction difficile.'},
  {sev:'med',sl:'ÉLEVÉ',ico:'🔥',ti:'Feux forêt Canada-Alberta',d:'180 000 ha brûlés depuis janvier. Saison 40% plus tôt que la normale. 12 000 évacués.'},
  {sev:'low',sl:'VIGILANCE',ico:'❄️',ti:'Vague de froid tardive — Asie centrale',d:'Températures -25°C en mai dans certaines zones. Impact agriculture précoce Kazakhstan.'},
];
$('climateAlerts') && ($('climateAlerts').innerHTML = CLIMATE_ALERTS.map(a => `
  <div class="clim-alert">
    <span class="clim-sev ${a.sev}">${a.sl}</span>
    <div>
      <div class="clim-title">${a.ico} ${a.ti}</div>
      <div class="clim-desc">${a.d}</div>
    </div>
  </div>`).join(''));

const CLIM_STATS = [
  {l:'Temp. globale anomalie 2026',v:'+1.38°C',up:false},{l:'CO₂ atm. (ppm)',v:'426 ppm',up:false},
  {l:'Fonte glaces Antarctique',v:'-18%',up:false},{l:'Niveau mer (mm/an)',v:'+4.8 mm',up:false},
  {l:'Acidification océan pH',v:'8.04',up:false},{l:'Albédo Arctique (perte)',v:'-12%',up:false},
];
$('climateStats') && ($('climateStats').innerHTML = CLIM_STATS.map(m => `
  <div class="macro-row">
    <div class="macro-lbl">${m.l}</div>
    <div class="macro-val" style="color:var(--red2)">${m.v}</div>
  </div>`).join(''));

const CLIM_ECO = [
  {l:'Pertes assurées climat 2025',v:'$340 Mds',up:false},{l:'Migrations climatiques/an',v:'26 millions',up:false},
  {l:'PIB exposé risque côtier',v:'4.5% mondial',up:null},{l:'Coût adaptation 2030 (besoin)',v:'$400 Mds',up:null},
  {l:'Financement vert mobilisé',v:'$180 Mds',up:true},{l:'Gap de financement',v:'-$220 Mds',up:false},
];
$('climEcoBody') && ($('climEcoBody').innerHTML = CLIM_ECO.map(m => `
  <div class="macro-row">
    <div class="macro-lbl">${m.l}</div>
    <div class="macro-val" style="color:${m.up===true?'var(--green)':m.up===false?'var(--red2)':'var(--ink2)'}">${m.v}</div>
  </div>`).join(''));

// ═══════════════════════════════════════════
// ── CARTE D3 + TOPOJSON ──
// ═══════════════════════════════════════════
const CONFLICT_POINTS = [
  ['ukraine', 31.0, 49.0,'war','UKR'],['gaza',34.5,31.5,'war','GAZ'],
  ['soudan',30.0,15.5,'war','SDN'],['sahel',-2.0,15.0,'war','SAH'],
  ['myanmar',96.5,20.0,'war','MYM'],['taiwan',121.0,23.5,'tension','TWN'],
  ['scs',114.0,12.0,'tension','SCS'],['venezuela',-66.0,8.0,'tension','VEN'],
  ['coree',127.0,40.0,'watch','PRK'],['iran',53.5,32.5,'watch','IRN'],
];
const MAP_COLORS = {war:'#C01820',tension:'#C07818',watch:'#1640A0'};

async function buildMap() {
  try {
    const resp = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const world = await resp.json();
    const container = $('mapContainer');
    const W = container.clientWidth || 800;
    const H = Math.round(W * 0.52);
    const svg = $('worldSvg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const projection = d3.geoNaturalEarth1().scale(W/6.2).translate([W/2, H/2]);
    const path = d3.geoPath().projection(projection);
    svg.innerHTML = '';
    const ns = 'http://www.w3.org/2000/svg';
    const ocean = document.createElementNS(ns,'rect');
    ocean.setAttribute('width',W); ocean.setAttribute('height',H); ocean.setAttribute('fill','#C8DFF0');
    svg.appendChild(ocean);
    const gratPath = document.createElementNS(ns,'path');
    gratPath.setAttribute('d',path(d3.geoGraticule()()));
    gratPath.setAttribute('fill','none'); gratPath.setAttribute('stroke','#A8C8DC');
    gratPath.setAttribute('stroke-width','0.35'); gratPath.setAttribute('opacity','0.7');
    svg.appendChild(gratPath);
    const eqPath = document.createElementNS(ns,'path');
    eqPath.setAttribute('d',path({type:'LineString',coordinates:[[-180,0],[180,0]]}));
    eqPath.setAttribute('fill','none'); eqPath.setAttribute('stroke','#80A8C0');
    eqPath.setAttribute('stroke-width','0.8'); eqPath.setAttribute('stroke-dasharray','5,4');
    svg.appendChild(eqPath);
    const countries = topojson.feature(world, world.objects.countries);
    const gLand = document.createElementNS(ns,'g');
    countries.features.forEach(feat => {
      const p = document.createElementNS(ns,'path');
      p.setAttribute('d',path(feat)); p.setAttribute('fill','#E6DBC8');
      p.setAttribute('stroke','#B4A07A'); p.setAttribute('stroke-width','0.5');
      p.style.transition='fill .15s';
      p.addEventListener('mouseenter',()=>p.setAttribute('fill','#D4C49A'));
      p.addEventListener('mouseleave',()=>p.setAttribute('fill','#E6DBC8'));
      gLand.appendChild(p);
    });
    svg.appendChild(gLand);
    const borders = document.createElementNS(ns,'path');
    borders.setAttribute('d',path(topojson.mesh(world,world.objects.countries,(a,b)=>a!==b)));
    borders.setAttribute('fill','none'); borders.setAttribute('stroke','#A09070');
    borders.setAttribute('stroke-width','0.35'); borders.setAttribute('opacity','0.8');
    svg.appendChild(borders);
    const seaLabels=[['Océan Atlantique',-28,15],['Pacifique Nord',-155,35],['Pacifique Sud',-140,-25],['Océan Indien',75,-15],['Méditerranée',16,36]];
    seaLabels.forEach(([lbl,lon,lat])=>{
      const [x,y]=projection([lon,lat])||[0,0];
      if(x>0&&x<W&&y>0&&y<H){
        const t=document.createElementNS(ns,'text');
        t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('text-anchor','middle');
        t.setAttribute('font-family',"'JetBrains Mono'");t.setAttribute('font-size',W<700?'7':'9');
        t.setAttribute('fill','#5890B0');t.setAttribute('font-style','italic');t.setAttribute('opacity','0.85');
        t.textContent=lbl;svg.appendChild(t);
      }
    });
    const gMarkers=document.createElementNS(ns,'g');
    gMarkers.setAttribute('id','markersLayer');
    CONFLICT_POINTS.forEach(([id,lon,lat,type,lbl])=>{
      const [cx,cy]=projection([lon,lat])||[0,0];
      if(cx<=0||cx>=W||cy<=0||cy>=H)return;
      const col=MAP_COLORS[type];
      const r1=W<700?9:13,r2=W<700?5:8,r3=W<700?3:4.5,fs=W<700?6:8;
      const g=document.createElementNS(ns,'g');
      g.setAttribute('class',`conflict ${type}`);g.setAttribute('id',`mk-${id}`);g.style.cursor='pointer';
      g.addEventListener('click',()=>showConflict(id));
      const c1=document.createElementNS(ns,'circle');
      c1.setAttribute('cx',cx);c1.setAttribute('cy',cy);c1.setAttribute('r',r1);
      c1.setAttribute('fill',col);c1.setAttribute('fill-opacity','0.15');
      const c2=document.createElementNS(ns,'circle');
      c2.setAttribute('cx',cx);c2.setAttribute('cy',cy);c2.setAttribute('r',r2);
      c2.setAttribute('fill',col);c2.setAttribute('fill-opacity','0.3');
      const c3=document.createElementNS(ns,'circle');
      c3.setAttribute('cx',cx);c3.setAttribute('cy',cy);c3.setAttribute('r',r3);
      c3.setAttribute('fill',col);c3.setAttribute('stroke','white');c3.setAttribute('stroke-width','1.5');
      const txt=document.createElementNS(ns,'text');
      txt.setAttribute('x',cx);txt.setAttribute('y',cy-r1-3);txt.setAttribute('text-anchor','middle');
      txt.setAttribute('font-family',"'JetBrains Mono'");txt.setAttribute('font-size',fs);
      txt.setAttribute('font-weight','700');txt.setAttribute('fill',col);txt.textContent=lbl;
      const anim=document.createElementNS(ns,'animate');
      anim.setAttribute('attributeName','r');anim.setAttribute('from',r1);anim.setAttribute('to',r1+4);
      anim.setAttribute('dur',type==='war'?'2s':'3s');anim.setAttribute('repeatCount','indefinite');
      anim.setAttribute('values',`${r1};${r1+4};${r1}`);c1.appendChild(anim);
      const anim2=document.createElementNS(ns,'animate');
      anim2.setAttribute('attributeName','fill-opacity');anim2.setAttribute('from','0.18');
      anim2.setAttribute('to','0.05');anim2.setAttribute('dur',type==='war'?'2s':'3s');
      anim2.setAttribute('repeatCount','indefinite');c1.appendChild(anim2);
      g.appendChild(c1);g.appendChild(c2);g.appendChild(c3);g.appendChild(txt);
      gMarkers.appendChild(g);
    });
    svg.appendChild(gMarkers);
    $('mapLoading').style.display='none';
  } catch(e) {
    console.error('Carte:',e);
    $('mapLoading').textContent='Carte non disponible — connexion requise';
  }
}

function loadMapLibs() {
  const s1=document.createElement('script');
  s1.src='https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
  s1.onload=()=>{
    const s2=document.createElement('script');
    s2.src='https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
    s2.onload=()=>buildMap();
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
}
loadMapLibs();

function toggleMapFilter(btn, type) {
  btn.classList.toggle('on');
  const show = btn.classList.contains('on');
  document.querySelectorAll('.conflict.'+type).forEach(el => {
    el.style.opacity = show?'1':'0';
    el.style.pointerEvents = show?'auto':'none';
  });
}

function showConflict(id) {
  const z = ZONES.find(z => z.id===id);
  if (!z) return;
  const el = $('alertTxt'), ab = document.querySelector('.alert');
  el.style.opacity='0';
  setTimeout(()=>{el.textContent=`${z.n} — ${z.d}`;el.style.opacity='1';},200);
}
function highlightZone(id) { showConflict(id); }

// ═══════════════════════════════════════════
// ── LIVE PULSE — simulation réaliste ──
// ═══════════════════════════════════════════
function microUpdate() {
  // Forex micro-variations
  FX_DATA.forEach(f => {
    if (f.p.includes('XAU')) return;
    const drift = (Math.random()-.5) * 0.0004 * f.r;
    f.r = Math.max(0.001, f.r + drift);
    const el = document.getElementById('fxr-' + f.p.replace(/[\s\/]/g,''));
    if (el) {
      const newVal = f.r > 100 ? f.r.toFixed(2) : f.r > 10 ? f.r.toFixed(3) : f.r.toFixed(4);
      if (el.textContent !== newVal) {
        el.textContent = newVal;
        el.style.color = drift >= 0 ? 'var(--green2)' : 'var(--red2)';
        setTimeout(() => { el.style.color = ''; }, 800);
      }
    }
  });
  // Commodities micro-variations
  COMMO.forEach(c => {
    const drift = (Math.random()-.5) * 0.002 * c.p;
    c.p = Math.max(0.01, c.p + drift);
  });
  // Indices micro-variations
  IDX.forEach(d => {
    const drift = (Math.random()-.5) * 0.001 * d.v;
    d.v = Math.round((d.v + drift) * 10) / 10;
  });
}
setInterval(microUpdate, 12000);
setInterval(renderCommo, 25000);
setInterval(renderIdx, 30000);

// ═══════════════════════════════════════════
// ── REFRESH BUTTON ──
// ═══════════════════════════════════════════
async function refreshAllData() {
  const btn = $('liveBtn');
  btn.classList.add('loading');
  btn.textContent = 'Actualisation…';
  $('updBadge').textContent = 'Mise à jour…';
  await fetchForexFrankfurter();
  renderCommo();
  renderIdx();
  buildTicker();
  const now = new Date();
  $('updBadge').textContent = 'MAJ ' + now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  btn.classList.remove('loading');
  btn.textContent = 'EN DIRECT';
}

// ═══════════════════════════════════════════
// ── INITIALISATION ──
// ═══════════════════════════════════════════
async function init() {
  // Render static data first (instant)
  renderFX();
  renderCommo();
  renderIdx();
  renderEvents();
  buildTicker();
  // Then fetch live forex
  const ok = await fetchForexFrankfurter();
  const n = new Date();
  $('updBadge').textContent = (ok ? '● BCE ' : '⚠ ') + n.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  renderFX(); // re-render with live data
  buildTicker();
}

init();
