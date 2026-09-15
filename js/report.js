// ===== PDF / PRINT REPORTS =====
let currentReportType = 'gpa';

function openDownloadModal(type) {
  currentReportType = type;
  const modal = document.getElementById('downloadModal');
  if (modal) modal.classList.add('open');
}

function printResult() {
  window.print();
}

function imageToDataURL(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = src;
  });
}

function validGPARowsForReport() {
  return Array.from(document.querySelectorAll('#subjectsBody tr')).flatMap(row => {
    const id = row.id.replace('row-', '');
    const name = document.getElementById(`name-${id}`)?.value.trim() || 'Subject';
    const credits = document.getElementById(`credits-${id}`)?.value || '';
    const gradeEl = document.getElementById(`grade-${id}`);
    const grade = gradeEl?.value || '';
    const points = document.getElementById(`points-${id}`)?.textContent || '';
    return grade ? [[name, credits, grade, points]] : [];
  });
}

function validCGPARowsForReport() {
  return Array.from(document.querySelectorAll('.semester-row')).flatMap(row => {
    const id = row.id.split('-')[1];
    const label = row.querySelector('.sem-title-text')?.textContent || `Semester ${id}`;
    const gpa = document.getElementById(`sgpa-${id}`)?.value || '';
    const credits = document.getElementById(`sch-${id}`)?.value || '';
    const gpaNum = Number.parseFloat(gpa);
    const creditsNum = Number.parseFloat(credits);
    if (!Number.isFinite(gpaNum) || !Number.isFinite(creditsNum) || creditsNum <= 0) return [];
    return [[label, gpaNum.toFixed(2), creditsNum.toString(), (gpaNum * creditsNum).toFixed(2)]];
  });
}

async function generatePDF() {
  const name = document.getElementById('studentName')?.value.trim() || '';
  const studentId = document.getElementById('studentID')?.value.trim() || '';
  const errorEl = document.getElementById('downloadError');

  if (!name || !studentId) {
    if (errorEl) {
      errorEl.textContent = '⚠️ Please enter both your name and student ID.';
      errorEl.style.display = 'block';
    }
    return;
  }

  if (!window.jspdf?.jsPDF) {
    if (errorEl) {
      errorEl.textContent = '⚠️ PDF library could not load. Please check your connection or use Print Result.';
      errorEl.style.display = 'block';
    }
    return;
  }
  if (errorEl) errorEl.style.display = 'none';

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    const logoData = await imageToDataURL('Iqra-University-Logo.png');
    doc.addImage(logoData, 'PNG', pageWidth / 2 - 13, 9, 26, 26);
  } catch (error) {
    console.warn('Logo could not be added to the PDF:', error);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 42, 108);
  doc.text('IQRA UNIVERSITY GPA PLANNING REPORT', pageWidth / 2, 45, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Unofficial student planning report — not an academic transcript', pageWidth / 2, 51, { align: 'center' });

  doc.setDrawColor(232, 185, 35);
  doc.setLineWidth(0.5);
  doc.line(20, 58, pageWidth - 20, 58);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`STUDENT: ${name.toUpperCase()}`, 20, 67);
  doc.text(`STUDENT ID: ${studentId.toUpperCase()}`, 20, 73);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 20, 67, { align: 'right' });

  const resultElement = currentReportType === 'gpa'
    ? document.getElementById('resultGPA')
    : document.getElementById('cgpaResult');
  const resultValue = resultElement?.textContent || '0.00';

  doc.setFillColor(26, 42, 108);
  doc.roundedRect(20, 82, pageWidth - 40, 25, 3, 3, 'F');
  doc.setTextColor(232, 185, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(currentReportType === 'gpa' ? 'SEMESTER GPA' : 'CUMULATIVE CGPA', pageWidth / 2, 91, { align: 'center' });
  doc.setFontSize(22);
  doc.text(resultValue, pageWidth / 2, 102, { align: 'center' });

  const tableHeaders = currentReportType === 'gpa'
    ? [['Subject', 'Credits', 'Grade', 'Quality Points']]
    : [['Semester', 'GPA', 'Credits', 'Quality Points']];
  const tableData = currentReportType === 'gpa' ? validGPARowsForReport() : validCGPARowsForReport();

  if (!tableData.length) {
    if (errorEl) {
      errorEl.textContent = '⚠️ Calculate a result with valid rows before downloading the PDF.';
      errorEl.style.display = 'block';
    }
    return;
  }

  if (typeof doc.autoTable === 'function') {
    doc.autoTable({
      startY: 116,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [26, 42, 108], textColor: [255, 231, 159] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 20, right: 20 }
    });
  }

  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 140, 155);
  doc.text('IUIC GPA Calculator • Student planning tool • Verify official results through the university portal.', pageWidth / 2, footerY, { align: 'center' });

  const safeName = name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'Student';
  doc.save(`IUIC_${currentReportType.toUpperCase()}_${safeName}.pdf`);
  closeModal('downloadModal');
}
