// HealthFlo Ecosystem Interactions
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Theme switching across design presets
const themes = ['white', 'dark', 'matte', 'cosmic'];
const themeToggle = $('#themeToggle');

function applyTheme(theme) {
  const target = themes.includes(theme) ? theme : 'white';
  document.documentElement.dataset.theme = target;
  localStorage.setItem('hfTheme', target);
  if (themeToggle) {
    themeToggle.textContent = target === 'white' ? '☀️' : target === 'dark' ? '🌙' : target === 'matte' ? '🧊' : '✨';
    themeToggle.setAttribute('aria-label', `Switch theme (current: ${target})`);
  }
}

const savedTheme = localStorage.getItem('hfTheme');
applyTheme(savedTheme || 'white');

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme || 'white';
  const idx = themes.indexOf(current);
  const next = themes[(idx + 1) % themes.length];
  applyTheme(next);
});

// Nav toggle (mobile)
const navToggle = $('#navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

// Persona activation
const personaSelect = $('#personaSelect');
const personaNarratives = {
  patient: 'Patient view: AI shields family members, books follow-ups, and preps insurance packets.',
  hospital: 'Hospital view: OPD/IPD queues, OT events, pharmacy, labs, and billing stay in sync with zero audit drift.',
  insurer: 'Insurer view: Cashless aging, deduction guard, and audit kits flow in with IRDAI compliance locks.',
  rcm: 'RCM view: Denial prevention, AR heatmaps, and TPA escalations are orchestrated with timestamps.'
};
const personaStory = $('#personaStory');
function setPersonaStory(key = 'patient') {
  if (personaStory) personaStory.textContent = personaNarratives[key] || personaNarratives.patient;
}
if (personaSelect) {
  personaSelect.addEventListener('click', (e) => {
    if (e.target.matches('.hf-chip')) {
      $$('.hf-chip', personaSelect).forEach(chip => chip.classList.remove('active'));
      e.target.classList.add('active');
      document.body.dataset.persona = e.target.dataset.persona;
      setPersonaStory(e.target.dataset.persona);
    }
  });
  setPersonaStory('patient');
}

// Ticker autoplay
const ticker = $('#hfTicker .ticker-track');
if (ticker) {
  let offset = 0;
  setInterval(() => {
    offset -= 1;
    ticker.style.transform = `translateX(${offset}px)`;
    if (Math.abs(offset) > ticker.scrollWidth / 2) {
      offset = 0;
    }
  }, 30);
}

// Metric counters
const counters = $$('[data-counter]');
function animateCounter(el) {
  const target = parseFloat(el.dataset.counter || '0');
  const suffix = el.dataset.suffix || '';
  const format = el.dataset.format === 'compact';
  let current = 0;
  const step = target / 60;
  const tick = () => {
    current = Math.min(target, current + step);
    el.textContent = format ? Intl.NumberFormat('en', { notation: 'compact' }).format(current) + suffix : `${current.toFixed(1).replace(/\.0$/, '')}${suffix}`;
    if (current < target) requestAnimationFrame(tick);
  };
  tick();
}
counters.forEach(animateCounter);

// Copilot panel
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
    appendBubble('Here is your HealthFlo brief:\n• Insurance: cashless eligible, no sub-limit hit.\n• Vitals: stable, no escalation triggers.\n• Finance: EMI available from ₹1,999/mo.\nNeed me to alert the hospital desk?');
  }, 600);
}

copilotFab?.addEventListener('click', () => toggleCopilot(true));
openCopilot?.addEventListener('click', () => toggleCopilot(true));
closeCopilot?.addEventListener('click', () => toggleCopilot(false));
copilotSend?.addEventListener('click', sendCopilot);
copilotInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendCopilot();
});

// Scroll interactions: highlight dock and header nav by section
const sections = ['patient', 'hospital', 'insurance', 'rcm', 'network', 'guardian', 'admin'];
const dockItems = $$('.hf-dock .dock-item');
const navLinks = $$('#primaryNav a');
function updateActive(sectionId) {
  dockItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(sectionId)) item.classList.add('active');
    else item.classList.remove('active');
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(sectionId)) link.classList.add('active');
    else link.classList.remove('active');
  });
}
if (dockItems.length || navLinks.length) {
  window.addEventListener('scroll', () => {
    let active = 'patient';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) active = id;
    });
    updateActive(active);
  });
}

// CTA behaviors
$$('[data-cta]').forEach(btn => {
  btn.addEventListener('click', () => {
    const intent = btn.dataset.cta;
    appendBubble(`I will set up ${intent} flow and notify the right team.`);
    toggleCopilot(true);
  });
});

// Vitals simulation
const vitalsStream = $('#vitalsStream');
const vitalInsight = $('#vitalInsight');
if (vitalsStream) {
  const ranges = [
    { label: '❤️ Heart', min: 72, max: 88, suffix: 'bpm' },
    { label: '🩸 BP', min: 110, max: 128, suffix: '/78' },
    { label: '🌬️ Resp', min: 14, max: 18, suffix: 'rpm' },
    { label: '🩺 SpO₂', min: 96, max: 99, suffix: '%' }
  ];
  setInterval(() => {
    vitalsStream.innerHTML = ranges.map(r => {
      const val = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
      return `<div class="vital-row"><span>${r.label}</span><strong>${val}${r.suffix}</strong><small>AI checking drift</small></div>`;
    }).join('');
    if (vitalInsight) vitalInsight.textContent = 'AI confirms readings are within your baseline. Hydration reminder in 20 mins.';
  }, 3200);
}

// Experience control center updates
const railStatus = $('#railStatus');
const cashlessSla = $('#cashlessSla');
const vitalsUptime = $('#vitalsUptime');
const claimReady = $('#claimReady');
const slaCashless = $('#slaCashless');
const deviceLink = $('#deviceLink');
const ambulanceGrid = $('#ambulanceGrid');
const rcmRisk = $('#rcmRisk');
const systemInsight = $('#systemInsight');
function updateExperienceBoard() {
  const wait = Math.max(18, Math.floor(Math.random() * 18) + 26);
  const uptime = (99.4 + Math.random() * 0.5).toFixed(1);
  const claims = Math.floor(Math.random() * 6) + 12;
  const approvals = (95 + Math.random() * 4).toFixed(1);
  cashlessSla && (cashlessSla.textContent = `${wait} mins`);
  vitalsUptime && (vitalsUptime.textContent = `${uptime}%`);
  claimReady && (claimReady.textContent = `${claims} cases`);
  slaCashless && (slaCashless.textContent = `${approvals}%`);
  deviceLink && (deviceLink.textContent = `${uptime}%`);
  ambulanceGrid && (ambulanceGrid.textContent = `${Math.floor(Math.random() * 4) + 9}m ETA`);
  rcmRisk && (rcmRisk.textContent = approvals > 96 ? 'Low' : 'Watch');
  railStatus && (railStatus.textContent = approvals > 96 ? 'All steps green • No dropped handoffs' : 'Insurance rail nudging pre-auth for 2 cases');
  systemInsight && (systemInsight.textContent = 'AI watching: no SLA breaches; pushing pre-emptive insurer nudges.');
}
setInterval(updateExperienceBoard, 3600);
updateExperienceBoard();

// Insurance CTA
$('#openInsurance')?.addEventListener('click', () => {
  appendBubble('Opening Insurance OS with your latest policy and pre-auth drafts.');
  toggleCopilot(true);
});

$('#expandVitals')?.addEventListener('click', () => {
  appendBubble('Pulling your vitals graphs with last 7 days trend.');
  toggleCopilot(true);
});

// Dock smooth scroll
$$('.hf-dock a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Header nav smooth scroll
$('#primaryNav')?.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  e.preventDefault();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth' });
});

// Search interactions
const searchInput = $('#hfSearch');
const searchCTA = $('#searchCTA');
function runSearch() {
  const q = searchInput?.value.trim();
  if (!q) return;
  appendBubble(`I’ll search across providers, policies, and claims for: “${q}”. Want me to reserve a slot or check cashless?`);
  toggleCopilot(true);
}
searchCTA?.addEventListener('click', runSearch);
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runSearch();
});
