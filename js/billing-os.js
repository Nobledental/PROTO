// HealthFlo Billing OS interactions and calculations
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
$('#navToggle')?.addEventListener('click', () => document.body.classList.toggle('nav-open'));

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

// Helpers
const formatINR = (num) => `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const toNumber = (val, fallback = 0) => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
};

// Billing data
const state = {
  hospitalCharges: [
    { name: 'OPD Consultation', qty: 1, rate: 800, gst: 0 },
    { name: 'IPD Nursing Charges', qty: 2, rate: 1200, gst: 12 },
    { name: 'Procedure — Laparoscopy', qty: 1, rate: 18000, gst: 12 },
    { name: 'Consumables — Sterile Pack', qty: 4, rate: 450, gst: 5, nonPayable: true },
    { name: 'Anaesthetist Fee', qty: 1, rate: 4200, gst: 18 },
    { name: 'Doctor Visit — Specialist', qty: 2, rate: 1500, gst: 0 }
  ],
  pharmacyCatalog: [
    { name: 'Inj. Ceftriaxone 1g', mrp: 190, gst: 12, batch: 'CFT23B', inclusive: true },
    { name: 'Tab. Metformin 500mg', mrp: 45, gst: 5, batch: 'MET15D', inclusive: true },
    { name: 'Insulin Glargine Pen', mrp: 890, gst: 12, batch: 'INS34F', inclusive: true, cold: true },
    { name: 'ORS 200ml', mrp: 28, gst: 12, batch: 'ORS09Q', inclusive: true },
    { name: 'Syringe 5ml', mrp: 12, gst: 12, batch: 'SYR12K', inclusive: true, nonPayable: true }
  ],
  pharmacyBasket: [
    { name: 'Inj. Ceftriaxone 1g', qty: 2, mrp: 190, gst: 12, inclusive: true },
    { name: 'Insulin Glargine Pen', qty: 1, mrp: 890, gst: 12, inclusive: true, cold: true },
    { name: 'Syringe 5ml', qty: 5, mrp: 12, gst: 12, inclusive: true, nonPayable: true }
  ],
  labCharges: [
    { name: 'CBC + CRP Panel', qty: 1, rate: 950, gst: 12 },
    { name: 'MRI Brain with Contrast', qty: 1, rate: 8500, gst: 18 },
    { name: 'Sample Collection Fee', qty: 1, rate: 200, gst: 0 },
    { name: 'Corporate Pricing Adjustment', qty: 1, rate: -500, gst: 0 }
  ],
  consultCharges: [
    { name: 'Consultation — Cardiologist', qty: 1, rate: 1200, gst: 0 },
    { name: 'OT Block — 2 hours', qty: 2, rate: 5500, gst: 18 },
    { name: 'Anaesthesia Charges', qty: 1, rate: 3200, gst: 18 },
    { name: 'Implant — Stent', qty: 1, rate: 42000, gst: 12, nonPayable: true }
  ],
  packages: [
    {
      name: 'C-Section Package', price: 82000, gst: 0,
      inclusions: ['OT charges up to 90 mins', 'Anaesthesia', 'Consumables (standard)', 'Nursing & room up to 3 days'],
      exclusions: ['High-cost implants', 'NICU charges', 'Special drugs']
    },
    {
      name: 'Knee Replacement', price: 158000, gst: 0,
      inclusions: ['OT up to 3 hours', 'Implant base model', 'Post-op physio (3 sessions)', 'Consumables standard'],
      exclusions: ['Premium implants', 'ICU stay', 'Blood products']
    },
    {
      name: 'CABG Bundle', price: 210000, gst: 0,
      inclusions: ['CVTS OT charges', 'Anaesthesia', 'Bypass disposables', '3 days ICU + 3 days ward'],
      exclusions: ['High-end stents', 'Extra ICU days', 'Blood components']
    }
  ],
  selectedPackage: null,
  packageVariance: 12000
};
state.selectedPackage = state.packages[0];

// Date defaults
const admitInput = $('#admitTime');
const dischargeInput = $('#dischargeTime');
if (admitInput && dischargeInput) {
  const now = new Date();
  const admit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const discharge = new Date(now.getTime() + 30 * 60 * 60 * 1000);
  admitInput.value = admit.toISOString().slice(0, 16);
  dischargeInput.value = discharge.toISOString().slice(0, 16);
}

// Rendering helpers
function renderChargeRows(containerId, charges) {
  const tbody = document.getElementById(containerId);
  if (!tbody) return;
  tbody.innerHTML = charges.map(item => {
    const qty = item.qty ?? 1;
    const rate = item.rate ?? item.mrp ?? 0;
    const total = qty * rate;
    return `
      <tr>
        <td>${item.name}${item.nonPayable ? ' <span class="tag">Non-payable</span>' : ''}${item.inclusive ? ' <span class="tag">GST incl.</span>' : ''}</td>
        <td>${qty}</td>
        <td>${formatINR(rate)}</td>
        <td>${item.gst}%</td>
        <td>${formatINR(total)}</td>
      </tr>
    `;
  }).join('');
}

function renderPharmacyList() {
  const list = $('#pharmacyList');
  const query = $('#pharmacySearch')?.value?.toLowerCase() || '';
  if (!list) return;
  const rows = state.pharmacyCatalog
    .filter(item => item.name.toLowerCase().includes(query) || item.batch.toLowerCase().includes(query))
    .map(item => `
      <div class="list-row">
        <div>
          <strong>${item.name}</strong>
          <small>Batch ${item.batch} • MRP ${formatINR(item.mrp)} • GST ${item.gst}%${item.cold ? ' • Cold-chain' : ''}</small>
        </div>
        <button data-add-pharm="${item.name}">Add</button>
      </div>
    `).join('');
  list.innerHTML = rows || '<div class="muted">No matches</div>';
}

function renderPharmacyBasket() {
  renderChargeRows('pharmacyRows', state.pharmacyBasket);
}

function renderLab() {
  renderChargeRows('labRows', state.labCharges);
  const list = $('#labList');
  if (list) {
    list.innerHTML = state.labCharges.map(item => `<div class="list-row"><div><strong>${item.name}</strong><small>₹${item.rate} • GST ${item.gst}%</small></div><span>${item.qty}x</span></div>`).join('');
  }
}

function renderConsult() {
  renderChargeRows('consultRows', state.consultCharges);
  const list = $('#consultList');
  if (list) {
    list.innerHTML = state.consultCharges.map(item => `<div class="list-row"><div><strong>${item.name}</strong><small>${item.nonPayable ? 'Non-payable • ' : ''}GST ${item.gst}%</small></div><span>${formatINR(item.rate)}</span></div>`).join('');
  }
}

function renderPackageSection() {
  const list = $('#packageList');
  if (list) {
    list.innerHTML = state.packages.map((pkg, i) => `
      <div class="list-row">
        <div>
          <strong>${pkg.name}</strong>
          <small>${formatINR(pkg.price)} • Includes: ${pkg.inclusions.slice(0, 2).join(', ')}...</small>
        </div>
        <button data-package="${i}">${state.selectedPackage === pkg ? 'Selected' : 'Apply'}</button>
      </div>
    `).join('');
  }
  const details = $('#packageDetails');
  if (details && state.selectedPackage) {
    details.innerHTML = `
      <li><strong>Inclusions:</strong> ${state.selectedPackage.inclusions.join(', ')}</li>
      <li><strong>Exclusions:</strong> ${state.selectedPackage.exclusions.join(', ')}</li>
      <li><strong>Variance captured:</strong> ${formatINR(state.packageVariance)}</li>
    `;
  }
  $('#packagePrice').textContent = formatINR(state.selectedPackage?.price || 0);
  $('#packageVariance').textContent = formatINR(state.packageVariance);
  const finalVal = (state.selectedPackage?.price || 0) + state.packageVariance;
  $('#packageFinal').textContent = formatINR(finalVal);
}

renderChargeRows('hospitalChargeRows', state.hospitalCharges);
renderPharmacyList();
renderPharmacyBasket();
renderLab();
renderConsult();
renderPackageSection();

$('#pharmacySearch')?.addEventListener('input', renderPharmacyList);
$('#pharmacyList')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-add-pharm]');
  if (!btn) return;
  const name = btn.dataset.addPharm;
  const item = state.pharmacyCatalog.find(p => p.name === name);
  if (!item) return;
  const existing = state.pharmacyBasket.find(p => p.name === name);
  if (existing) existing.qty += 1;
  else state.pharmacyBasket.push({ ...item, qty: 1 });
  renderPharmacyBasket();
  computeTotals();
});

$('#packageList')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-package]');
  if (!btn) return;
  const pkg = state.packages[parseInt(btn.dataset.package, 10)];
  if (!pkg) return;
  state.selectedPackage = pkg;
  renderPackageSection();
  computeTotals();
});

// Billing math
function computeLine(item) {
  const qty = item.qty ?? 1;
  const rate = item.rate ?? item.mrp ?? 0;
  const gst = item.gst ?? 0;
  let base = rate * qty;
  let gstAmount = base * gst / 100;
  if (item.inclusive) {
    base = (rate / (1 + gst / 100)) * qty;
    gstAmount = base * gst / 100;
  }
  const total = base + gstAmount;
  return { base, gst: gstAmount, total, nonPayable: item.nonPayable ? total : 0 };
}

function computeRoomRent() {
  const rate = toNumber($('#roomRate')?.value, 0);
  const type = $('#roomType')?.value || 'General';
  const admit = new Date($('#admitTime')?.value);
  const discharge = new Date($('#dischargeTime')?.value);
  const multiplier = { General: 1, Semi: 1.15, Private: 1.35, ICU: 2 }[type] || 1;
  const diffMs = Math.max(0, discharge - admit);
  const hours = diffMs / (1000 * 60 * 60);
  const base = (hours / 24) * rate * multiplier;
  const gst = base * 0.12;
  return { hours, base, gst, total: base + gst };
}

function aggregateTotals(list) {
  return list.reduce((acc, item) => {
    const line = computeLine(item);
    acc.base += line.base;
    acc.gst += line.gst;
    acc.total += line.total;
    acc.nonPayable += line.nonPayable;
    return acc;
  }, { base: 0, gst: 0, total: 0, nonPayable: 0 });
}

function computeTotals() {
  const hospitalTotals = aggregateTotals(state.hospitalCharges);
  const pharmacyTotals = aggregateTotals(state.pharmacyBasket);
  const labTotals = aggregateTotals(state.labCharges);
  const consultTotals = aggregateTotals(state.consultCharges);
  const packagePrice = computeLine({ rate: state.selectedPackage?.price || 0, qty: 1, gst: state.selectedPackage?.gst || 0, inclusive: true });
  const packageVariance = computeLine({ rate: state.packageVariance, qty: 1, gst: 0 });
  const room = computeRoomRent();

  const grossBase = hospitalTotals.base + pharmacyTotals.base + labTotals.base + consultTotals.base + packagePrice.base + packageVariance.base + room.base;
  const gst = hospitalTotals.gst + pharmacyTotals.gst + labTotals.gst + consultTotals.gst + packagePrice.gst + packageVariance.gst + room.gst;
  const grossTotal = grossBase + gst;
  const nonPayables = hospitalTotals.nonPayable + pharmacyTotals.nonPayable + consultTotals.nonPayable + toNumber($('#nonPayable')?.value, 0);

  const discountPct = toNumber($('#discountPct')?.value, 0);
  const discount = grossTotal * (discountPct / 100);
  const afterDiscount = grossTotal - discount;

  const deductible = toNumber($('#deductible')?.value, 0);
  const coveragePct = toNumber($('#coveragePct')?.value, 0) / 100;
  const insuranceEligible = Math.max(0, afterDiscount - nonPayables - deductible);
  const insuranceShare = insuranceEligible * coveragePct;

  const advances = toNumber($('#advanceInput')?.value, 0);
  const payments = toNumber($('#cashPay')?.value, 0) + toNumber($('#cardPay')?.value, 0) + toNumber($('#upiPay')?.value, 0);

  const patientPay = Math.max(0, afterDiscount - insuranceShare - advances);
  const outstanding = Math.max(0, patientPay - payments);
  const netBeforeRound = Math.max(0, afterDiscount - insuranceShare - advances - payments);
  const rounded = Math.round(netBeforeRound);
  const roundOff = rounded - netBeforeRound;

  $('#stayHours').textContent = `${Math.round(room.hours)}h`;
  $('#roomRentValue').textContent = formatINR(room.total);
  $('#advanceValue').textContent = formatINR(advances);

  $('#hospitalTotals').textContent = `Subtotal ${formatINR(hospitalTotals.total)} • GST ${formatINR(hospitalTotals.gst)} • Non-payable ${formatINR(hospitalTotals.nonPayable)}`;
  $('#pharmacyTotals').textContent = `Subtotal ${formatINR(pharmacyTotals.total)} • GST ${formatINR(pharmacyTotals.gst)} • Non-payable ${formatINR(pharmacyTotals.nonPayable)}`;
  $('#labTotals').textContent = `Subtotal ${formatINR(labTotals.total)} • GST ${formatINR(labTotals.gst)}`;
  $('#consultTotals').textContent = `Subtotal ${formatINR(consultTotals.total)} • GST ${formatINR(consultTotals.gst)} • Non-payable ${formatINR(consultTotals.nonPayable)}`;

  $('#grossAmount').textContent = formatINR(grossBase);
  $('#gstAmount').textContent = formatINR(gst);
  $('#discountAmount').textContent = `- ${formatINR(discount)}`;
  $('#insuranceAmount').textContent = `- ${formatINR(insuranceShare)}`;
  $('#patientPay').textContent = formatINR(patientPay);
  $('#outstanding').textContent = formatINR(outstanding);
  $('#roundOff').textContent = formatINR(roundOff);
  $('#netPayable').textContent = formatINR(Math.max(0, rounded));

  $('#unbilledValue').textContent = formatINR(hospitalTotals.total + room.total);
  $('#cashlessValue').textContent = formatINR(insuranceShare);
  $('#pharmacyValue').textContent = formatINR(pharmacyTotals.total);
  $('#roundOffValue').textContent = formatINR(roundOff);

  const aiPulse = $('#aiPulse');
  if (aiPulse) aiPulse.textContent = `AI: Non-payables ₹${nonPayables.toLocaleString('en-IN')} • Insurance covers ₹${Math.round(insuranceShare).toLocaleString('en-IN')}.`;
  const paymentInsight = $('#paymentInsight');
  if (paymentInsight) paymentInsight.textContent = `AI: Collect ${formatINR(rounded)} (${coveragePct * 100}% insurer, balance patient). Round-off ${roundOff >= 0 ? 'added' : 'waived'}.`;
}

computeTotals();

['admitTime', 'dischargeTime', 'roomRate', 'roomType', 'discountPct', 'coveragePct', 'nonPayable', 'deductible', 'advanceInput', 'cashPay', 'cardPay', 'upiPay']
  .forEach(id => {
    document.getElementById(id)?.addEventListener('input', computeTotals);
    document.getElementById(id)?.addEventListener('change', computeTotals);
  });
$('#recalcBtn')?.addEventListener('click', computeTotals);

// Copilot chat
const copilotFab = $('#copilotFab');
const copilotPanel = $('#copilotPanel');
const openCopilot = $('#openCopilot');
const closeCopilot = $('#closeCopilot');
const copilotMessages = $('#copilotMessages');
const copilotInput = $('#copilotInput');
const sendCopilot = $('#sendCopilot');

function toggleCopilot(open = true) {
  copilotPanel?.classList.toggle('hidden', !open);
  if (open) copilotInput?.focus();
}
function appendBubble(text, role = 'ai') {
  const bubble = document.createElement('div');
  bubble.className = role === 'ai' ? 'bubble' : 'user-bubble';
  bubble.textContent = text;
  copilotMessages?.appendChild(bubble);
  copilotMessages?.scrollTo({ top: copilotMessages.scrollHeight, behavior: 'smooth' });
}
function sendCopilotMessage() {
  const msg = copilotInput?.value.trim();
  if (!msg) return;
  appendBubble(msg, 'user');
  copilotInput.value = '';
  setTimeout(() => {
    appendBubble('Noted. I’ll recalc GST, mark non-payables, and send insurer split for approval. Want me to block discharge till payment is cleared?');
  }, 400);
}

copilotFab?.addEventListener('click', () => toggleCopilot(true));
openCopilot?.addEventListener('click', () => toggleCopilot(true));
closeCopilot?.addEventListener('click', () => toggleCopilot(false));
sendCopilot?.addEventListener('click', sendCopilotMessage);
copilotInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendCopilotMessage(); });

// CTA routing
$$('[data-cta]').forEach(btn => {
  btn.addEventListener('click', () => {
    appendBubble(`Action queued: ${btn.dataset.cta}. I’ll reflect it in totals and update the claim checklist.`);
    toggleCopilot(true);
  });
});

// Smooth scroll + active dock
const sections = ['top', 'hospitalBilling', 'pharmacyBilling', 'labBilling', 'consultantBilling', 'packageBilling', 'payments'];
const dockItems = $$('.hf-dock .dock-item');
const navLinks = $$('#primaryNav a');
function setActive(id) {
  dockItems.forEach(item => {
    const href = item.getAttribute('href');
    item.classList.toggle('active', href && href.includes(id));
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href && href.includes(id));
  });
}
window.addEventListener('scroll', () => {
  let active = 'top';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) active = id;
  });
  setActive(active);
});

$$('.hf-dock a[href^="#"], #primaryNav a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
