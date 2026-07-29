// ===== GRADING SCALES =====
const gradingScales = {
  old: {
    'A': 4.00,
    'B+': 3.50,
    'B': 3.00,
    'C+': 2.50,
    'C': 2.00,
    'F': 0.00
  },
  new: {
    'A': 4.00,
    'A-': 3.67,
    'B+': 3.33,
    'B': 3.00,
    'B-': 2.67,
    'C+': 2.33,
    'C': 2.00,
    'C-': 1.67,
    'D+': 1.33,
    'D': 1.00,
    'F': 0.00
  },
  graduate: {
    'A': 4.00,
    'A-': 3.67,
    'B+': 3.33,
    'B': 3.00,
    'B-': 2.67,
    'C+': 2.33,
    'C': 2.00,
    'F': 0.00
  }
};

let subjectCount = 0;
let currentScale = 'new';

function switchStudentType(type) {
  currentScale = type;
  const btnOld = document.getElementById('btnOld');
  const btnNew = document.getElementById('btnNew');
  const btnGrad = document.getElementById('btnGrad');

  if (btnOld) btnOld.classList.toggle('active-type', type === 'old');
  if (btnNew) btnNew.classList.toggle('active-type', type === 'new');
  if (btnGrad) btnGrad.classList.toggle('active-type', type === 'graduate');

  const banner = document.getElementById('scaleBanner');
  if (banner) {
    if (type === 'old') {
      banner.innerHTML = '⚠️ <strong>Old Undergraduate Scheme (Pre-Spring 2025):</strong> 6 grade levels — Fail below 60%';
      banner.style.color = '#92660a';
    } else if (type === 'graduate') {
      banner.innerHTML = '📜 <strong>Graduate Scheme (MBA/MS/MPhil/PhD):</strong> 8 grade levels — Fail below 60% — Degree Requirement 2.50 CGPA';
      banner.style.color = '#10b981';
    } else {
      banner.innerHTML = '📌 <strong>New Undergraduate Scheme (Spring 2025 Onwards):</strong> 11 grade levels — Fail below 50%';
      banner.style.color = 'var(--primary)';
    }
  }

  const rows = document.querySelectorAll('#subjectsBody tr');
  rows.forEach(row => {
    const id = row.id.replace('row-', '');
    const gradeEl = document.getElementById(`grade-${id}`);
    if (!gradeEl) return;
    const prev = gradeEl.value;
    gradeEl.innerHTML = '<option value="">-- Select Grade --</option>' + gradeOptions(prev);
    updateRowPoints(id);
  });
  document.getElementById('resultBox').classList.remove('show');
}

function gradeOptions(selected = '') {
  const scale = gradingScales[currentScale];
  return Object.keys(scale).map(g =>
    `<option value="${g}" ${g === selected ? 'selected' : ''}>${g} (${scale[g].toFixed(2)})</option>`
  ).join('');
}

function addSubject(name = '', credits = 3, grade = '') {
  subjectCount++;
  const tbody = document.getElementById('subjectsBody');
  const row = document.createElement('tr');
  row.id = `row-${subjectCount}`;
  row.innerHTML = `
    <td data-label="Subject Name">
      <input type="text" class="table-input" placeholder="e.g. Mathematics"
             value="${name}" id="name-${subjectCount}"/>
    </td>
    <td data-label="Credit Hours">
      <select class="table-select" id="credits-${subjectCount}" onchange="updateRowPoints(${subjectCount})">
        ${[1, 2, 3, 4, 5, 6].map(c => `<option value="${c}" ${c === credits ? 'selected' : ''}>${c} Credits</option>`).join('')}
      </select>
    </td>
    <td data-label="Grade">
      <select class="table-select" id="grade-${subjectCount}" onchange="updateRowPoints(${subjectCount})">
        <option value="">-- Select Grade --</option>
        ${gradeOptions(grade)}
      </select>
    </td>
    <td data-label="Grade Points">
      <span id="points-${subjectCount}" style="font-weight:800; color:var(--primary); font-size:1.1rem;">0.00</span>
    </td>
    <td>
      <button class="btn-remove" onclick="removeSubject(${subjectCount})" title="Remove">✕</button>
    </td>
  `;
  tbody.appendChild(row);
  if (grade) updateRowPoints(subjectCount);
}

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
    pointsEl.textContent = '0.00';
    pointsEl.style.color = 'var(--text-light)';
  }
}

function removeSubject(id) {
  const row = document.getElementById(`row-${id}`);
  if (row) {
    row.style.opacity = '0';
    row.style.transform = 'scale(0.9) translateX(20px)';
    row.style.transition = 'all 0.3s ease';
    setTimeout(() => row.remove(), 300);
  }
}

function calculateGPA() {
  const rows = document.querySelectorAll('#subjectsBody tr');
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
    alert('Please add at least one subject with a grade.');
    return;
  }
  if (skipped > 0) {
    const go = confirm(`${skipped} subject(s) have no grade. Calculate with remaining?`);
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

  let cur = 0;
  const t = setInterval(() => {
    cur += gpa / 30;
    if (cur >= gpa) { cur = gpa; clearInterval(t); }
    document.getElementById('resultGPA').textContent = cur.toFixed(2);
  }, 20);

  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function getGPALabel(gpa) {
  if (gpa >= 3.70) return '🏆 Excellent — Summa Cum Laude';
  if (gpa >= 3.50) return '⭐ Very Good — Dean\'s List Eligible';
  if (gpa >= 3.00) return '👍 Good — Cum Laude';
  if (gpa >= 2.50) return '✅ Satisfactory Standing';
  if (gpa >= 2.00) return '⚠️ Passing — Needs Improvement';
  return '❌ Below Passing — Academic Probation Risk';
}

function resetCalculator() {
  document.getElementById('subjectsBody').innerHTML = '';
  document.getElementById('resultBox').classList.remove('show');
  subjectCount = 0;
  for (let i = 0; i < 4; i++) addSubject();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('subjectsBody')) {
    resetCalculator();
    switchStudentType('new');
  }
});
