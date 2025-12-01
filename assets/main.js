/* ============================================================
   HealthFlo — Patient OS runtime
   Production-ready UI logic for patient-facing screens
   ============================================================ */

const $ = (selector, el = document) => el.querySelector(selector);
const $$ = (selector, el = document) => [...el.querySelectorAll(selector)];

/* ============================================================
   THEME HANDLING
   ============================================================ */
const THEMES = ['light', 'dark'];
function applyTheme(theme) {
  const chosen = THEMES.includes(theme) ? theme : 'light';
  document.documentElement.dataset.theme = chosen;
  localStorage.setItem('hfTheme', chosen);
  $$('#themeToggle, #themeToggle2').forEach(btn => {
    btn.textContent = chosen === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', `Switch to ${chosen === 'dark' ? 'light' : 'dark'} mode`);
  });
}

function initTheme() {
  applyTheme(localStorage.getItem('hfTheme') || 'light');
  $$('#themeToggle, #themeToggle2').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  });
}

/* ============================================================
   DATA MODELS
   ============================================================ */
const appointments = [
  {
    doctor: 'Dr. Meera Rao',
    specialty: 'Cardiology',
    mode: 'In-person',
    time: 'Today • 10:00 AM',
    location: 'Fortis Bannerghatta',
    status: 'Confirmed'
  },
  {
    doctor: 'Dr. Rajeev Nair',
    specialty: 'Endocrinology',
    mode: 'Video',
    time: 'Today • 4:30 PM',
    location: 'Virtual link ready',
    status: 'Vitals needed'
  },
  {
    doctor: 'Dr. Sana Arif',
    specialty: 'Dermatology',
    mode: 'In-person',
    time: 'Tomorrow • 11:15 AM',
    location: 'Cloudnine, Jayanagar',
    status: 'Upcoming'
  }
];

const hospitalCatalog = [
  {
    name: 'Fortis Bannerghatta',
    tags: ['cashless', 'cardio', 'trauma'],
    address: 'Bannerghatta Main Rd, Bengaluru',
    beds: 320,
    rating: 4.6,
    contact: '+91 804-665-5555',
    distance: '3.2 km'
  },
  {
    name: 'Apollo Spectra',
    tags: ['cashless', 'ortho', 'mother'],
    address: 'Koramangala, Bengaluru',
    beds: 120,
    rating: 4.5,
    contact: '+91 804-144-1414',
    distance: '5.1 km'
  },
  {
    name: 'Narayana Health City',
    tags: ['cashless', 'cardio', 'trauma'],
    address: 'Bommasandra, Bengaluru',
    beds: 600,
    rating: 4.7,
    contact: '+91 808-600-0400',
    distance: '12 km'
  },
  {
    name: 'Cloudnine',
    tags: ['cashless', 'mother'],
    address: 'JP Nagar, Bengaluru',
    beds: 110,
    rating: 4.8,
    contact: '+91 997-288-9711',
    distance: '6.4 km'
  }
];

const doctorCatalog = [
  {
    name: 'Dr. Meera Rao',
    specialty: 'Cardiology',
    experience: 14,
    hospital: 'Fortis Bannerghatta',
    isOnline: true,
    rating: 4.8,
    fees: 850,
    tag: 'cardio'
  },
  {
    name: 'Dr. Rajeev Nair',
    specialty: 'Endocrinology',
    experience: 11,
    hospital: 'Apollo Spectra',
    isOnline: false,
    rating: 4.6,
    fees: 700,
    tag: 'diabetes'
  },
  {
    name: 'Dr. Sana Arif',
    specialty: 'Dermatology',
    experience: 9,
    hospital: 'Cloudnine',
    isOnline: true,
    rating: 4.7,
    fees: 650,
    tag: 'skin'
  },
  {
    name: 'Dr. Vivek Menon',
    specialty: 'Orthopedics',
    experience: 16,
    hospital: 'Narayana Health City',
    isOnline: false,
    rating: 4.6,
    fees: 900,
    tag: 'ortho'
  }
];

const labsCatalog = [
  { name: 'Thyrocare Advanced', location: 'Koramangala', rating: 4.6, tat: '6 hrs', price: '₹1,400', tags: ['full body', 'fasting'] },
  { name: 'Aster Labs', location: 'BTM Layout', rating: 4.7, tat: '24 hrs', price: '₹950', tags: ['cbc', 'sugar'] },
  { name: 'Metropolis Labs', location: 'HSR Layout', rating: 4.5, tat: '8 hrs', price: '₹1,250', tags: ['thyroid', 'vitamin'] },
  { name: 'SRL Diagnostics', location: 'Indiranagar', rating: 4.6, tat: '10 hrs', price: '₹1,050', tags: ['cbc', 'urine'] }
];

const medicineCatalog = [
  { name: 'Atorvastatin 10mg', salt: 'Atorvastatin', use: 'Cholesterol control', price: '₹120', stock: 'In stock', tags: ['cardio'] },
  { name: 'Bisoprolol 2.5mg', salt: 'Bisoprolol', use: 'Heart rate', price: '₹180', stock: 'Low stock', tags: ['cardio'] },
  { name: 'Metformin XR 500mg', salt: 'Metformin', use: 'Diabetes', price: '₹95', stock: 'In stock', tags: ['diabetes'] },
  { name: 'Cetirizine 10mg', salt: 'Cetirizine', use: 'Allergy relief', price: '₹45', stock: 'In stock', tags: ['allergy'] }
];

const pharmacies = [
  { name: 'HealthFlo Pharmacy', area: 'Koramangala', promise: '24x7 • Same-day', contact: '+91 804-220-2020' },
  { name: 'NetMeds Partner', area: 'JP Nagar', promise: 'Cold-chain ready', contact: '+91 901-111-2211' },
  { name: 'Apollo Pharmacy', area: 'BTM Layout', promise: 'Express delivery', contact: '+91 804-220-9090' }
];

const ambulances = [
  { provider: 'StanPlus ALS', eta: '5 mins', capability: 'Ventilator, paramedic onboard', contact: '1800-120-1155' },
  { provider: 'HealthFlo Critical Care', eta: '8 mins', capability: 'Cardiac monitor, oxygen', contact: '+91 990-009-9000' },
  { provider: 'Red Ambulance', eta: '12 mins', capability: 'Basic life support', contact: '+91 804-500-5000' }
];

const records = [
  { title: 'CBC', date: '05 Jan 2024', type: 'Lab', status: 'Normal' },
  { title: 'ECG', date: '12 Jan 2024', type: 'Cardiology', status: 'Clear' },
  { title: 'FBS', date: '18 Jan 2024', type: 'Lab', status: '96 mg/dL' },
  { title: 'Discharge Summary', date: '22 Dec 2023', type: 'IPD', status: 'Archived' }
];

const vitals = {
  hr: [76, 78, 80, 75, 77, 79],
  spo2: [98, 98, 97, 99, 98, 98],
  bp: [
    [122, 80],
    [118, 78],
    [120, 79],
    [125, 82],
    [121, 80],
    [119, 77]
  ],
  sugar: [102, 98, 105, 110, 101, 99]
};

const personas = {
  patient: 'Patient: live vitals, appointments, insurance clarity, and AI guardian alerts.',
  family: 'Family: monitor vitals, approve admissions, and receive emergency + billing notifications.',
  admin: 'Hospital desk: admission-to-discharge readiness with billing + insurance guardrails.',
  insurer: 'Insurer: non-payable prediction, audit-ready packets, and IRDAI-compliant docs.'
};

/* ============================================================
   RENDER HELPERS
   ============================================================ */
function render(containerId, items, templateFn) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = items.map(templateFn).join('');
}

function initNav() {
  const navToggle = $('#navToggle');
  const primaryNav = $('.primary-nav');
  navToggle?.addEventListener('click', () => {
    primaryNav?.classList.toggle('is-open');
  });
}

function initTicker() {
  const track = $('.ticker__track');
  const pauseBtn = $('#pauseTicker');
  if (!track) return;

  let offset = 0;
  let rafId;

  const step = () => {
    offset -= 0.5;
    track.style.transform = `translateX(${offset}px)`;
    if (Math.abs(offset) > track.scrollWidth / 2) offset = 0;
    rafId = requestAnimationFrame(step);
  };

  const start = () => {
    if (!rafId) rafId = requestAnimationFrame(step);
  };
  const stop = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };

  start();
  pauseBtn?.addEventListener('click', () => {
    const paused = track.classList.toggle('is-paused');
    if (paused) {
      stop();
      pauseBtn.textContent = '▶';
    } else {
      start();
      pauseBtn.textContent = '⏸';
    }
  });
}

function initPersonas() {
  const personaHost = $('#personaSelect');
  const heroBody = $('.hero-body');
  if (!personaHost || !heroBody) return;

  personaHost.addEventListener('click', (e) => {
    const btn = e.target.closest('.persona-option');
    if (!btn) return;
    $$('.persona-option', personaHost).forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const key = btn.dataset.persona;
    if (key && personas[key]) heroBody.textContent = personas[key];
  });
}

function matchText(itemText, query) {
  return itemText.toLowerCase().includes(query.toLowerCase());
}

function renderAppointments() {
  if (!$('#appt-list')) return;
  render('appt-list', appointments, (appt) => `
    <article class="list-card">
      <div>
        <div class="list-title">${appt.doctor}</div>
        <div class="muted">${appt.specialty} • ${appt.mode}</div>
        <div class="meta-row">${appt.time} • ${appt.location}</div>
      </div>
      <span class="pill pill--brand">${appt.status}</span>
    </article>
  `);
}

function renderHospitals() {
  const container = $('#hospitalList');
  if (!container) return;

  const searchInput = $('#hospitalSearch');
  let activeFilter = 'all';

  function filtered() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    return hospitalCatalog.filter(item => {
      const matchesFilter = activeFilter === 'all' || item.tags.includes(activeFilter);
      const matchesSearch = !query || matchText(item.name + item.address + item.tags.join(','), query);
      return matchesFilter && matchesSearch;
    });
  }

  function template(hospital) {
    return `
      <article class="hf-card">
        <div>
          <div class="list-title">${hospital.name}</div>
          <div class="meta-row">${hospital.address}</div>
          <div class="muted">Beds ${hospital.beds} • Rating ${hospital.rating}</div>
          <div class="pill-row">${hospital.tags.map(tag => `<span class="pill">${tag}</span>`).join('')}</div>
        </div>
        <div class="card-meta">${hospital.distance}<br>${hospital.contact}</div>
      </article>
    `;
  }

  function updateChips() {
    $$('.hf-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === activeFilter));
  }

  function renderNow() {
    render('hospitalList', filtered(), template);
    updateChips();
  }

  searchInput?.addEventListener('input', renderNow);
  $$('.hf-chip').forEach(chip => chip.addEventListener('click', () => {
    activeFilter = chip.dataset.filter || 'all';
    renderNow();
  }));

  renderNow();
}

function renderDoctors() {
  const container = $('#doctorList');
  if (!container) return;
  const searchInput = $('#doctorSearch');

  function filtered() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    return doctorCatalog.filter(doc => !q || matchText(`${doc.name} ${doc.specialty} ${doc.hospital}`, q));
  }

  render('doctorList', filtered(), (doc) => `
    <article class="hf-card">
      <div>
        <div class="list-title">${doc.name}</div>
        <div class="muted">${doc.specialty} • ${doc.experience}+ yrs</div>
        <div class="meta-row">${doc.hospital}</div>
        <div class="pill-row">
          <span class="pill pill--brand">${doc.isOnline ? 'Online' : 'In-clinic'}</span>
          <span class="pill">₹${doc.fees}</span>
          <span class="pill">${doc.rating}★</span>
        </div>
      </div>
    </article>
  `);

  searchInput?.addEventListener('input', () => render('doctorList', filtered(), (doc) => `
    <article class="hf-card">
      <div>
        <div class="list-title">${doc.name}</div>
        <div class="muted">${doc.specialty} • ${doc.experience}+ yrs</div>
        <div class="meta-row">${doc.hospital}</div>
        <div class="pill-row">
          <span class="pill pill--brand">${doc.isOnline ? 'Online' : 'In-clinic'}</span>
          <span class="pill">₹${doc.fees}</span>
          <span class="pill">${doc.rating}★</span>
        </div>
      </div>
    </article>
  `));
}

function renderLabs() {
  const container = $('#labList');
  if (!container) return;
  const searchInput = $('#labSearch');

  const template = (lab) => `
    <article class="hf-card">
      <div>
        <div class="list-title">${lab.name}</div>
        <div class="muted">${lab.location} • Rating ${lab.rating}</div>
        <div class="pill-row">${lab.tags.map(t => `<span class="pill">${t}</span>`).join('')}</div>
      </div>
      <div class="card-meta">${lab.price}<br>TAT ${lab.tat}</div>
    </article>
  `;

  function filtered() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    return labsCatalog.filter(l => !q || matchText(`${l.name} ${l.location} ${l.tags.join(' ')}`, q));
  }

  render('labList', filtered(), template);
  searchInput?.addEventListener('input', () => render('labList', filtered(), template));
}

function renderMedicines() {
  const medContainer = $('#medList');
  if (!medContainer) return;
  const searchInput = $('#medSearch');

  const medTemplate = (med) => `
    <article class="hf-card">
      <div>
        <div class="list-title">${med.name}</div>
        <div class="muted">${med.salt} • ${med.use}</div>
        <div class="pill-row">
          <span class="pill pill--brand">${med.price}</span>
          <span class="pill">${med.stock}</span>
          ${med.tags.map(t => `<span class="pill">${t}</span>`).join('')}
        </div>
      </div>
    </article>
  `;

  function filtered() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    return medicineCatalog.filter(m => !q || matchText(`${m.name} ${m.salt} ${m.use}`, q));
  }

  render('medList', filtered(), medTemplate);
  searchInput?.addEventListener('input', () => render('medList', filtered(), medTemplate));

  render('pharmacyList', pharmacies, (pharmacy) => `
    <article class="hf-card">
      <div class="list-title">${pharmacy.name}</div>
      <div class="muted">${pharmacy.area}</div>
      <div class="meta-row">${pharmacy.promise}</div>
      <div class="pill pill--brand">${pharmacy.contact}</div>
    </article>
  `);
}

function renderAmbulances() {
  if (!$('#ambulanceList')) return;
  render('ambulanceList', ambulances, (ride) => `
    <article class="hf-card">
      <div>
        <div class="list-title">${ride.provider}</div>
        <div class="muted">${ride.capability}</div>
      </div>
      <div class="card-meta">ETA ${ride.eta}<br>${ride.contact}</div>
    </article>
  `);
}

function renderRecords() {
  const container = $('#recordList');
  if (!container) return;
  const searchInput = $('#recordSearch');
  const template = (rec) => `
    <article class="record-item">
      <div>
        <div class="list-title">${rec.title}</div>
        <div class="muted">${rec.type}</div>
      </div>
      <div class="card-meta">${rec.date}<br><span class="pill">${rec.status}</span></div>
    </article>
  `;

  function filtered() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    return records.filter(r => !q || matchText(`${r.title} ${r.type} ${r.status}`, q));
  }

  render('recordList', filtered(), template);
  searchInput?.addEventListener('input', () => render('recordList', filtered(), template));
}

function drawSparkline(canvasId, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.clientWidth || 220;
  const height = canvas.height = 80;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = width / Math.max(values.length - 1, 1);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((val, idx) => {
    const x = idx * step;
    const norm = (val - min) / Math.max(max - min || 1, 1);
    const y = height - norm * (height - 10) - 5;
    idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function renderVitals() {
  if (!$('#hrValue')) return;
  const latestIndex = vitals.hr.length - 1;
  $('#hrValue').textContent = `${vitals.hr[latestIndex]} bpm`;
  $('#spoValue').textContent = `${vitals.spo2[latestIndex]} %`;
  $('#bpSys').textContent = vitals.bp[latestIndex][0];
  $('#bpDia').textContent = vitals.bp[latestIndex][1];
  $('#sugarValue').textContent = `${vitals.sugar[latestIndex]} mg/dL`;

  drawSparkline('hrChart', vitals.hr, '#1e6bff');
  drawSparkline('spoChart', vitals.spo2, '#30e9cf');
  drawSparkline('bpChart', vitals.bp.map(v => v[0]), '#ff6b6b');
  drawSparkline('sugarChart', vitals.sugar, '#8b5cf6');
}

function renderCopilot() {
  const chatWindow = $('#aiChat');
  const input = $('#aiInput');
  const sendBtn = $('#aiSend');
  if (!chatWindow || !input || !sendBtn) return;

  function appendMessage(role, text) {
    const row = document.createElement('div');
    row.className = `chat-row ${role}`;
    row.textContent = text;
    chatWindow.appendChild(row);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function respond(prompt) {
    const reply = prompt.toLowerCase().includes('insurance')
      ? 'Policy active. Cashless approved for planned procedure with 10% co-pay.'
      : prompt.toLowerCase().includes('medicine')
        ? 'Medicines are adherence-safe. Refill due in 5 days; shall I auto-order?'
        : 'Vitals stable. Hydration and 30-min walk suggested. Need anything else?';
    appendMessage('bot', reply);
  }

  sendBtn.addEventListener('click', () => {
    const value = input.value.trim();
    if (!value) return;
    appendMessage('user', value);
    input.value = '';
    setTimeout(() => respond(value), 280);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });
}

function markActiveFooter() {
  const links = $$('.hf-footer a');
  if (!links.length) return;
  const current = location.pathname.split('/').pop();
  links.forEach(link => {
    const target = link.getAttribute('href');
    if (target && current === target) link.classList.add('active');
  });
}

function init() {
  initTheme();
  initNav();
  initTicker();
  initPersonas();
  renderAppointments();
  renderHospitals();
  renderDoctors();
  renderLabs();
  renderMedicines();
  renderAmbulances();
  renderRecords();
  renderVitals();
  renderCopilot();
  markActiveFooter();
}

document.addEventListener('DOMContentLoaded', init);
