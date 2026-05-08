// ===== CGPA CALCULATOR =====
let semesterCount = 0;

function getGPALabel(gpa) {
  if (gpa >= 3.70) return '🏆 Excellent – Summa Cum Laude';
  if (gpa >= 3.50) return '⭐ Very Good – Dean\'s List Eligible';
  if (gpa >= 3.00) return '👍 Good – Cum Laude';
  if (gpa >= 2.50) return '✅ Satisfactory Standing';
  if (gpa >= 2.00) return '⚠️ Passing – Needs Improvement';
  return '❌ Below Passing – Academic Probation Risk';
}

function addSemester(gpa = '', credits = '') {
  semesterCount++;
  const list = document.getElementById('semestersList');
  const div = document.createElement('div');
  div.className = 'semester-row';
  div.id = `sem-${semesterCount}`;
  div.innerHTML = `
    <div class="semester-header">
      <h4>📘 Semester ${semesterCount}</h4>
      <button class="btn-remove" onclick="removeSemester(${semesterCount})" title="Remove">✕</button>
    </div>
    <div class="semester-inputs">
      <div class="input-group">
        <label>Semester GPA (0.00 – 4.00)</label>
        <input type="number" class="table-input" id="sgpa-${semesterCount}"
               min="0" max="4" step="0.01" placeholder="e.g. 3.50" value="${gpa}"
               oninput="validateGPA(this)"/>
      </div>
      <div class="input-group">
        <label>Total Credit Hours</label>
        <input type="number" class="table-input" id="sch-${semesterCount}"
               min="1" max="30" step="1" placeholder="e.g. 18" value="${credits}"/>
      </div>
    </div>
  `;
  list.appendChild(div);

  // Animate in
  div.style.opacity = '0';
  div.style.transform = 'translateY(15px)';
  setTimeout(() => {
    div.style.transition = 'all 0.4s ease';
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  }, 10);
}

function validateGPA(input) {
  if (parseFloat(input.value) > 4.0) input.value = 4.0;
  if (parseFloat(input.value) < 0) input.value = 0;
}

function removeSemester(id) {
  const el = document.getElementById(`sem-${id}`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }
}

function calculateCGPA() {
  let totalPoints = 0;
  let totalCredits = 0;
  let count = 0;
  let hasError = false;

  for (let i = 1; i <= semesterCount; i++) {
    const gpaEl = document.getElementById(`sgpa-${i}`);
    const chEl = document.getElementById(`sch-${i}`);
    if (!gpaEl || !chEl) continue;

    const gpa = parseFloat(gpaEl.value);
    const ch = parseInt(chEl.value);

    if (isNaN(gpa) || isNaN(ch) || ch <= 0) {
      hasError = true;
      continue;
    }
    if (gpa < 0 || gpa > 4.0) {
      alert(`⚠️ Semester ${i}: GPA must be between 0.00 and 4.00`);
      return;
    }

    totalPoints += gpa * ch;
    totalCredits += ch;
    count++;
  }

  if (count === 0) {
    alert('⚠️ Please fill in at least one semester with a valid GPA and credit hours.');
    return;
  }

  if (hasError) {
    const proceed = confirm('⚠️ Some semesters have incomplete data and will be skipped. Continue?');
    if (!proceed) return;
  }

  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  document.getElementById('cgpaResult').textContent = '0.00';
  document.getElementById('cgpaGrade').textContent = getGPALabel(cgpa);
  document.getElementById('cgpaTotalSem').textContent = count;
  document.getElementById('cgpaTotalCredits').textContent = totalCredits;
  document.getElementById('cgpaTotalPoints').textContent = totalPoints.toFixed(2);

  const resultBox = document.getElementById('cgpaResultBox');
  resultBox.classList.add('show');
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Animate number
  let current = 0;
  const inc = cgpa / 50;
  const el = document.getElementById('cgpaResult');
  const timer = setInterval(() => {
    current += inc;
    if (current >= cgpa) { current = cgpa; clearInterval(timer); }
    el.textContent = current.toFixed(2);
  }, 20);
}

function resetCGPA() {
  document.getElementById('semestersList').innerHTML = '';
  document.getElementById('cgpaResultBox').classList.remove('show');
  semesterCount = 0;
  addSemester();
  addSemester();
  addSemester();
}

// ===== INIT: 3 default semesters =====
document.addEventListener('DOMContentLoaded', () => {
  addSemester();
  addSemester();
  addSemester();
});
