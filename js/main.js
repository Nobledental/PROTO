/* ============================================================
   HealthFlo — Patient OS Engine
   Supports: onboarding, dashboard, care modules, insurance,
   finance, vitals, records, copilot, notifications, settings
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ============================================================
   THEME PRESETS (white/dark/matte/cosmic)
   ============================================================ */
const themes = ['white', 'dark', 'matte', 'cosmic'];
const themeToggle = $('#themeToggle');

function applyTheme(theme) {
  const chosen = themes.includes(theme) ? theme : 'white';
  document.documentElement.dataset.theme = chosen;
  localStorage.setItem('hfTheme', chosen);
  if (themeToggle) {
    const icon = chosen === 'white' ? '☀️' : chosen === 'dark' ? '🌙' : chosen === 'matte' ? '🧊' : '✨';
    themeToggle.textContent = icon;
    themeToggle.setAttribute('aria-label', `Switch theme (current: ${chosen})`);
  }
}

applyTheme(localStorage.getItem('hfTheme') || 'white');

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme || 'white';
  const next = themes[(themes.indexOf(current) + 1) % themes.length];
  applyTheme(next);
});

/* ============================================================
   NAV + TICKER
   ============================================================ */
const navToggle = $('#navToggle');
const primaryNav = $('.primary-nav');
if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    primaryNav.classList.toggle('is-open');
  });
}

const tickerTrack = $('.ticker__track');
const pauseTicker = $('#pauseTicker');
let tickerInterval;

function startTicker() {
  if (!tickerTrack) return;
  tickerInterval = requestAnimationFrame(stepTicker);
}
let tickerOffset = 0;
function stepTicker() {
  tickerOffset -= 0.5;
  tickerTrack.style.transform = `translateX(${tickerOffset}px)`;
  if (Math.abs(tickerOffset) > tickerTrack.scrollWidth / 2) tickerOffset = 0;
  tickerInterval = requestAnimationFrame(stepTicker);
}
function stopTicker() {
  if (tickerInterval) cancelAnimationFrame(tickerInterval);
}
if (tickerTrack) startTicker();
pauseTicker?.addEventListener('click', () => {
  const paused = tickerTrack.classList.toggle('is-paused');
  if (paused) {
    stopTicker();
    pauseTicker.textContent = '▶';
  } else {
    startTicker();
    pauseTicker.textContent = '⏸';
  }
});

/* ============================================================
   HERO PERSONA
   ============================================================ */
const personaSelect = $('#personaSelect');
const personaNotes = {
  patient: 'Patient: live vitals, appointments, insurance clarity, and AI guardian alerts.',
  family: 'Family: monitor vitals, approve admissions, and receive emergency + billing notifications.',
  admin: 'Hospital desk: admission-to-discharge readiness with billing + insurance guardrails.',
  insurer: 'Insurer: non-payable prediction, audit-ready packets, and IRDAI-compliant docs.'
};
const heroBody = $('.hero-body');
personaSelect?.addEventListener('click', (e) => {
  const btn = e.target.closest('.persona-option');
  if (!btn) return;
  $$('.persona-option', personaSelect).forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const key = btn.dataset.persona;
  heroBody.textContent = personaNotes[key] || heroBody.textContent;
});

/* ============================================================
   DATA HELPERS
   ============================================================ */
function cardTemplate({ title, body, meta, actions = [], badges = [] }) {
  return `
    <div class="hf-card">
      <div class="card-top">
        <h3 class="card-title">${title}</h3>
        ${meta ? `<span class="hf-tag">${meta}</span>` : ''}
      </div>
      <p class="muted">${body}</p>
      ${badges.length ? `<div class="hf-pill-row">${badges.map(b => `<span class="hf-pill">${b}</span>`).join('')}</div>` : ''}
      ${actions.length ? `<div class="hero-ctas">${actions.map(a => `<a class="btn btn-ghost" href="${a.href}">${a.label}</a>`).join('')}</div>` : ''}
    </div>
  `;
}

function renderList(containerId, items = [], renderer) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = items.map(renderer).join('');
}

/* ============================================================
   ONBOARDING & PROFILE
   ============================================================ */
renderList('onboardingGrid', [
  {
    title: 'Authentication',
    body: 'Mobile OTP login with secure session, encrypted vault, Aadhaar/eKYC ready, and multi-device sync.',
    badges: ['OTP', 'Aadhaar-ready', 'Device trust']
  },
  {
    title: 'User Profiles',
    body: 'Personal + contact details, emergency contacts, family relationships, preferred language & hospital/doctor.',
    badges: ['Profiles', 'Emergency', 'Preferences']
  },
  {
    title: 'Security',
    body: 'Encrypted at rest, session hardening, device binding, and data sharing controls for records & vitals.',
    badges: ['Encryption', 'Privacy', 'Sharing controls']
  }
], cardTemplate);

const profileSummary = $('#profileSummary');
if (profileSummary) {
  profileSummary.innerHTML = `
    <h3 class="card-title">Account Snapshot</h3>
    <div class="hf-grid">
      <div><strong>Language:</strong> English / हिंदी ready</div>
      <div><strong>Preferred hospital:</strong> Fortis Bannerghatta</div>
      <div><strong>Preferred doctor:</strong> Dr. Meera (Cardiology)</div>
      <div><strong>Family members:</strong> 3 linked • emergency contacts synced</div>
    </div>
  `;
}

/* ============================================================
   DASHBOARD TODAY + QUICK ACTIONS
   ============================================================ */
renderList('todayGrid', [
  {
    title: "Today's Appointments",
    body: 'Dr. Meera (Cardiology) • 10:00 AM • Fortis • Maps + tele link ready.',
    badges: ['Online slot', 'Directions', 'Reschedule'],
    meta: 'Confirmed'
  },
  {
    title: 'Active Medicines',
    body: 'Bisoprolol 2.5mg • Atorvastatin 10mg • adherence at 96%. Refill due in 5 days.',
    badges: ['Refill', 'Reminders', 'Auto-refill'],
    meta: 'On track'
  },
  {
    title: 'Recent Reports',
    body: 'CBC (normal), FBS 96 mg/dL, ECG reviewed. AI flagged 0 abnormal ranges.',
    badges: ['Lab history', 'AI trends', 'Share'],
    meta: 'Clear'
  },
  {
    title: 'Insurance Status',
    body: 'Policy: Reliance Health Infinity • Cashless eligible • Remaining SI ₹2.4L • Co-pay 10%.',
    badges: ['Cashless', 'Preauth', 'Non-payables'],
    meta: 'Active'
  },
  {
    title: 'Live Vitals (IoMT)',
    body: 'Heart 78 bpm • SpO₂ 98% • BP 120/78 • Resp 16 • Temp 36.8°C • Steps 6,200.',
    badges: ['IoMT', 'Hourly/daily trends', 'Alerts'],
    meta: 'Stable'
  },
  {
    title: 'AI Guardian',
    body: '“Vitals stable. Hydration recommended. No emergency triggers. Ambulance auto-dispatch armed.”',
    badges: ['Guardian', 'Risk scoring', 'Emergency'],
    meta: 'Safe'
  },
  {
    title: 'Finance Reminders',
    body: 'Upcoming bill: ₹6,200 (lab + pharmacy). Split UPI/Card/Wallet. EMI pre-approved at 0% for 6 months.',
    badges: ['UPI', 'Card', 'EMI'],
    meta: 'Due in 2d'
  },
  {
    title: 'Ongoing Treatment',
    body: 'Post-discharge follow-up: physiotherapy today 5 PM, wound check, and antibiotics day 5/7.',
    badges: ['PT', 'Orders', 'Alerts'],
    meta: 'In progress'
  },
  {
    title: 'Emergency Alerts',
    body: 'SOS ready • Family + hospital + ambulance notified if vitals drop. Geo-tracking enabled.',
    badges: ['SOS', 'Family', 'Hospital'],
    meta: 'Armed'
  }
], cardTemplate);

renderList('quickActions', [
  { label: 'Book Appointment', href: 'appointments.html' },
  { label: 'Book Lab Test', href: 'labs.html' },
  { label: 'Buy Medicine', href: 'medicines.html' },
  { label: 'Call Ambulance', href: 'ambulance.html' },
  { label: 'Upload Prescription', href: 'medicines.html#upload' },
  { label: 'Share Records', href: 'records.html' }
], ({ label, href }) => `
  <a class="hf-tile" href="${href}">
    <div class="t-icon">⚡</div>
    <strong>${label}</strong>
    <span class="muted">Quick action</span>
  </a>
`);

/* ============================================================
   CARE MODULE TABS
   ============================================================ */
const careData = {
  appointments: [
    'Hospitals, clinics, doctors, specialists, physios, home nurses with online slots.',
    'Priority booking for registered hospitals; reminders + maps; cancel/reschedule flows.',
    'AI doctor recommendation based on symptoms and past outcomes.'
  ],
  hospitals: [
    'Nearby + specialty filters; cashless network + NABH filter; ratings & reviews.',
    'Departments, doctors, procedures, rates/packages, insurance tie-ups, amenities.',
    'Bed availability (future sync) and 3D hospital map (future).'
  ],
  doctors: [
    'Search by specialty, symptoms, hospital, gender, experience, ratings.',
    'Doctor profile: qualifications, affiliations, timings, reviews, AI suggestion.',
    'Book + teleconsult + follow-up window logic.'
  ],
  labs: [
    'Book lab tests + home sample; compare test prices; panel tests + packages.',
    'AI analysis of lab reports; trends for CBC, sugar, thyroid, kidney/liver, lipid.',
    'Alerts: abnormal ranges, next steps, notify family/doctor.'
  ],
  medicines: [
    'Search medicines; generic comparison; price + alternatives.',
    'Upload prescription; order + track; refill + auto-refill reminders.',
    'Batch selection, GST handling, UPI/Card/Wallet split payments.'
  ]
};

const carePanel = $('#carePanel');
const careTabs = $('#careTabs');
function renderCare(tab = 'appointments') {
  if (!carePanel) return;
  const points = careData[tab] || [];
  carePanel.innerHTML = `
    <ul class="hf-list">${points.map(p => `<li>${p}</li>`).join('')}</ul>
    <div class="hero-ctas">
      <a class="btn btn-primary" href="${tab === 'appointments' ? 'appointments.html' : tab + '.html'}">Open ${tab.charAt(0).toUpperCase() + tab.slice(1)}</a>
      <a class="btn btn-ghost" href="#copilot">Ask Copilot</a>
    </div>
  `;
}
renderCare();
careTabs?.addEventListener('click', (e) => {
  const chip = e.target.closest('.hf-chip');
  if (!chip) return;
  $$('.hf-chip', careTabs).forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderCare(chip.dataset.tab);
});

/* ============================================================
   INSURANCE & FINANCE
   ============================================================ */
renderList('insuranceGrid', [
  {
    title: 'Cashless Flow',
    body: 'Coverage check, eligibility score, required docs, network hospitals, estimated approval time, AI non-payable prediction, co-pay & OOP.',
    badges: ['Cashless', 'Eligibility', 'Non-payables']
  },
  {
    title: 'Reimbursement',
    body: 'Submit discharge summary, bills, prescriptions. Track claim, AI risk score, expected settlement, TPA workflow view.',
    badges: ['Claims', 'Tracking', 'Risk score']
  },
  {
    title: 'Family Insurance',
    body: 'Policy details, remaining sum insured, member-wise usage, document vault with IRDAI-ready packets.',
    badges: ['Family', 'Usage', 'Vault']
  }
], cardTemplate);

const financeCard = $('#financeCard');
if (financeCard) {
  financeCard.innerHTML = `
    <h3 class="card-title">Finance OS</h3>
    <div class="hf-grid">
      <div><strong>CIBIL-based quick check:</strong> Health credit score & EMI eligibility.</div>
      <div><strong>Loans:</strong> 0% EMI plans; treatment loan calculator; upload KYC; instant approval (future).</div>
      <div><strong>Payments:</strong> Pay hospital/lab/pharmacy bills via UPI/Card/Wallet; split payments.</div>
      <div><strong>AI:</strong> Non-payable detection + out-of-pocket clarity before you pay.</div>
    </div>
  `;
}

/* ============================================================
   AMBULANCE & EMERGENCY
   ============================================================ */
renderList('ambulanceGrid', [
  {
    title: 'Booking',
    body: 'Book Basic/Advanced/ICU ambulance; live tracking; ETA; family notification.',
    badges: ['Live tracking', 'ETA', 'Family alert']
  },
  {
    title: 'Auto-dispatch',
    body: 'AI routing + vitals-trigger: if vitals drop → nearest ambulance + hospital + family alerted.',
    badges: ['AI routing', 'SOS', 'Hospital notify']
  }
], cardTemplate);

/* ============================================================
   VITALS & IOMT
   ============================================================ */
renderList('vitalsGrid', [
  {
    title: 'Live Streams',
    body: 'Heart rate, SpO₂, resp rate, BP, temperature, glucose (CGM), steps, sleep, ECG (future).',
    badges: ['Hourly/daily/week/month', 'Device sync', 'Alerts']
  },
  {
    title: 'AI Anomaly Detection',
    body: 'Risk scoring, emergency warnings, auto-notify hospital/ambulance/family, hydration nudges.',
    badges: ['Risk', 'Guardian', 'Notify']
  }
], cardTemplate);

const vitalsInsights = $('#vitalsInsights');
if (vitalsInsights) {
  vitalsInsights.innerHTML = `
    <h3 class="card-title">AI Vitals Insights</h3>
    <ul class="hf-list">
      <li>Heart 78 bpm, HRV within target, no arrhythmia signatures detected.</li>
      <li>SpO₂ 98%, respiration 16 — stable; hydration suggested mid-day.</li>
      <li>BP 120/78 compared to last week avg 122/80 — trending normal.</li>
      <li>Sugar 96 mg/dL fasting; AI suggests 20-minute walk post lunch.</li>
    </ul>
  `;
}

/* ============================================================
   RECORDS VAULT
   ============================================================ */
renderList('recordsGrid', [
  {
    title: 'Vault',
    body: 'OPD, IPD, prescriptions, lab, radiology, discharge, operative notes, insurance docs, bills & receipts.',
    badges: ['Secure', 'Share', 'Audit-ready']
  },
  {
    title: 'AI Summaries',
    body: 'Generate medical history briefs, share with doctor/hospital/insurance/family with consent.',
    badges: ['Summary', 'Consent', 'Share links']
  }
], cardTemplate);

/* ============================================================
   PROFILE & FAMILY
   ============================================================ */
renderList('familyGrid', [
  {
    title: 'Patient Profile',
    body: 'Name, gender, age, contact, Aadhaar (future), lifestyle, medical history, allergies.',
    badges: ['Profile', 'History', 'Allergies']
  },
  {
    title: 'Family Management',
    body: 'Add members, monitor vitals, book appointments for them, insurance status, emergency alerts.',
    badges: ['Family', 'Insurance', 'Alerts']
  }
], cardTemplate);

/* ============================================================
   COPILOT + NOTIFICATIONS
   ============================================================ */
renderList('copilotGrid', [
  {
    title: 'AI Copilot',
    body: 'Symptom triage, lab interpretation, diet, medication, fitness, insurance, claim status, mental health check-ins, reminders, policy reading, hospital treatment summary.',
    badges: ['Chat', 'Voice', 'Vision']
  },
  {
    title: 'Notifications Center',
    body: 'Appointment, medicine, lab, bill, insurance, claim, emergency, vitals anomaly, AI insights — all channels.',
    badges: ['Alerts', 'Escalations', 'Family']
  }
], cardTemplate);

const notificationsPanel = $('#notificationsPanel');
if (notificationsPanel) {
  const alerts = [
    'Reminder: Physio at 5 PM • tap for directions.',
    'Medicine: Bisoprolol due now; adherence 96%.',
    'Insurance: Cashless preauth approved • ₹2.4L remaining.',
    'Vitals: BP trend normal; next review tomorrow.',
    'Finance: Lab + pharmacy bill ₹6,200 due in 2 days.'
  ];
  notificationsPanel.innerHTML = `
    <h3 class="card-title">Live Alerts</h3>
    <ul class="hf-list">${alerts.map(a => `<li>${a}</li>`).join('')}</ul>
  `;
}

/* ============================================================
   SETTINGS
   ============================================================ */
renderList('settingsGrid', [
  {
    title: 'Preferences',
    body: 'Language, theme (light/dark/matte/cosmic), notification preferences.',
    badges: ['Language', 'Theme', 'Notifications']
  },
  {
    title: 'Privacy & Devices',
    body: 'Privacy settings, device connections, data sharing controls, account deletion.',
    badges: ['Privacy', 'IoMT', 'Delete account']
  }
], cardTemplate);

/* ============================================================
   COPILOT WIDGET
   ============================================================ */
const copilotFab = $('#copilotFab');
const copilotPanel = $('#copilotPanel');
const copilotChat = $('#copilotChat');
const copilotInput = $('#copilotInput');
const copilotSend = $('#copilotSend');

function toggleCopilot(open = true) {
  if (!copilotPanel) return;
  copilotPanel.style.display = open ? 'flex' : 'none';
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
  const msg = copilotInput?.value.trim();
  if (!msg) return;
  appendBubble(msg, 'user');
  copilotInput.value = '';
  setTimeout(() => {
    appendBubble('Here is your HealthFlo brief:\n• Vitals stable, hydration suggested.\n• Insurance cashless eligible, no non-payables flagged.\n• Bills: ₹6,200 due, EMI available.\nWant me to notify family or hospital desk?');
  }, 600);
}
copilotFab?.addEventListener('click', () => toggleCopilot(copilotPanel?.style.display !== 'flex'));
copilotSend?.addEventListener('click', sendCopilot);
copilotInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendCopilot();
});

/* ============================================================
   BACK TO TOP
   ============================================================ */
const backToTop = $('#backToTop');
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  const visible = window.scrollY > 500;
  backToTop.classList.toggle('visible', visible);
});
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   RECORD SEARCH + LIST (legacy support)
   ============================================================ */
const recordSearch = $('#recordSearch');
const recordList = $('#recordList');
if (recordSearch && recordList) {
  recordSearch.addEventListener('input', () => {
    const q = recordSearch.value.toLowerCase();
    $$('.record-item', recordList).forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
    });
  });
}

if (recordList) {
  const records = [
    { type: 'lab', name: 'CBC — Complete Blood Count', date: '2024-10-01' },
    { type: 'scan', name: 'Chest X-Ray PA View', date: '2024-09-20' },
    { type: 'rx', name: 'Prescription — Dr. Raj', date: '2024-09-15' },
    { type: 'note', name: 'Follow-up Notes', date: '2024-09-12' },
    { type: 'discharge', name: 'Discharge Summary', date: '2024-08-21' }
  ];
  recordList.innerHTML = records.map(r => `
    <div class="record-item" data-type="${r.type}">
      <div>
        <strong>${r.name}</strong><br>
        <small>${r.date}</small>
      </div>
      <div class="record-tag">${r.type.toUpperCase()}</div>
    </div>
  `).join('');
}

/* ============================================================
   CHIP FILTERS (legacy support)
   ============================================================ */
const chips = $$('.hf-chip[data-filter]');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    $$('.record-item').forEach(row => {
      row.style.display = f === 'all' || row.dataset.type === f ? 'flex' : 'none';
    });
  });
});

/* ============================================================
   VITALS SIMULATION (legacy)
   ============================================================ */
if ($('#vitalsGraph')) {
  const vg = $('#vitalsGraph');
  setInterval(() => {
    vg.textContent = '❤️ Heart Rate: ' + (70 + Math.floor(Math.random() * 12));
  }, 1500);
}
