/* ─────────────────────────────────────────
   QUESTION BANK BUILDER — app.js
   ───────────────────────────────────────── */

/* ── State ── */
let questions = [];       // array of question objects
let questionCounter = 0;  // used to generate unique IDs like q001, q002 …

/* ─────────────────────────────────────────
   INIT — wire up all buttons + live inputs
   ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Metadata inputs — update JSON on every keystroke / change
  document.getElementById('meta-class').addEventListener('change', updateJSON);
  document.getElementById('meta-subject').addEventListener('input', updateJSON);
  document.getElementById('meta-chapter-num').addEventListener('input', updateJSON);
  document.getElementById('meta-chapter-name').addEventListener('input', updateJSON);

  // Buttons
  document.getElementById('btn-add').addEventListener('click', () => addQuestion());
  document.getElementById('btn-clear').addEventListener('click', clearAll);
  document.getElementById('btn-copy-bottom').addEventListener('click', copyJSON);
  document.getElementById('btn-copy-top').addEventListener('click', copyJSON);
  document.getElementById('btn-export-txt').addEventListener('click', exportTXT);

  // Start with 2 blank question cards so the page feels ready
  addQuestion();
  addQuestion();
});

/* ─────────────────────────────────────────
   ADD A NEW QUESTION
   Pass a data object to pre-fill (used when
   loading existing JSON in future).
   ───────────────────────────────────────── */
function addQuestion(data = null) {
  questionCounter++;

  // Auto-generate a padded ID: q001, q002 …
  const id = 'q' + String(questionCounter).padStart(3, '0');

  const q = {
    id,
    text: data?.text || '',
    options: data?.options || ['', '', '', ''],
    correctOption: data?.correctOption ?? -1  // -1 means no answer selected yet
  };

  questions.push(q);
  renderQuestions();
  updateJSON();

  // Scroll to the new card and focus the question input
  setTimeout(() => {
    const cards = document.querySelectorAll('.q-card');
    const last = cards[cards.length - 1];
    if (last) {
      last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      last.querySelector('input').focus();
    }
  }, 50);
}

/* ─────────────────────────────────────────
   REMOVE A QUESTION by index
   ───────────────────────────────────────── */
function removeQuestion(idx) {
  questions.splice(idx, 1);
  renderQuestions();
  updateJSON();
}

/* ─────────────────────────────────────────
   SET CORRECT ANSWER
   qIdx = question index, optIdx = 0–3 (A–D)
   ───────────────────────────────────────── */
function setCorrect(qIdx, optIdx) {
  questions[qIdx].correctOption = optIdx;
  renderQuestions();   // re-render so the green circle updates
  updateJSON();
}

/* ─────────────────────────────────────────
   CLEAR ALL QUESTIONS
   ───────────────────────────────────────── */
function clearAll() {
  if (questions.length === 0) return;
  if (!confirm('Clear all questions? This cannot be undone.')) return;

  questions = [];
  questionCounter = 0;
  renderQuestions();
  updateJSON();
}

/* ─────────────────────────────────────────
   RENDER — rebuild the question card list
   from the questions[] array
   ───────────────────────────────────────── */
function renderQuestions() {
  const container = document.getElementById('questions-list');
  container.innerHTML = '';   // clear existing cards

  questions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'q-card';

    card.innerHTML = `
      <!-- Question header: number badge + text input + delete -->
      <div class="q-card-header">
        <div class="q-num">${i + 1}</div>
        <input
          type="text"
          placeholder="Type your question here…"
          value="${escHtml(q.text)}"
          oninput="questions[${i}].text = this.value; updateJSON()"
          onfocus="this.closest('.q-card').classList.add('active')"
          onblur="this.closest('.q-card').classList.remove('active')"
        />
        <button class="del-btn" onclick="removeQuestion(${i})" title="Delete question">×</button>
      </div>

      <!-- Options grid: A B C D -->
      <div class="options-grid">
        ${['A', 'B', 'C', 'D'].map((letter, j) => `
          <div class="option-row">

            <!-- Circle badge — click to mark as correct answer -->
            <div
              class="opt-label ${q.correctOption === j ? 'correct' : ''}"
              onclick="setCorrect(${i}, ${j})"
              title="Mark as correct answer"
            >${letter}</div>

            <!-- Option text input -->
            <input
              type="text"
              placeholder="Option ${letter}"
              value="${escHtml(q.options[j] || '')}"
              class="${q.correctOption === j ? 'correct-opt' : ''}"
              oninput="questions[${i}].options[${j}] = this.value; updateJSON()"
              onfocus="this.closest('.q-card').classList.add('active')"
              onblur="this.closest('.q-card').classList.remove('active')"
            />
          </div>
        `).join('')}
      </div>
    `;

    container.appendChild(card);
  });
}

/* ─────────────────────────────────────────
   BUILD DATA OBJECT
   Reads all form fields and questions[]
   and returns the final JSON structure.
   ───────────────────────────────────────── */
function buildData() {
  return {
    class: document.getElementById('meta-class').value || '',
    subject: document.getElementById('meta-subject').value || '',
    chapters: [
      {
        chapterNumber: parseInt(document.getElementById('meta-chapter-num').value) || 0,
        chapterName: document.getElementById('meta-chapter-name').value || '',
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctOption: q.correctOption   // 0=A, 1=B, 2=C, 3=D, -1=none
        }))
      }
    ]
  };
}

/* ─────────────────────────────────────────
   UPDATE JSON PANEL
   Called on every form change.
   ───────────────────────────────────────── */
function updateJSON() {
  const data = buildData();
  const out  = document.getElementById('json-out');

  // Count fully-complete questions (text + all 4 options + correct answer)
  const complete = questions.filter(q =>
    q.text.trim() &&
    q.options.every(o => o.trim()) &&
    q.correctOption >= 0
  ).length;

  document.getElementById('stat-q').textContent = questions.length;
  document.getElementById('stat-c').textContent = complete;

  // Show empty state when nothing has been entered yet
  if (questions.length === 0 && !data.class && !data.subject) {
    out.innerHTML = `
      <div class="empty-state">
        <div class="big">{ }</div>
        <div>Fill in the form on the left<br/>JSON appears here instantly</div>
      </div>`;
    return;
  }

  // Render syntax-highlighted JSON
  const raw = JSON.stringify(data, null, 2);
  out.innerHTML = syntaxHighlight(raw);
}

/* ─────────────────────────────────────────
   COPY JSON TO CLIPBOARD
   ───────────────────────────────────────── */
function copyJSON() {
  const data = buildData();
  const raw  = JSON.stringify(data, null, 2);

  navigator.clipboard.writeText(raw).then(() => {
    showToast('Copied to clipboard!');

    // Update copy button text temporarily
    const btn = document.getElementById('btn-copy-top');
    btn.textContent = '✓ copied';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

/* ─────────────────────────────────────────
   SHOW TOAST — shared helper
   ───────────────────────────────────────── */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ─────────────────────────────────────────
   EXPORT AS .TXT FILE
   Builds a filename from class + subject +
   chapter, then triggers a browser download.
   ───────────────────────────────────────── */
function exportTXT() {
  const data = buildData();
  const raw  = JSON.stringify(data, null, 2);

  // Build a meaningful filename  e.g. class5_Mathematics_ch1.txt
  const cls     = data.class   ? 'class' + data.class          : 'class_unknown';
  const subject = data.subject ? data.subject.replace(/\s+/g, '_') : 'subject_unknown';
  const chNum   = data.chapters[0]?.chapterNumber || 0;
  const filename = `${cls}_${subject}_ch${chNum}.txt`;

  // Create a temporary invisible <a> and click it to trigger download
  const blob = new Blob([raw], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show toast
  showToast('Exported as ' + filename);
}

/* ─────────────────────────────────────────
   SYNTAX HIGHLIGHT
   Wraps JSON token types in <span> tags
   so CSS can colour them.
   ───────────────────────────────────────── */
function syntaxHighlight(json) {
  // First escape HTML special chars so < > & don't break the DOM
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Then wrap each token type in a coloured span
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      if (/^"/.test(match)) {
        // Key  → ends with a colon after the closing quote
        if (/:$/.test(match)) return `<span class="j-key">${match}</span>`;
        // String value
        return `<span class="j-str">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="j-bool">${match}</span>`;
      if (/null/.test(match))       return `<span class="j-null">${match}</span>`;
      // Number
      return `<span class="j-num">${match}</span>`;
    }
  )
  // Colour braces and brackets
  .replace(/[{}\[\]]/g, m => `<span class="j-brace">${m}</span>`);
}

/* ─────────────────────────────────────────
   UTILITY — escape HTML for safe innerHTML
   ───────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/"/g,  '&quot;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}