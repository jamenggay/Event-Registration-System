
  const overlay = document.getElementById('popupOverlay');

  function openPopup() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; 
  }

  function closePopup() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', e => {
    if(e.target === overlay) closePopup();
  });

  document.addEventListener('keydown', e => {
    if(e.key === "Escape" && overlay.classList.contains('active')) {
      closePopup();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".toggle-buttons button");
    const groups = document.querySelectorAll(".event-group");

    function filterEvents(showUpcoming) {
      const today = new Date().setHours(0, 0, 0, 0);
      groups.forEach(group => {
        const eventDate = new Date(group.dataset.date).setHours(0, 0, 0, 0);
        const shouldShow = showUpcoming ? eventDate >= today : eventDate < today;
        group.style.display = shouldShow ? "flex" : "none";
      });
    }

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const isUpcoming = button.textContent.trim().toLowerCase() === "upcoming";
        filterEvents(isUpcoming);
      });
    });

    filterEvents(true);
  });