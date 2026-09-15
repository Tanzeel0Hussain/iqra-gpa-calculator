# 🎓 IUIC Islamabad — GPA & CGPA Calculator

![GitHub Repo Size](https://img.shields.io/github/repo-size/Tanzeel0Hussain/iqra-gpa-calculator?color=navy&style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/Tanzeel0Hussain/iqra-gpa-calculator?style=for-the-badge&color=gold)
![Live Status](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)

A responsive, student-built **GPA, CGPA and target-CGPA planning tool** for Iqra University students. It supports the legacy grading scheme used through Fall 2024 and the revised undergraduate / graduate schemes introduced for newly admitted students from Spring 2025.

## 🚀 Live Demo

**https://tanzeel0hussain.github.io/iqra-gpa-calculator/**

## ✨ Features

- **Semester GPA calculator** with course names, credit-hour dropdowns, grades and quality points.
- **Credit-weighted CGPA calculator** for multiple regular or summer semesters.
- **Target CGPA planner** that estimates the average GPA required over future credits.
- **Three grading modes:** legacy, revised undergraduate, and revised graduate.
- **Local autosave** using browser storage; no account or backend is required.
- Add / remove rows, reset calculator, clear validation messages and mobile-friendly controls.
- **PDF report + browser print** support.
- Responsive navy-and-gold UI with a 3D-style campus hero.
- Grading references linked to Iqra University student handbooks.

## 📚 Grading Policy Used

The project follows Iqra University's published student handbooks:

- **Legacy scheme (through Fall 2024):** A 4.00, B+ 3.50, B 3.00, C+ 2.50, C 2.00, F 0.00.
- **Revised undergraduate scheme (Spring 2025 onwards for newly admitted students):** A 4.00 through D 1.00, with F below 50%.
- **Revised graduate scheme (Spring 2025 onwards for newly admitted students):** A 4.00 through C 2.00, with F below 60%.

Official references:
- [IU Undergraduate Student Handbook](https://iqra.edu.pk/wp-content/uploads/2026/04/IU-UG-Handbook-11.06.2025-v14.0-2.pdf)
- [IU Graduate Student Handbook](https://iqra.edu.pk/wp-content/uploads/2026/04/IU-PG-Handbook-11.06.2025-v14.0-2.pdf)

> **Important:** This project is an independent planning tool. It is not an official university transcript, result portal, or registrar service. Always verify official academic records through Iqra University.

## 🧮 Formulae

```text
Semester GPA = Σ(Grade Point × Course Credit Hours) / Σ(Course Credit Hours)

CGPA = Σ(Semester GPA × Semester Credit Hours) / Σ(Semester Credit Hours)

Required Future GPA =
(Target CGPA × (Completed Credits + Planned Credits)
 - Current CGPA × Completed Credits) / Planned Credits
```

## 🛠️ Built With

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- jsPDF + AutoTable
- GitHub Pages

## 📂 Project Structure

```text
├── index.html
├── gpa-calculator.html
├── cgpa-calculator.html
├── grading.html
├── about.html
├── contact.html
├── css/
│   ├── style.css
│   └── enhancements.css
├── js/
│   ├── main.js
│   ├── calculator.js
│   ├── cgpa.js
│   └── report.js
└── tests/
    └── calculation-tests.html
```

## ✅ Quick Test Cases

Open `tests/calculation-tests.html` in a browser. It checks representative weighted-GPA, legacy/revised grade-point and target-CGPA calculations without requiring any external test framework.

## 👨‍💻 Developer

Developed by **Tanzeel Hussain** for the IUIC student community.

[GitHub Profile](https://github.com/Tanzeel0Hussain)

## 🏛️ University Link

For official university information and services, visit [Iqra University Islamabad Campus](https://iuisl.iqra.edu.pk/).

---

© 2026 IUIC GPA Calculator
