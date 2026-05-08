// ===== GRADING SCALES =====
const gradingScales = {
  old: {
    // Old students: fail below 60%, only 6 grades
    'A':  4.00,
    'B+': 3.50,
    'B':  3.00,
    'C+': 2.50,
    'C':  2.00,
    'F':  0.00
  },
  new: {
    // New students: fail below 50%, full 11-grade scale
    'A':  4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B':  3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C':  2.0,
    'C-': 1.7,
    'D':  1.0,
    'D+': 0.7,
    'F':  0.0
  }
};

let subjectCount = 0;
let currentScale = 'new'; // default

// ===== SWITCH STUDENT TYPE =====
function switchStudentType(type) {
  currentScale = type;

  // Update button styles
  document.getElementById('btnOld').classList.toggle('active-type', type === 'old');
  document.getElementById('btnNew').classList.toggle('active-type', type === 'new');

  // Show info banner
  const banner = document.getElementById('scaleBanner');
  if (type === 'old') {
    banner.innerHTML = '⚠️ <strong>Old Students System:</strong> 6 grade levels — Fail below 60%';
    banner.style.background = 'rgba(232,185,35,0.15)';
    banner.style.borderColor = 'rgba(232,185,35,0.5)';
    banner.style.color = '#92660a';
  } else {
    banner.innerHTML = '📌 <strong>New Students System:</strong> 11 grade levels — Fail below 50%';
    banner.style.background = 'rgba(26,42,108,0.08)';
    banner.style.borderColor = 'rgba(26,42,108,0.3)';
    banner.style.color = 'var(--navy)';
  }

  // Rebuild all grade dropdowns
  const rows = document.querySelectorAll('#subjectsBody tr');
  rows.forEach(row => {
    const id = row.id.replace('row-', '');
    const gradeEl = document.getElementById(`grade-${id}`);
    if (!gradeEl) return;
    const prev = gradeEl.value;
    gradeEl.innerHTML = '<option value="">-- Select Grade --</option>' + gradeOptions(prev);
    updateRowPoints(id);
  });

  // Reset result
  document.getElementById('resultBox').classList.remove('show');
}

// ===== BUILD GRADE OPTIONS =====
function gradeOptions(selected = '') {
  const scale = gradingScales[currentScale];
  return Object.keys(scale).map(g =>
    `<option value="${g}" ${g === selected ? 'selected' : ''}>${g} = ${scale[g].toFixed(2)}</option>`
  ).join('');
}

// ===== ADD SUBJECT ROW =====
function addSubject(name = '', credits = 3, grade = '') {
  subjectCount++;
  const tbody = document.getElementById('subjectsBody');
  const row = document.createElement('tr');
  row.id = `row-${subjectCount}`;
  row.innerHTML = `
    <td>
      <input type="text" class="table-input" placeholder="e.g. Mathematics"
             value="${name}" id="name-${subjectCount}"/>
    </td>
    <td>
      <select class="table-select" id="credits-${subjectCount}" onchange="updateRowPoints(${subjectCount})">
        ${[1,2,3,4,5].map(c => `<option value="${c}" ${c === credits ? 'selected' : ''}>${c} CH</option>`).join('')}
      </select>
    </td>
    <td>
      <select class="table-select" id="grade-${subjectCount}" onchange="updateRowPoints(${subjectCount})">
        <option value="">-- Select Grade --</option>
        ${gradeOptions(grade)}
      </select>
    </td>
    <td>
      <span id="points-${subjectCount}" style="font-weight:700; color:var(--navy); font-size:0.95rem;">—</span>
    </td>
    <td>
      <button class="btn-remove" onclick="removeSubject(${subjectCount})" title="Remove">✕</button>
    </td>
  `;
  tbody.appendChild(row);
  if (grade) updateRowPoints(subjectCount);
}

// ===== UPDATE ROW POINTS =====
function updateRowPoints(id) {
  const gradeEl = document.getElementById(`grade-${id}`);
  const creditsEl = document.getElementById(`credits-${id}`);
  const pointsEl = document.getElementById(`points-${id}`);
  if (!gradeEl || !creditsEl || !pointsEl) return;
  const g = gradeEl.value;
  const ch = parseInt(creditsEl.value);
  const scale = gradingScales[currentScale];
  if (g && scale[g] !== undefined) {
    const pts = (scale[g] * ch).toFixed(2);
    pointsEl.textContent = pts;
    pointsEl.style.color = scale[g] >= 2.0 ? 'var(--success)' : (scale[g] > 0 ? 'var(--warning)' : 'var(--danger)');
  } else {
    pointsEl.textContent = '—';
    pointsEl.style.color = 'var(--navy)';
  }
}

// ===== REMOVE ROW =====
function removeSubject(id) {
  const row = document.getElementById(`row-${id}`);
  if (row) {
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    row.style.transition = 'all 0.3s ease';
    setTimeout(() => row.remove(), 300);
  }
}

// ===== CALCULATE GPA =====
function calculateGPA() {
  const tbody = document.getElementById('subjectsBody');
  const rows = tbody.querySelectorAll('tr');
  const scale = gradingScales[currentScale];
  let totalPoints = 0, totalCredits = 0, count = 0, skipped = 0;

  rows.forEach(row => {
    const id = row.id.replace('row-', '');
    const gradeEl = document.getElementById(`grade-${id}`);
    const creditsEl = document.getElementById(`credits-${id}`);
    if (!gradeEl || !creditsEl) return;
    const g = gradeEl.value;
    const ch = parseInt(creditsEl.value);
    if (!g) { skipped++; return; }
    if (scale[g] !== undefined) {
      totalPoints += scale[g] * ch;
      totalCredits += ch;
      count++;
    }
  });

  if (count === 0) {
    alert('⚠️ Please add at least one subject with a grade to calculate GPA.');
    return;
  }
  if (skipped > 0) {
    const go = confirm(`⚠️ ${skipped} subject(s) have no grade and will be skipped. Continue?`);
    if (!go) return;
  }

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  document.getElementById('resultGPA').textContent = '0.00';
  document.getElementById('resultGrade').textContent = getGPALabel(gpa);
  document.getElementById('totalCredits').textContent = totalCredits;
  document.getElementById('totalSubjects').textContent = count;
  document.getElementById('totalPoints').textContent = totalPoints.toFixed(2);

  const resultBox = document.getElementById('resultBox');
  resultBox.classList.add('show');
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Animate number
  let cur = 0;
  const inc = gpa / 50;
  const el = document.getElementById('resultGPA');
  const t = setInterval(() => {
    cur += inc;
    if (cur >= gpa) { cur = gpa; clearInterval(t); }
    el.textContent = cur.toFixed(2);
  }, 20);
}

// ===== GPA LABEL =====
function getGPALabel(gpa) {
  if (gpa >= 3.70) return '🏆 Excellent — Summa Cum Laude';
  if (gpa >= 3.50) return '⭐ Very Good — Dean\'s List Eligible';
  if (gpa >= 3.00) return '👍 Good — Cum Laude';
  if (gpa >= 2.50) return '✅ Satisfactory Standing';
  if (gpa >= 2.00) return '⚠️ Passing — Needs Improvement';
  return '❌ Below Passing — Academic Probation Risk';
}

// ===== RESET =====
function resetCalculator() {
  document.getElementById('subjectsBody').innerHTML = '';
  document.getElementById('resultBox').classList.remove('show');
  subjectCount = 0;
  addSubject('Mathematics', 3, '');
  addSubject('Programming', 3, '');
  addSubject('English', 3, '');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  addSubject('Mathematics', 3, '');
  addSubject('Programming', 3, '');
  addSubject('English', 3, '');
  // Default: new student
  switchStudentType('new');
});
