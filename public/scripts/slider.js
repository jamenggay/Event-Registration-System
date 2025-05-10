const slider = document.querySelector('.slider');

function activate(e) {
  const items = document.querySelectorAll('.item');
  if (e.target.id === 'next') {
    slider.append(items[0]);  
  } else if (e.target.id === 'prev') {
    slider.prepend(items[items.length - 1]);  
  }
}

setInterval(() => {
    const nextButton = document.querySelector('#next');
    if (nextButton) {
      activate({ target: nextButton });
    }
  }, 5000);
  
  document.addEventListener('click', activate, false);

  function scrollToEvents() {
    const sliderContainer = document.getElementById('events-slider');
    sliderContainer.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
} 