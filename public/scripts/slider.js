const slider = document.querySelector('.slider');
  const nextButton = document.querySelector('#next');
  const prevButton = document.querySelector('#prev');

  function activate(direction) {
    const items = document.querySelectorAll('.item');
    if (direction === 'next') {
      slider.append(items[0]);
    } else if (direction === 'prev') {
      slider.prepend(items[items.length - 1]);
    }
  }

  // Event listeners for manual click
  nextButton.addEventListener('click', () => activate('next'));
  prevButton.addEventListener('click', () => activate('prev'));

  // Auto-advance every 5 seconds
  setInterval(() => {
    activate('next');
  }, 5000);

  // Optional: scroll to slider section
  function scrollToEvents() {
    const sliderContainer = document.getElementById('events-slider');
    sliderContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }