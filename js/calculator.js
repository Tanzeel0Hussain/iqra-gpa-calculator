// ===== IU GRADING SCALE =====
const gradePoints = {
  'A':  4.00, 'A-': 3.70,
  'B+': 3.30, 'B':  3.00, 'B-': 2.70,
  'C+': 2.30, 'C':  2.00, 'C-': 1.70,
  'D+': 1.30, 'D':  1.00,
  'F':  0.00
};

let subjectCount = 0;

// ===== BUILD GRADE OPTIONS =====
function gradeOptions(selected = '') {
  return Object.keys(gradePoints).map(g =>
    `<option value="${g}" ${g === selected ? 'selected' : ''}>${g} (${gradePoints[g].toFixed(2)})</option>`
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
  if (!gradeEl || !creditsEl) return;
  const g = gradeEl.value;
  const ch = parseInt(creditsEl.value);
  if (g && gradePoints[g] !== undefined) {
    const pts = (gradePoints[g] * ch).toFixed(2);
    pointsEl.textContent = pts;
    pointsEl.style.color = gradePoints[g] >= 2.0 ? 'var(--success)' : 'var(--danger)';
  } else {
    pointsEl.textContent = '—';
    pointsEl.style.color = 'var(--navy)';
  }
}

// ===== REMOVE SUBJECT ROW =====
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
  let totalPoints = 0;
  let totalCredits = 0;
  let valid = true;
  let count = 0;

  rows.forEach(row => {
    const id = row.id.replace('row-', '');
    const gradeEl = document.getElementById(`grade-${id}`);
    const creditsEl = document.getElementById(`credits-${id}`);
    if (!gradeEl || !creditsEl) return;
    const g = gradeEl.value;
    const ch = parseInt(creditsEl.value);
    if (!g) { valid = false; return; }
    if (gradePoints[g] !== undefined) {
      totalPoints += gradePoints[g] * ch;
      totalCredits += ch;
      count++;
    }
  });

  if (count === 0) {
    alert('⚠️ Please add at least one subject with a grade to calculate GPA.');
    return;
  }

  if (!valid) {
    const proceed = confirm('⚠️ Some subjects have no grade selected and will be skipped. Continue?');
    if (!proceed) return;
  }

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  const resultBox = document.getElementById('resultBox');
  document.getElementById('resultGPA').textContent = gpa.toFixed(2);
  document.getElementById('totalCredits').textContent = totalCredits;
  document.getElementById('totalSubjects').textContent = count;
  document.getElementById('totalPoints').textContent = totalPoints.toFixed(2);
  document.getElementById('resultGrade').textContent = getGPALabel(gpa);
  resultBox.classList.add('show');
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  animateGPA(gpa);
}

// ===== ANIMATE GPA NUMBER =====
function animateGPA(target) {
  const el = document.getElementById('resultGPA');
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current.toFixed(2);
  }, 20);
}

// ===== GPA LABEL =====
function getGPALabel(gpa) {
  if (gpa >= 3.70) return '🏆 Excellent – Summa Cum Laude';
  if (gpa >= 3.50) return '⭐ Very Good – Dean\'s List Eligible';
  if (gpa >= 3.00) return '👍 Good – Cum Laude';
  if (gpa >= 2.50) return '✅ Satisfactory Standing';
  if (gpa >= 2.00) return '⚠️ Passing – Needs Improvement';
  return '❌ Below Passing – Academic Probation Risk';
}

// ===== RESET CALCULATOR =====
function resetCalculator() {
  document.getElementById('subjectsBody').innerHTML = '';
  document.getElementById('resultBox').classList.remove('show');
  subjectCount = 0;
  addSubject();
  addSubject();
  addSubject();
}

// ===== INIT: Add 3 default rows =====
document.addEventListener('DOMContentLoaded', () => {
  addSubject('Mathematics', 3, '');
  addSubject('Programming', 3, '');
  addSubject('English', 3, '');
});
