// ===== IUIC CGPA CALCULATOR =====
const CGPA_STORAGE_KEY = 'iuic-cgpa-calculator-v2';
const cgpaScales = {
  old: { A: 4.00, 'B+': 3.50, B: 3.00, 'C+': 2.50, C: 2.00, F: 0.00 },
  new: { A: 4.00, 'A-': 3.67, 'B+': 3.33, B: 3.00, 'B-': 2.67, 'C+': 2.33, C: 2.00, 'C-': 1.67, 'D+': 1.33, D: 1.00, F: 0.00 },
  graduate: { A: 4.00, 'A-': 3.67, 'B+': 3.33, B: 3.00, 'B-': 2.67, 'C+': 2.33, C: 2.00, F: 0.00 }
};

let semesterCount = 0;
let activeModalSem = null;
let modalStudentType = 'new';
let restoringCGPAState = false;

function showCGPAMessage(message, type = 'error') {
  const el = document.getElementById('cgpaMessage');
  if (!el) return;
  el.textContent = message;
  el.className = `form-message show ${type}`;
}

function clearCGPAMessage() {
  const el = document.getElementById('cgpaMessage');
  if (!el) return;
  el.textContent = '';
  el.className = 'form-message';
}

function setCGPASaveStatus(text = '✓ Saved on this device') {
  const el = document.getElementById('cgpaSaveStatus');
  if (el) el.textContent = text;
}

function getGPALabel(gpa) {
  if (gpa >= 3.70) return '🏆 Excellent academic standing';
  if (gpa >= 3.30) return '⭐ Very strong academic standing';
  if (gpa >= 3.00) return '👍 Good academic standing';
  if (gpa >= 2.50) return '✅ Solid academic standing';
  if (gpa >= 2.00) return '⚠️ Passing range — keep improving';
  return '❗ Low CGPA — review your academic requirements';
}

function switchStudentType(type, options = {}) {
  if (!cgpaScales[type]) return;
  modalStudentType = type;

  const map = { Old: 'old', New: 'new', Grad: 'graduate' };
  Object.entries(map).forEach(([name, value]) => {
    document.getElementById(`btn${name}`)?.classList.toggle('active-type', type === value);
  });

  const banner = document.getElementById('scaleBanner');
  if (banner) {
    if (type === 'old') {
      banner.innerHTML = '🎓 <strong>Legacy scheme (through Fall 2024):</strong> 6 grade levels — F below 60%';
      banner.style.color = '#92660a';
    } else if (type === 'graduate') {
      banner.innerHTML = '📜 <strong>Revised Graduate Scheme (Spring 2025 onwards for newly admitted students):</strong> F below 60%';
      banner.style.color = '#047857';
    } else {
      banner.innerHTML = '📌 <strong>Revised Undergraduate Scheme (Spring 2025 onwards for newly admitted students):</strong> 11 grade levels — F below 50%';
      banner.style.color = 'var(--primary)';
    }
  }

  if (!options.skipSave) saveCGPAState();
}

function addSemester(gpa = '', credits = '', options = {}) {
  const list = document.getElementById('semestersList');
  if (!list) return;

  semesterCount += 1;
  const id = semesterCount;
  const div = document.createElement('div');
  div.className = `semester-row${options.summer ? ' is-summer' : ''}`;
  div.id = `sem-${id}`;
  div.innerHTML = `
    <div class="semester-header" onclick="openSemesterModal(${id})" style="cursor:pointer;">
      <div style="display:flex; align-items:center; gap:.5rem; flex:1;">
        <span style="font-size:1.25rem;" id="icon-${id}">${options.summer ? '☀️' : '📘'}</span>
        <span class="sem-title-text" id="title-${id}" style="font-weight:800; color:var(--primary); font-size:1rem;">Semester ${id}</span>
      </div>
      <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
        <button type="button" class="summer-btn${options.summer ? ' active' : ''}" onclick="event.stopPropagation(); toggleSummer(${id})" id="summer-btn-${id}">☀️ Summer</button>
        <span class="calc-badge">Calculate Subjects ➜</span>
        <button type="button" class="btn-remove" onclick="event.stopPropagation(); removeSemester(${id})" aria-label="Remove semester">✕</button>
      </div>
    </div>
    <div class="semester-inputs">
      <div class="input-group">
        <label for="sgpa-${id}">Semester GPA</label>
        <input type="number" class="table-input" id="sgpa-${id}" min="0" max="4" step="0.01" placeholder="0.00" value="${gpa}" oninput="validateGPA(this); saveCGPAState();" />
      </div>
      <div class="input-group">
        <label for="sch-${id}">Total Credits</label>
        <input type="number" class="table-input" id="sch-${id}" min="1" max="30" step="1" placeholder="e.g. 18" value="${credits}" oninput="saveCGPAState();" />
      </div>
    </div>`;
  list.appendChild(div);
  updateSemesterLabels();
  if (!options.skipSave) saveCGPAState();
}

function validateGPA(input) {
  const value = Number.parseFloat(input.value);
  if (!Number.isFinite(value)) return;
  if (value > 4) input.value = '4.00';
  if (value < 0) input.value = '0.00';
}

function removeSemester(id) {
  const row = document.getElementById(`sem-${id}`);
  if (!row) return;
  row.style.opacity = '0';
  row.style.transform = 'translateX(12px)';
  setTimeout(() => {
    row.remove();
    updateSemesterLabels();
    saveCGPAState();
    document.getElementById('cgpaResultBox')?.classList.remove('show');
  }, 180);
}

function toggleSummer(id) {
  const row = document.getElementById(`sem-${id}`);
  const btn = document.getElementById(`summer-btn-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  if (!row || !btn || !icon) return;

  row.classList.toggle('is-summer');
  btn.classList.toggle('active');
  icon.textContent = row.classList.contains('is-summer') ? '☀️' : '📘';
  updateSemesterLabels();
  saveCGPAState();
}

function updateSemesterLabels() {
  let regularCount = 0;
  document.querySelectorAll('.semester-row').forEach(row => {
    const title = row.querySelector('.sem-title-text');
    if (!title) return;
    if (row.classList.contains('is-summer')) {
      title.textContent = 'Summer Session';
    } else {
      regularCount += 1;
      title.textContent = `Semester ${regularCount}`;
    }
  });
}

function getGradeOptions(type) {
  const grades = cgpaScales[type] || cgpaScales.new;
  return '<option value="">-- Select Grade --</option>' + Object.entries(grades)
    .map(([grade, points]) => `<option value="${points}" data-grade="${grade}">${grade} (${points.toFixed(2)})</option>`)
    .join('');
}

function openSemesterModal(id) {
  activeModalSem = id;
  const title = document.querySelector(`#sem-${id} .sem-title-text`)?.textContent || `Semester ${id}`;
  document.getElementById('modalSemTitle').textContent = `📘 ${title} — Subject Calculator`;
  document.getElementById('semesterModal').classList.add('open');
  document.getElementById('modalBody').innerHTML = '';
  for (let i = 0; i < 4; i += 1) addModalSubject();
}

function addModalSubject() {
  const tbody = document.getElementById('modalBody');
  if (!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td data-label="Subject"><input type="text" class="table-input" maxlength="80" placeholder="Subject name"></td>
    <td data-label="Credits">
      <select class="table-select m-credits">${[1,2,3,4,5,6].map(c => `<option value="${c}" ${c === 3 ? 'selected' : ''}>${c}</option>`).join('')}</select>
    </td>
    <td data-label="Grade"><select class="table-select m-grade">${getGradeOptions(modalStudentType)}</select></td>
    <td data-label="Remove"><button type="button" class="btn-remove" onclick="this.closest('tr').remove()" aria-label="Remove subject">✕</button></td>`;
  tbody.appendChild(row);
}

function applyModalGPA() {
  const rows = Array.from(document.querySelectorAll('#modalBody tr'));
  if (!rows.length) {
    showCGPAMessage('Add at least one subject in the semester calculator.');
    return;
  }

  let totalPoints = 0;
  let totalCredits = 0;
  for (const row of rows) {
    const gradeSelect = row.querySelector('.m-grade');
    const credits = Number.parseInt(row.querySelector('.m-credits')?.value, 10);
    if (!gradeSelect?.value) {
      showCGPAMessage('Select a grade for every subject before applying the semester GPA.');
      return;
    }
    const gradePoints = Number.parseFloat(gradeSelect.value);
    if (!Number.isInteger(credits) || credits < 1 || credits > 6 || !Number.isFinite(gradePoints)) {
      showCGPAMessage('Check the subject credit hours and grades.');
      return;
    }
    totalPoints += gradePoints * credits;
    totalCredits += credits;
  }

  if (totalCredits <= 0) return;
  const gpa = totalPoints / totalCredits;
  document.getElementById(`sgpa-${activeModalSem}`).value = gpa.toFixed(2);
  document.getElementById(`sch-${activeModalSem}`).value = totalCredits;
  closeModal('semesterModal');
  clearCGPAMessage();
  saveCGPAState();
}

function collectSemesterState() {
  return Array.from(document.querySelectorAll('.semester-row')).map(row => {
    const id = row.id.split('-')[1];
    return {
      gpa: document.getElementById(`sgpa-${id}`)?.value || '',
      credits: document.getElementById(`sch-${id}`)?.value || '',
      summer: row.classList.contains('is-summer')
    };
  });
}

function saveCGPAState() {
  if (restoringCGPAState) return;
  try {
    localStorage.setItem(CGPA_STORAGE_KEY, JSON.stringify({
      version: 2,
      scale: modalStudentType,
      semesters: collectSemesterState(),
      target: {
        current: document.getElementById('targetCurrentCGPA')?.value || '',
        completed: document.getElementById('targetCompletedCredits')?.value || '',
        target: document.getElementById('targetDesiredCGPA')?.value || '',
        planned: document.getElementById('targetPlannedCredits')?.value || ''
      }
    }));
    setCGPASaveStatus();
  } catch (error) {
    console.warn('Could not save CGPA state:', error);
    setCGPASaveStatus('Autosave unavailable');
  }
}

function restoreCGPAState() {
  let state = null;
  try {
    state = JSON.parse(localStorage.getItem(CGPA_STORAGE_KEY) || 'null');
  } catch (error) {
    console.warn('Could not read saved CGPA state:', error);
  }

  restoringCGPAState = true;
  document.getElementById('semestersList').innerHTML = '';
  semesterCount = 0;
  modalStudentType = state && cgpaScales[state.scale] ? state.scale : 'new';

  const semesters = Array.isArray(state?.semesters) ? state.semesters.slice(0, 20) : [];
  if (semesters.length) {
    semesters.forEach(item => addSemester(item.gpa, item.credits, { summer: Boolean(item.summer), skipSave: true }));
  } else {
    for (let i = 0; i < 3; i += 1) addSemester('', '', { skipSave: true });
  }
  switchStudentType(modalStudentType, { skipSave: true });

  const target = state?.target || {};
  const targetMap = {
    targetCurrentCGPA: target.current,
    targetCompletedCredits: target.completed,
    targetDesiredCGPA: target.target,
    targetPlannedCredits: target.planned
  };
  Object.entries(targetMap).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input && value !== undefined) input.value = value;
  });

  restoringCGPAState = false;
  saveCGPAState();
}

function calculateCGPA() {
  clearCGPAMessage();
  const rows = Array.from(document.querySelectorAll('.semester-row'));
  let totalPoints = 0;
  let totalCredits = 0;
  let count = 0;

  for (const row of rows) {
    const id = row.id.split('-')[1];
    const gpaRaw = document.getElementById(`sgpa-${id}`)?.value.trim() || '';
    const creditsRaw = document.getElementById(`sch-${id}`)?.value.trim() || '';
    if (!gpaRaw && !creditsRaw) continue;
    if (!gpaRaw || !creditsRaw) {
      showCGPAMessage('Each used semester needs both GPA and total credit hours.');
      return;
    }

    const gpa = Number.parseFloat(gpaRaw);
    const credits = Number.parseInt(creditsRaw, 10);
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
      showCGPAMessage('Semester GPA must be between 0.00 and 4.00.');
      return;
    }
    if (!Number.isInteger(credits) || credits < 1 || credits > 30) {
      showCGPAMessage('Semester credits must be a whole number between 1 and 30.');
      return;
    }

    totalPoints += gpa * credits;
    totalCredits += credits;
    count += 1;
  }

  if (!count || totalCredits <= 0) {
    showCGPAMessage('Enter at least one complete semester before calculating.');
    return;
  }

  const cgpa = totalPoints / totalCredits;
  document.getElementById('cgpaResult').textContent = cgpa.toFixed(2);
  document.getElementById('cgpaGrade').textContent = getGPALabel(cgpa);
  document.getElementById('cgpaTotalSem').textContent = count;
  document.getElementById('cgpaTotalCredits').textContent = totalCredits;
  document.getElementById('cgpaTotalPoints').textContent = totalPoints.toFixed(2);
  document.getElementById('cgpaResultBox').classList.add('show');
  showCGPAMessage('CGPA calculated successfully.', 'success');

  const current = document.getElementById('targetCurrentCGPA');
  const completed = document.getElementById('targetCompletedCredits');
  if (current) current.value = cgpa.toFixed(2);
  if (completed) completed.value = totalCredits;
  saveCGPAState();
  document.getElementById('cgpaResultBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function calculateTargetCGPA() {
  const result = document.getElementById('targetResult');
  const current = Number.parseFloat(document.getElementById('targetCurrentCGPA')?.value);
  const completed = Number.parseInt(document.getElementById('targetCompletedCredits')?.value, 10);
  const desired = Number.parseFloat(document.getElementById('targetDesiredCGPA')?.value);
  const planned = Number.parseInt(document.getElementById('targetPlannedCredits')?.value, 10);

  if (!result) return;
  result.className = 'target-result';

  if (![current, desired].every(v => Number.isFinite(v) && v >= 0 && v <= 4) ||
      !Number.isInteger(completed) || completed < 1 || !Number.isInteger(planned) || planned < 1) {
    result.textContent = 'Enter valid CGPAs (0–4) and positive whole-number credit hours.';
    result.classList.add('show', 'error');
    return;
  }

  const required = (desired * (completed + planned) - current * completed) / planned;
  if (required > 4) {
    result.textContent = `Target ${desired.toFixed(2)} is not reachable in the next ${planned} credits alone (required GPA: ${required.toFixed(2)}).`;
    result.classList.add('show', 'error');
  } else if (required <= 0) {
    result.textContent = `Your target ${desired.toFixed(2)} is already secured for this credit plan.`;
    result.classList.add('show', 'success');
  } else {
    result.textContent = `You need about ${required.toFixed(2)} GPA across the next ${planned} credits to reach ${desired.toFixed(2)} CGPA.`;
    result.classList.add('show', required >= 3.5 ? 'warning' : 'success');
  }
  saveCGPAState();
}

function fillTargetFromCGPA() {
  const cgpa = document.getElementById('cgpaResult')?.textContent;
  const credits = document.getElementById('cgpaTotalCredits')?.textContent;
  if (!cgpa || cgpa === '0.00' || !credits || credits === '0') {
    showCGPAMessage('Calculate your CGPA first, then use it in the target planner.', 'info');
    return;
  }
  document.getElementById('targetCurrentCGPA').value = cgpa;
  document.getElementById('targetCompletedCredits').value = credits;
  saveCGPAState();
}

function resetCGPA() {
  restoringCGPAState = true;
  document.getElementById('semestersList').innerHTML = '';
  semesterCount = 0;
  modalStudentType = 'new';
  for (let i = 0; i < 3; i += 1) addSemester('', '', { skipSave: true });
  switchStudentType('new', { skipSave: true });
  document.getElementById('cgpaResultBox')?.classList.remove('show');
  ['targetCurrentCGPA','targetCompletedCredits','targetDesiredCGPA','targetPlannedCredits'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  const targetResult = document.getElementById('targetResult');
  if (targetResult) targetResult.className = 'target-result';
  clearCGPAMessage();
  restoringCGPAState = false;
  localStorage.removeItem(CGPA_STORAGE_KEY);
  saveCGPAState();
  showCGPAMessage('CGPA calculator reset. A fresh draft has been saved.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('semestersList')) restoreCGPAState();
});
