// Light/dark toggle shared by every page. Remembers the choice.
(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
  const btn = document.getElementById('theme');
  if (btn) btn.onclick = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    dispatchEvent(new Event('themechange'));
  };
})();
