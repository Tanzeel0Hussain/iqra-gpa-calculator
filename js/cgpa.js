// ===== CGPA CALCULATOR =====
let semesterCount = 0;
let activeModalSem = null;
let modalSubjects = [];

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
    <div class="semester-header" onclick="openSemesterModal(${semesterCount})" style="cursor: pointer;">
      <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
        <span style="font-size: 1.25rem;" id="icon-${semesterCount}">📘</span>
        <span class="sem-title-text" id="title-${semesterCount}" 
               style="font-weight: 700; color: var(--primary); font-family: inherit; font-size: 1.1rem;">Semester ${semesterCount}</span>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="summer-btn" onclick="event.stopPropagation(); toggleSummer(${semesterCount})" id="summer-btn-${semesterCount}" title="Mark as Summer">☀️ Summer</button>
        <span class="calc-badge">Calculate Subjects ➔</span>
        <button class="btn-remove" onclick="event.stopPropagation(); removeSemester(${semesterCount})" title="Remove">✕</button>
      </div>
    </div>
    <div class="semester-inputs">
      <div class="input-group">
        <label>Semester GPA</label>
        <input type="number" class="table-input" id="sgpa-${semesterCount}"
               min="0" max="4" step="0.01" placeholder="0.00" value="${gpa}"
               oninput="validateGPA(this)"/>
      </div>
      <div class="input-group">
        <label>Total Credits</label>
        <input type="number" class="table-input" id="sch-${semesterCount}"
               min="1" max="30" step="1" placeholder="0" value="${credits}"/>
      </div>
    </div>
  `;
  list.appendChild(div);

  // Animate in
  div.style.opacity = '0';
  div.style.transform = 'translateY(15px)';
  setTimeout(() => {
    div.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  }, 10);
}

function validateGPA(input) {
  let val = parseFloat(input.value);
  if (val > 4.0) input.value = 4.0;
  if (val < 0) input.value = 0;
}

function removeSemester(id) {
  const el = document.getElementById(`sem-${id}`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      el.remove();
      updateSemesterLabels();
    }, 300);
  }
}

function toggleSummer(id) {
  const row = document.getElementById(`sem-${id}`);
  const btn = document.getElementById(`summer-btn-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  
  row.classList.toggle('is-summer');
  btn.classList.toggle('active');
  
  if (row.classList.contains('is-summer')) {
    icon.textContent = '☀️';
  } else {
    icon.textContent = '📘';
  }
  
  updateSemesterLabels();
}

function updateSemesterLabels() {
  const rows = document.querySelectorAll('.semester-row');
  let regularCount = 0;
  
  rows.forEach((row) => {
    const titleEl = row.querySelector('.sem-title-text');
    const isSummer = row.classList.contains('is-summer');
    
    if (isSummer) {
      titleEl.textContent = "Summer Session";
    } else {
      regularCount++;
      titleEl.textContent = `Semester ${regularCount}`;
    }
  });
}

// ===== MODAL LOGIC =====
let modalStudentType = 'new';

function switchStudentType(type) {
  modalStudentType = type;
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
}

function openSemesterModal(id) {
  activeModalSem = id;
  document.getElementById('modalSemTitle').textContent = `📘 Semester ${id} Calculator`;
  document.getElementById('semesterModal').classList.add('open');
  
  // Clear modal and add 4 initial rows
  document.getElementById('modalBody').innerHTML = '';
  modalSubjects = [];
  for(let i=0; i<4; i++) addModalSubject();
}

function addModalSubject() {
  const tbody = document.getElementById('modalBody');
  const tr = document.createElement('tr');
  const id = Date.now() + Math.random();
  tr.id = `m-row-${id}`;
  tr.innerHTML = `
    <td data-label="Subject"><input type="text" class="table-input" placeholder="Subject Name"></td>
    <td data-label="Credits"><input type="number" class="table-input m-credits" value="3" min="1" max="6"></td>
    <td data-label="Grade">
      <select class="table-select m-grade">
        ${getGradeOptions(modalStudentType)}
      </select>
    </td>
    <td><button class="btn-remove" onclick="this.closest('tr').remove()">✕</button></td>
  `;
  tbody.appendChild(tr);
}

function getGradeOptions(type) {
  const newGrades = [
    {g:'A',p:4.00}, {g:'A-',p:3.67}, {g:'B+',p:3.33}, {g:'B',p:3.00}, {g:'B-',p:2.67},
    {g:'C+',p:2.33}, {g:'C',p:2.00}, {g:'C-',p:1.67}, {g:'D+',p:1.33}, {g:'D',p:1.00}, {g:'F',p:0.00}
  ];
  const gradGrades = [
    {g:'A',p:4.00}, {g:'A-',p:3.67}, {g:'B+',p:3.33}, {g:'B',p:3.00}, {g:'B-',p:2.67},
    {g:'C+',p:2.33}, {g:'C',p:2.00}, {g:'F',p:0.00}
  ];
  const oldGrades = [
    {g:'A',p:4.00}, {g:'B+',p:3.50}, {g:'B',p:3.00}, {g:'C+',p:2.50}, {g:'C',p:2.00}, {g:'F',p:0.00}
  ];
  const grades = type === 'new' ? newGrades : (type === 'graduate' ? gradGrades : oldGrades);
  return grades.map(g => `<option value="${g.p}">${g.g} (${g.p.toFixed(2)})</option>`).join('');
}

function applyModalGPA() {
  const rows = document.querySelectorAll('#modalBody tr');
  let totalPoints = 0;
  let totalCredits = 0;

  rows.forEach(row => {
    const credits = parseFloat(row.querySelector('.m-credits').value) || 0;
    const gradePoints = parseFloat(row.querySelector('.m-grade').value) || 0;
    totalPoints += gradePoints * credits;
    totalCredits += credits;
  });

  if (totalCredits === 0) {
    alert('Please add at least one subject with credit hours.');
    return;
  }

  const gpa = totalPoints / totalCredits;
  
  // Apply to main row
  const gpaInput = document.getElementById(`sgpa-${activeModalSem}`);
  const creditsInput = document.getElementById(`sch-${activeModalSem}`);
  
  if (gpaInput && creditsInput) {
    gpaInput.value = gpa.toFixed(2);
    creditsInput.value = totalCredits;
  }

  closeModal('semesterModal');
}

function calculateCGPA() {
  let totalPoints = 0;
  let totalCredits = 0;
  let count = 0;

  const rows = document.querySelectorAll('.semester-row');
  rows.forEach(row => {
    const id = row.id.split('-')[1];
    const gpa = parseFloat(document.getElementById(`sgpa-${id}`).value);
    const ch = parseFloat(document.getElementById(`sch-${id}`).value);

    if (!isNaN(gpa) && !isNaN(ch) && ch > 0) {
      totalPoints += gpa * ch;
      totalCredits += ch;
      count++;
    }
  });

  if (count === 0) {
    alert('Please fill in at least one semester.');
    return;
  }

  const cgpa = totalPoints / totalCredits;
  const resultBox = document.getElementById('cgpaResultBox');
  const resultEl = document.getElementById('cgpaResult');
  
  resultBox.classList.add('show');
  
  // Animate
  let current = 0;
  const timer = setInterval(() => {
    current += cgpa / 30;
    if (current >= cgpa) {
      current = cgpa;
      clearInterval(timer);
    }
    resultEl.textContent = current.toFixed(2);
  }, 20);

  document.getElementById('cgpaGrade').textContent = getGPALabel(cgpa);
  document.getElementById('cgpaTotalSem').textContent = count;
  document.getElementById('cgpaTotalCredits').textContent = totalCredits;
  document.getElementById('cgpaTotalPoints').textContent = totalPoints.toFixed(2);

  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetCGPA() {
  document.getElementById('semestersList').innerHTML = '';
  semesterCount = 0;
  for(let i=0; i<3; i++) addSemester();
  document.getElementById('cgpaResultBox').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('semestersList')) {
    resetCGPA();
    switchStudentType('new');
  }
});
