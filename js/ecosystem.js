// HealthFlo Ecosystem Interactions
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

// Nav toggle (mobile)
const navToggle = $('#navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

// Persona activation
const personaSelect = $('#personaSelect');
if (personaSelect) {
  personaSelect.addEventListener('click', (e) => {
    if (e.target.matches('.hf-chip')) {
      $$('.hf-chip', personaSelect).forEach(chip => chip.classList.remove('active'));
      e.target.classList.add('active');
      document.body.dataset.persona = e.target.dataset.persona;
    }
  });
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
const sections = ['patient', 'hospital', 'insurance', 'rcm', 'admin'];
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
