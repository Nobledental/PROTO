/* ============================================================
   HealthFlo — Main JS Engine
   Applies to all 14 screens
============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* THEME TOGGLE ============================================= */
const themeToggle = $('#themeToggle');
if (themeToggle) {
  themeToggle.onclick = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('hfTheme', next);
  };
}

const savedTheme = localStorage.getItem('hfTheme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

/* SEARCH FILTERS =========================================== */
const recordSearch = $('#recordSearch');
const recordList = $('#recordList');

if (recordSearch && recordList) {
  recordSearch.addEventListener('input', () => {
    const q = recordSearch.value.toLowerCase();
    $$('.record-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q)
        ? 'flex'
        : 'none';
    });
  });
}

/* CHIP FILTERS ============================================= */
const chips = $$('.hf-chip');
if (chips.length) {
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const f = chip.dataset.filter;

      $$('.record-item').forEach(row => {
        if (f === 'all' || row.dataset.type === f) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
}

/* RECORD LIST BUILD ======================================== */
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

/* AI COPILOT SIMULATION ==================================== */
const aiInput = $('#aiInput');
const aiSend = $('#aiSend');
const aiChat = $('#aiChat');

if (aiInput && aiSend && aiChat) {

  function appendAI(text) {
    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    bubble.textContent = text;
    aiChat.append(bubble);
    aiChat.scrollTo({ top: aiChat.scrollHeight, behavior: 'smooth' });
  }

  function appendUser(text) {
    const bubble = document.createElement('div');
    bubble.className = 'user-bubble';
    bubble.textContent = text;
    aiChat.append(bubble);
    aiChat.scrollTo({ top: aiChat.scrollHeight, behavior: 'smooth' });
  }

  aiSend.onclick = () => {
    const msg = aiInput.value.trim();
    if (!msg) return;

    appendUser(msg);
    aiInput.value = '';

    setTimeout(() => {
      appendAI("Here’s what I found 🤖\n" +
        "• Your vitals look stable\n" +
        "• No red flags\n" +
        "• Medicines are safe to take\n" +
        "• Let me know if you want appointment booking");
    }, 700);
  };
}

/* VITALS SIMULATOR ========================================= */
if ($('#vitalsGraph')) {
  const vg = $('#vitalsGraph');
  setInterval(() => {
    vg.textContent = "❤️ Heart Rate: " + (70 + Math.floor(Math.random() * 12));
  }, 1500);
}

/* END OF FILE */
