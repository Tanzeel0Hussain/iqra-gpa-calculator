// ===== MODAL CONTROL =====
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// ===== MOBILE MENU =====
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.toggle('open');
}

// Close menu when a link is clicked
document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('open');
    });
  });

  // ===== SCROLL ANIMATIONS =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ===== COUNTER ANIMATION =====
  animateCounters();
});

function animateCounters() {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const text = stat.textContent.trim();
    if (text === 'Free' || text === '100%' || text === '4.0') return;
    const target = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(target)) return;
    let current = 0;
    const increment = target / 60;
    const suffix = text.replace(/[0-9]/g, '').replace(',', '');
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = Math.floor(current).toLocaleString() + (text.includes('+') ? '+' : '');
    }, 25);
  });
}
