/* ============================================================
   HealthFlo — Patient OS (VOKA Ceramic White)
   Global JS for All Pages
   - Live Vitals Simulation
   - AI Copilot Insights
   - Interaction Effects
   ============================================================ */

/* Helper */
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

/* ============================================================
   DARK MODE TOGGLE
   ============================================================ */

qsa(".hf-icon-btn").forEach((el) => {
  el.addEventListener("click", () => {
    const root = document.documentElement;
    const theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", theme);
  });
});

/* ============================================================
   RIPPLE EFFECT FOR TILES & BUTTONS
   ============================================================ */

function addRipple(el) {
  el.addEventListener("click", function (e) {
    const r = document.createElement("span");
    r.classList.add("ripple");

    const size = Math.max(el.clientWidth, el.clientHeight);
    r.style.width = r.style.height = `${size}px`;

    const rect = el.getBoundingClientRect();
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;

    el.appendChild(r);

    setTimeout(() => r.remove(), 600);
  });
}

qsa(".hf-tile, .btn-mini, .btn-link, .hf-icon-btn").forEach(addRipple);

/* ============================================================
   LIVE VITALS SIMULATION
   ============================================================ */

const vitals = {
  hr: qs("#vt-hr .vital-value"),
  spo2: qs("#vt-spo2 .vital-value"),
  bp: qs("#vt-bp .vital-value"),
  rr: qs("#vt-rr .vital-value"),
  sugar: qs("#vt-sugar .vital-value"),
  temp: qs("#vt-temp .vital-value"),
};

function simulateVitals() {
  if (!vitals.hr) return; // only on dashboard

  vitals.hr.textContent = rand(68, 98);            // Heart rate
  vitals.spo2.textContent = rand(95, 100) + "%";   // SpO2
  vitals.bp.textContent = rand(110, 130) + "/" + rand(70, 85);
  vitals.rr.textContent = rand(14, 20);            // Resp rate
  vitals.sugar.textContent = rand(85, 140);        // CGM sugar
  vitals.temp.textContent = (rand(36, 37) + Math.random()).toFixed(1) + "°C";

  requestAnimationFrame(() => {
    setTimeout(simulateVitals, 2000);
  });
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

simulateVitals();

/* ============================================================
   AI COPILOT — FEED ENGINE
   ============================================================ */

const aiFeed = qs("#ai-feed");

if (aiFeed) {
  const insights = [
    "Your heart rate is stable within healthy limits.",
    "Hydration level recommendation: drink 250ml water now.",
    "Your blood pressure trend is normal compared to last week.",
    "No abnormal patterns detected in your vitals today.",
    "AI suggests adding a 20-minute walk to improve circulation.",
    "Breathing rate remains steady and healthy.",
    "Sugar levels show a mild fluctuation — within normal range.",
    "Consider scheduling a routine blood test next month.",
    "No emergency indicators detected in the last 24 hours.",
    "Insurance coverage: Your last claim had 94% approval."
  ];

  function pushAI() {
    const msg = insights[Math.floor(Math.random() * insights.length)];

    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    bubble.textContent = msg;

    aiFeed.prepend(bubble);

    // limit to 6 bubbles
    if (aiFeed.children.length > 6) {
      aiFeed.removeChild(aiFeed.lastChild);
    }

    setTimeout(pushAI, rand(4000, 9000));
  }

  pushAI();
}

/* ============================================================
   PAGE-SPECIFIC PLACEHOLDERS (SAFE TO IGNORE IF NOT PRESENT)
   ============================================================ */

function pageExists(selector) {
  return document.querySelector(selector) !== null;
}

/* Example: Appointments page dynamic loader */
if (pageExists("#appt-list")) {
  qs("#appt-list").innerHTML = `
    <div class="ap-item">
      <div>
        <strong>Dr. Shiva — Orthopedic</strong>
        <p class="muted">Apollo Hospital • Wed 4:30 PM</p>
      </div>
      <button class="btn-mini">View</button>
    </div>
  `;
}

/* Example: Hospitals search */
if (pageExists("#hospital-list")) {
  qs("#hospital-list").innerHTML = `
    <div class="hf-card">
      <strong>Fortis Hospital</strong>
      <p class="muted">NABH Accredited • 4.8 ★</p>
    </div>
  `;
}

/* ============================================================
   END OF FILE
   ============================================================ */
