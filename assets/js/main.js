// Dark/Light mode toggle
const toggle = document.getElementById('theme-toggle');
const root = document.documentElement;
toggle.addEventListener('click', () => {
  if (root.classList.contains('dark')) {
    root.classList.replace('dark', 'light');
    toggle.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    root.classList.replace('light', 'dark');
    toggle.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
});
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  root.classList.add(saved);
  toggle.textContent = saved === 'dark' ? '☀️' : '🌙';
});