// HealthFlo Hospital OS interactions
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Theme switching
const themeToggle = $('#themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('hfTheme', next);
  });
}
const savedTheme = localStorage.getItem('hfTheme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

// Nav toggle
const navToggle = $('#navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

// Ticker motion
const ticker = $('#hfTicker .ticker-track');
if (ticker) {
  let offset = 0;
  setInterval(() => {
    offset -= 1;
    ticker.style.transform = `translateX(${offset}px)`;
    if (Math.abs(offset) > ticker.scrollWidth / 2) offset = 0;
  }, 30);
}

// Copilot
const copilotFab = $('#copilotFab');
const copilotPanel = $('#copilotPanel');
const openCopilot = $('#openCopilot');
const closeCopilot = $('#closeCopilot');
const copilotChat = $('#copilotChat');
const copilotInput = $('#copilotInput');
const copilotSend = $('#copilotSend');

function toggleCopilot(open = true) {
  if (!copilotPanel) return;
  copilotPanel.classList.toggle('hidden', !open);
  if (open) copilotInput?.focus();
}

function appendBubble(text, role = 'ai') {
  const bubble = document.createElement('div');
  bubble.className = role === 'ai' ? 'ai-bubble' : 'user-bubble';
  bubble.textContent = text;
  copilotChat.appendChild(bubble);
  copilotChat.scrollTo({ top: copilotChat.scrollHeight, behavior: 'smooth' });
}

function sendCopilot() {
  const msg = copilotInput.value.trim();
  if (!msg) return;
  appendBubble(msg, 'user');
  copilotInput.value = '';
  setTimeout(() => {
    appendBubble('I’ll handle that. Latest status: OPD wait 14 mins, IPD discharges 6 pending, pre-auth aging 24 mins. Want me to draft updates to consultants and TPA?');
  }, 500);
}

copilotFab?.addEventListener('click', () => toggleCopilot(true));
openCopilot?.addEventListener('click', () => toggleCopilot(true));
closeCopilot?.addEventListener('click', () => toggleCopilot(false));
copilotSend?.addEventListener('click', sendCopilot);
copilotInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendCopilot();
});

// Smooth scroll + active dock
const sections = ['top', 'registration', 'ipd', 'labs', 'pharmacy', 'billing', 'admin'];
const dockItems = $$('.hf-dock .dock-item');
const navLinks = $$('#primaryNav a');
function updateActive(id) {
  dockItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(id)) item.classList.add('active');
    else item.classList.remove('active');
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(id)) link.classList.add('active');
    else link.classList.remove('active');
  });
}
window.addEventListener('scroll', () => {
  let active = 'top';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) active = id;
  });
  updateActive(active);
});

$$('.hf-dock a[href^="#"]')?.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
$('#primaryNav')?.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  e.preventDefault();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth' });
});

// CTA routing
$$('[data-cta]').forEach(btn => {
  btn.addEventListener('click', () => {
    const intent = btn.dataset.cta;
    appendBubble(`I will orchestrate: ${intent}. I’ll update billing, insurance, and notify the right teams.`);
    toggleCopilot(true);
  });
});

// Registration / OPD tabs
const opdTabs = $('#opdTabs');
const opdContent = $('#opdContent');
const opdTemplates = {
  queue: [
    { title: 'Queue dashboard', desc: '18 waiting • Fast-track: 4 • Average wait 14 mins', tag: 'Triage in progress', action: 'Auto-prioritize chest pain' },
    { title: 'Triage cards', desc: 'Vitals, pain score, allergy capture with alerts', tag: 'Green/Amber/Red splits', action: 'Send red to ER' },
    { title: 'Token screens', desc: 'OPD tokens mirrored to lobby screens', tag: 'Bilingual prompts', action: 'Update screen' }
  ],
  appointments: [
    { title: 'Today’s appointments', desc: '42 booked • 6 teleconsults • Payment verified', tag: 'NABH compliant', action: 'Start consult' },
    { title: 'Doctor slots', desc: 'Auto-buffered with breaks and sterilization blocks', tag: 'No overbooking', action: 'Open roster' },
    { title: 'Consent & forms', desc: 'Digital signatures synced to EMR and insurance', tag: 'Audit-ready PDFs', action: 'Capture consent' }
  ],
  notes: [
    { title: 'Clinical notes', desc: 'SOAP templates, ICD-10 search, drug-allergy alerts', tag: 'AI assisted', action: 'Dictate note' },
    { title: 'Orders & meds', desc: 'eRx, lab/radiology orders, drug interactions blocked', tag: 'Stewardship locks', action: 'Place order' },
    { title: 'Discharge summaries', desc: 'Auto-pull vitals, labs, procedures; sign-off routing', tag: 'IRDAI ready', action: 'Generate summary' }
  ]
};

function renderOPD(tab = 'queue') {
  if (!opdContent) return;
  opdContent.innerHTML = opdTemplates[tab].map(card => `
    <div class="frosted-card">
      <p class="badge">${card.tag}</p>
      <h3>${card.title}</h3>
      <p class="muted">${card.desc}</p>
      <button class="btn-mini" data-cta="${card.action}">${card.action}</button>
    </div>
  `).join('');
}
renderOPD();

opdTabs?.addEventListener('click', (e) => {
  const btn = e.target.closest('.hf-chip');
  if (!btn) return;
  $$('.hf-chip', opdTabs).forEach(chip => chip.classList.remove('active'));
  btn.classList.add('active');
  renderOPD(btn.dataset.tab);
});

// IPD vitals simulation
const ipdVitals = $('#ipdVitals');
const ipdInsight = $('#ipdInsight');
if (ipdVitals) {
  const ranges = [
    { label: 'SpO₂', min: 96, max: 99, suffix: '%' },
    { label: 'BP', min: 110, max: 128, suffix: '/78' },
    { label: 'HR', min: 78, max: 96, suffix: ' bpm' },
    { label: 'Temp', min: 36.5, max: 37.2, suffix: '°C' }
  ];
  setInterval(() => {
    ipdVitals.innerHTML = ranges.map(r => {
      const val = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
      return `<div class="vital-row"><span>${r.label}</span><strong>${val}${r.suffix}</strong><small>AI watch</small></div>`;
    }).join('');
    if (ipdInsight) ipdInsight.textContent = 'AI: No escalation triggers; monitor fluids and document pain scores.';
  }, 3500);
}

// Live hospital pulse simulation
const liveVitals = $('#liveVitals');
const aiPulse = $('#aiPulse');
if (liveVitals) {
  setInterval(() => {
    const opd = Math.floor(Math.random() * 10) + 12;
    const rounds = Math.floor(Math.random() * 10) + 24;
    const tests = Math.floor(Math.random() * 10) + 18;
    const billing = (Math.random() * 6 + 10).toFixed(1);
    liveVitals.innerHTML = `
      <div class="vital-row"><span>OPD</span><strong>${opd} waiting</strong><small>Priority: chest pain cleared</small></div>
      <div class="vital-row"><span>IPD</span><strong>${rounds} rounds</strong><small>Orders pending: 3</small></div>
      <div class="vital-row"><span>Labs</span><strong>${tests} tests</strong><small>HL7 sync on</small></div>
      <div class="vital-row"><span>Billing</span><strong>₹${billing}L</strong><small>Unbilled: 3 cases</small></div>`;
    if (aiPulse) aiPulse.textContent = 'AI guardrails: discharge checklists clean; insurance docs ready for upload.';
  }, 3200);
}
$('#expandPulse')?.addEventListener('click', () => {
  appendBubble('Opening detailed hospital pulse with drill-down by department and TPA.');
  toggleCopilot(true);
});

// Labs tabs
const labTabs = $('#labTabs');
const labTabButtons = $$('[data-tab-target]');
labTabButtons.forEach(btn => btn.addEventListener('click', () => {
  labTabButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const target = btn.dataset.tabTarget;
  $$('[data-tab]', labTabs).forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.tab !== target);
  });
}));

// Pharmacy grid
const pharmacyGrid = $('#pharmacyGrid');
const pharmacyFilters = $('#pharmacyFilters');
const pharmacyItems = [
  { name: 'Trastuzumab', stock: '18 vials', tag: 'oncology' },
  { name: 'Noradrenaline', stock: '62 amps', tag: 'critical' },
  { name: 'Surgical sutures', stock: '240 packs', tag: 'surgical' },
  { name: 'Insulin glargine', stock: '40 pens', tag: 'critical' },
  { name: 'Chemotherapy PPE', stock: '120 kits', tag: 'oncology' },
  { name: 'Sterile gauze', stock: '520 units', tag: 'surgical' }
];

function renderPharmacy(filter = 'all') {
  if (!pharmacyGrid) return;
  pharmacyGrid.innerHTML = pharmacyItems
    .filter(item => filter === 'all' || item.tag === filter)
    .map(item => `
      <div class="frosted-card">
        <h3>${item.name}</h3>
        <p class="muted">Stock: ${item.stock} • Billing-linked dispensing</p>
        <button class="btn-mini" data-cta="Dispense ${item.name}">Dispense</button>
      </div>
    `).join('');
}
renderPharmacy();

pharmacyFilters?.addEventListener('click', (e) => {
  const btn = e.target.closest('.hf-chip');
  if (!btn) return;
  $$('.hf-chip', pharmacyFilters).forEach(chip => chip.classList.remove('active'));
  btn.classList.add('active');
  renderPharmacy(btn.dataset.filter);
});

// Billing simulator
const consumableInput = $('#consumableInput');
const pharmacyInputField = $('#pharmacyInput');
const stayInput = $('#stayInput');
const simResult = $('#simResult');
$('#runSimulation')?.addEventListener('click', () => {
  const consumables = Number(consumableInput.value) || 0;
  const pharmacy = Number(pharmacyInputField.value) || 0;
  const stay = Number(stayInput.value) || 0;
  const roomCharge = stay * 4500;
  const total = consumables + pharmacy + roomCharge;
  const payable = Math.max(total - total * 0.1, 0);
  if (simResult) simResult.textContent = `Estimated payable: ₹${payable.toLocaleString('en-IN')}`;
  appendBubble('Simulation ready — pushing estimate to insurance desk with denial checks.');
  toggleCopilot(true);
});

// Keep active states on load
updateActive('top');
