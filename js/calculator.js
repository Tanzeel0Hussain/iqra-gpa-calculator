// ===== IUIC GPA CALCULATOR =====
// Grade points are aligned with Iqra University handbooks for the legacy
// (through Fall 2024) and revised Spring 2025 schemes.
const gradingScales = {
  old: { A: 4.00, 'B+': 3.50, B: 3.00, 'C+': 2.50, C: 2.00, F: 0.00 },
  new: { A: 4.00, 'A-': 3.67, 'B+': 3.33, B: 3.00, 'B-': 2.67, 'C+': 2.33, C: 2.00, 'C-': 1.67, 'D+': 1.33, D: 1.00, F: 0.00 },
  graduate: { A: 4.00, 'A-': 3.67, 'B+': 3.33, B: 3.00, 'B-': 2.67, 'C+': 2.33, C: 2.00, F: 0.00 }
};

const GPA_STORAGE_KEY = 'iuic-gpa-calculator-v2';
let subjectCount = 0;
let currentScale = 'new';
let restoringState = false;

function escapeAttribute(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function showCalculatorMessage(message, type = 'error') {
  const el = document.getElementById('calculatorMessage');
  if (!el) return;
  el.textContent = message;
  el.className = `form-message show ${type}`;
}

function clearCalculatorMessage() {
  const el = document.getElementById('calculatorMessage');
  if (!el) return;
  el.textContent = '';
  el.className = 'form-message';
}

function setSaveStatus(text = 'Saved on this device') {
  const el = document.getElementById('saveStatus');
  if (el) el.textContent = text;
}

function switchStudentType(type, options = {}) {
  if (!gradingScales[type]) return;
  currentScale = type;

  ['Old', 'New', 'Grad'].forEach(name => {
    const el = document.getElementById(`btn${name}`);
    if (el) {
      const expected = name === 'Old' ? 'old' : name === 'New' ? 'new' : 'graduate';
      el.classList.toggle('active-type', type === expected);
    }
  });

  const banner = document.getElementById('scaleBanner');
  if (banner) {
    if (type === 'old') {
      banner.innerHTML = '🎓 <strong>Legacy Undergraduate Scheme (through Fall 2024):</strong> 6 grade levels — F below 60%';
      banner.style.color = '#92660a';
    } else if (type === 'graduate') {
      banner.innerHTML = '📜 <strong>Revised Graduate Scheme (Spring 2025 onwards for newly admitted students):</strong> F below 60%';
      banner.style.color = '#047857';
    } else {
      banner.innerHTML = '📌 <strong>Revised Undergraduate Scheme (Spring 2025 onwards for newly admitted students):</strong> 11 grade levels — F below 50%';
      banner.style.color = 'var(--primary)';
    }
  }

  document.querySelectorAll('#subjectsBody tr').forEach(row => {
    const id = row.id.replace('row-', '');
    const gradeEl = document.getElementById(`grade-${id}`);
    if (!gradeEl) return;
    const previous = gradingScales[type][gradeEl.value] !== undefined ? gradeEl.value : '';
    gradeEl.innerHTML = '<option value="">-- Select Grade --</option>' + gradeOptions(previous);
    updateRowPoints(id, false);
  });

  document.getElementById('resultBox')?.classList.remove('show');
  clearCalculatorMessage();
  if (!options.skipSave) saveGPAState();
}

function gradeOptions(selected = '') {
  return Object.entries(gradingScales[currentScale]).map(([grade, points]) =>
    `<option value="${grade}" ${grade === selected ? 'selected' : ''}>${grade} (${points.toFixed(2)})</option>`
  ).join('');
}

function addSubject(name = '', credits = 3, grade = '', options = {}) {
  const tbody = document.getElementById('subjectsBody');
  if (!tbody) return;

  subjectCount += 1;
  const id = subjectCount;
  const safeCredits = Number.isInteger(Number(credits)) && Number(credits) >= 1 && Number(credits) <= 6 ? Number(credits) : 3;
  const safeGrade = gradingScales[currentScale][grade] !== undefined ? grade : '';
  const row = document.createElement('tr');
  row.id = `row-${id}`;
  row.innerHTML = `
    <td data-label="Subject Name">
      <input type="text" class="table-input" placeholder="e.g. Operating Systems"
        value="${escapeAttribute(name)}" id="name-${id}" maxlength="80" oninput="saveGPAState()" />
    </td>
    <td data-label="Credit Hours">
      <select class="table-select" id="credits-${id}" onchange="updateRowPoints(${id})">
        ${[1,2,3,4,5,6].map(c => `<option value="${c}" ${c === safeCredits ? 'selected' : ''}>${c} Credit${c === 1 ? '' : 's'}</option>`).join('')}
      </select>
    </td>
    <td data-label="Grade">
      <select class="table-select" id="grade-${id}" onchange="updateRowPoints(${id})">
        <option value="">-- Select Grade --</option>
        ${gradeOptions(safeGrade)}
      </select>
    </td>
    <td data-label="Quality Points">
      <span id="points-${id}" style="font-weight:800; color:var(--primary); font-size:1.05rem;">0.00</span>
    </td>
    <td data-label="Remove">
      <button class="btn-remove" type="button" onclick="removeSubject(${id})" aria-label="Remove subject" title="Remove subject">✕</button>
    </td>`;
  tbody.appendChild(row);
  updateRowPoints(id, false);
  clearCalculatorMessage();
  if (!options.skipSave) saveGPAState();
}

function updateRowPoints(id, shouldSave = true) {
  const gradeEl = document.getElementById(`grade-${id}`);
  const creditsEl = document.getElementById(`credits-${id}`);
  const pointsEl = document.getElementById(`points-${id}`);
  if (!gradeEl || !creditsEl || !pointsEl) return;

  const grade = gradeEl.value;
  const credits = Number.parseInt(creditsEl.value, 10);
  const points = gradingScales[currentScale][grade];

  if (Number.isFinite(points) && Number.isInteger(credits) && credits > 0) {
    pointsEl.textContent = (points * credits).toFixed(2);
    pointsEl.style.color = points >= 2 ? 'var(--success)' : points > 0 ? 'var(--warning)' : 'var(--danger)';
  } else {
    pointsEl.textContent = '0.00';
    pointsEl.style.color = 'var(--text-light)';
  }

  document.getElementById('resultBox')?.classList.remove('show');
  if (shouldSave) saveGPAState();
}

function removeSubject(id) {
  const row = document.getElementById(`row-${id}`);
  if (!row) return;
  row.style.opacity = '0';
  row.style.transform = 'scale(.97) translateX(12px)';
  setTimeout(() => {
    row.remove();
    saveGPAState();
    document.getElementById('resultBox')?.classList.remove('show');
  }, 180);
}

function collectSubjects() {
  return Array.from(document.querySelectorAll('#subjectsBody tr')).map(row => {
    const id = row.id.replace('row-', '');
    return {
      name: document.getElementById(`name-${id}`)?.value.trim() || '',
      credits: Number.parseInt(document.getElementById(`credits-${id}`)?.value, 10),
      grade: document.getElementById(`grade-${id}`)?.value || ''
    };
  });
}

function saveGPAState() {
  if (restoringState) return;
  try {
    localStorage.setItem(GPA_STORAGE_KEY, JSON.stringify({
      version: 2,
      scale: currentScale,
      subjects: collectSubjects()
    }));
    setSaveStatus('✓ Saved on this device');
  } catch (error) {
    console.warn('Could not save GPA state:', error);
    setSaveStatus('Autosave unavailable');
  }
}

function restoreGPAState() {
  let state = null;
  try {
    state = JSON.parse(localStorage.getItem(GPA_STORAGE_KEY) || 'null');
  } catch (error) {
    console.warn('Could not read saved GPA state:', error);
  }

  restoringState = true;
  document.getElementById('subjectsBody').innerHTML = '';
  subjectCount = 0;

  const scale = state && gradingScales[state.scale] ? state.scale : 'new';
  currentScale = scale;
  const savedSubjects = Array.isArray(state?.subjects) ? state.subjects.slice(0, 30) : [];

  if (savedSubjects.length) {
    savedSubjects.forEach(subject => addSubject(subject.name, Number(subject.credits), subject.grade, { skipSave: true }));
  } else {
    for (let i = 0; i < 4; i += 1) addSubject('', 3, '', { skipSave: true });
  }

  switchStudentType(scale, { skipSave: true });
  restoringState = false;
  saveGPAState();
}

function calculateGPA() {
  clearCalculatorMessage();
  const subjects = collectSubjects();
  if (!subjects.length) {
    showCalculatorMessage('Add at least one subject before calculating.');
    return;
  }

  const incomplete = subjects.filter(subject => !subject.grade);
  if (incomplete.length) {
    showCalculatorMessage(`Select a grade for all subjects. ${incomplete.length} row${incomplete.length === 1 ? ' is' : 's are'} incomplete.`);
    return;
  }

  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const subject of subjects) {
    if (!Number.isInteger(subject.credits) || subject.credits < 1 || subject.credits > 6) {
      showCalculatorMessage('Credit hours must be between 1 and 6 for every subject.');
      return;
    }
    const gradePoint = gradingScales[currentScale][subject.grade];
    if (!Number.isFinite(gradePoint)) {
      showCalculatorMessage('One or more grades are invalid for the selected grading scheme.');
      return;
    }
    totalQualityPoints += gradePoint * subject.credits;
    totalCredits += subject.credits;
  }

  if (totalCredits <= 0) {
    showCalculatorMessage('Total credit hours must be greater than zero.');
    return;
  }

  const gpa = totalQualityPoints / totalCredits;
  document.getElementById('resultGPA').textContent = gpa.toFixed(2);
  document.getElementById('resultGrade').textContent = getGPALabel(gpa);
  document.getElementById('totalCredits').textContent = totalCredits;
  document.getElementById('totalSubjects').textContent = subjects.length;
  document.getElementById('totalPoints').textContent = totalQualityPoints.toFixed(2);
  document.getElementById('resultBox').classList.add('show');
  showCalculatorMessage('GPA calculated successfully.', 'success');
  saveGPAState();
  document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getGPALabel(gpa) {
  if (gpa >= 3.70) return '🏆 Excellent academic standing';
  if (gpa >= 3.30) return '⭐ Very strong academic standing';
  if (gpa >= 3.00) return '👍 Good academic standing';
  if (gpa >= 2.50) return '✅ Solid academic standing';
  if (gpa >= 2.00) return '⚠️ Passing range — keep improving';
  return '❗ Low GPA — review your academic requirements';
}

function resetCalculator() {
  restoringState = true;
  document.getElementById('subjectsBody').innerHTML = '';
  document.getElementById('resultBox')?.classList.remove('show');
  subjectCount = 0;
  currentScale = 'new';
  for (let i = 0; i < 4; i += 1) addSubject('', 3, '', { skipSave: true });
  switchStudentType('new', { skipSave: true });
  restoringState = false;
  clearCalculatorMessage();
  localStorage.removeItem(GPA_STORAGE_KEY);
  saveGPAState();
  showCalculatorMessage('Calculator reset. A fresh draft has been saved.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('subjectsBody')) restoreGPAState();
});
