// ===== PDF GENERATION LOGIC =====
let currentReportType = 'gpa';

function openDownloadModal(type) {
    currentReportType = type;
    document.getElementById('downloadModal').classList.add('open');
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();
    const errorEl = document.getElementById('downloadError');

    if (!name || !id) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }
    if (errorEl) errorEl.style.display = 'none';
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Add Logo (Top)
    // We use the image URL directly. jsPDF supports this if the image is local/same-origin.
    try {
        doc.addImage('Iqra-University-Logo.png', 'PNG', pageWidth/2 - 15, 10, 30, 30);
    } catch (e) {
        console.error("Top logo failed", e);
    }
    
    // 2. Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(26, 42, 108); // Navy
    doc.text("IQRA UNIVERSITY ISLAMABAD (IUIC)", pageWidth/2, 50, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Official Academic Performance Report", pageWidth/2, 56, { align: "center" });
    
    // 3. Student Info Box
    doc.setDrawColor(232, 185, 35); // Gold
    doc.setLineWidth(0.5);
    doc.line(20, 62, pageWidth - 20, 62);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`STUDENT NAME: ${name.toUpperCase()}`, 20, 70);
    doc.text(`STUDENT ID: ${id.toUpperCase()}`, 20, 76);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 20, 70, { align: "right" });
    
    // 4. Result Summary
    const resultValue = currentReportType === 'gpa' 
        ? document.getElementById('resultGPA').textContent 
        : document.getElementById('cgpaResult').textContent;
    
    doc.setFillColor(26, 42, 108); // Navy
    doc.rect(20, 85, pageWidth - 40, 25, 'F');
    
    doc.setTextColor(232, 185, 35); // Gold
    doc.setFontSize(10);
    doc.text(currentReportType === 'gpa' ? "SEMESTER GPA" : "CUMULATIVE CGPA", pageWidth/2, 94, { align: "center" });
    doc.setFontSize(24);
    doc.text(resultValue, pageWidth/2, 104, { align: "center" });
    
    // 5. Data Table
    let tableData = [];
    let tableHeaders = [];
    
    if (currentReportType === 'gpa') {
        tableHeaders = [["Subject Name", "Credits", "Grade", "Points"]];
        const rows = document.querySelectorAll('#subjectsBody tr');
        rows.forEach(row => {
            const rowId = row.id.replace('row-', '');
            const subName = document.getElementById(`name-${rowId}`)?.value || 'Subject';
            const credits = document.getElementById(`credits-${rowId}`)?.value || '0';
            const gradeEl = document.getElementById(`grade-${rowId}`);
            const grade = gradeEl?.options[gradeEl.selectedIndex]?.text.split(' ')[0] || 'N/A';
            const points = document.getElementById(`points-${rowId}`)?.textContent || '0';
            tableData.push([subName, credits, grade, points]);
        });
    } else {
        tableHeaders = [["Semester", "GPA", "Credits", "Grade Points"]];
        const rows = document.querySelectorAll('.semester-row');
        rows.forEach(row => {
            const rowId = row.id.split('-')[1];
            const semNameEl = row.querySelector('.sem-title-text');
            const semName = semNameEl ? semNameEl.textContent : `Semester ${rowId}`;
            const gpa = document.getElementById(`sgpa-${rowId}`)?.value || '0';
            const credits = document.getElementById(`sch-${rowId}`)?.value || '0';
            const pts = (parseFloat(gpa) * parseFloat(credits)).toFixed(2);
            tableData.push([semName, gpa, credits, pts]);
        });
    }
    
    doc.autoTable({
        startY: 120,
        head: tableHeaders,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 42, 108], textColor: [232, 185, 35] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 20, right: 20 }
    });
    
    // 6. Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Developed by Tanzeel Hussain | IUIC Islamabad GPA Calculator", pageWidth/2, 285, { align: "center" });

    doc.save(`IUIC_Report_${name.replace(/\s+/g, '_')}.pdf`);
    closeModal('downloadModal');
}
