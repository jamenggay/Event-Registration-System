window.addEventListener('load', function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const minimumTime = 900; 
  const startTime = performance.timing.navigationStart;
  const now = Date.now();
  const timeElapsed = now - startTime;
  const timeRemaining = Math.max(minimumTime - timeElapsed, 0);

  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500); 
  }, timeRemaining);
});
