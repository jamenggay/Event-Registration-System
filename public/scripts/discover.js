//BACKEND SCRIPTSSS
import { toastData, showToast } from "./alert-toast.js";


function showCarousel() {
  const carousel = document.getElementById("carousel-section");
  const hoverCards = document.getElementById("hover-cards-section");

  carousel.style.display = "block";
  hoverCards.classList.remove("active");

  const cards = hoverCards.querySelectorAll(".card-wrap");
  cards.forEach((card) => {
    card.style.display = "block";
  });

  carousel?.scrollIntoView({ behavior: "smooth" });
}

window.showCarousel = showCarousel;

document.addEventListener("DOMContentLoaded", async () => {
  const carousellTrack = document.getElementById("carousell-trackID");
  const eventDetails = document.getElementById("event-details")
  const app = document.getElementById("app");
  const overlay = document.getElementById("popupOverlay");
  const learMoreBtn = document.getElementById("LearnMore-btn");


  try {
    const res1 = await fetch('/event-details');
    const eventsData = await res1.json();
    const events = eventsData.events;

    const eventsCarousel = events.map(event => ({
      name: event.eventName,
      category: event.category,
      eventID: event.eventID
    }));




    const createdEvents = eventsData.createdEvents;

    const res2 = await fetch('/api/formatStartDate');
    const startDateTime = await res2.json();

    const res3 = await fetch('/api/formatEndDate');
    const endDateTime = await res3.json();

    const res4 = await fetch('/api/compareDate');
    const sameDate = await res4.json();

    const res5 = await fetch('/api/endTime');
    const endTime = await res5.json();

    const res6 = await fetch('/api/user-registrations');
    const registeredData = await res6.json();

    const article = document.createElement('article');
    article.className = "card-popup";
    overlay.appendChild(article);



    const eventStatusMap = {};
    registeredData.registrations.forEach(reg => {
      eventStatusMap[reg.eventID] = reg.status;
    });






    events.forEach((event, index) => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      div1.className = "carousell-card";
      div2.className = "item";
      div3.className = "popupContainer";

      // learMoreBtn.event-data == [index];

      div1.innerHTML = `
      <img src="${event.featureImage}" alt="${event.category} Event">`;

      carousellTrack.appendChild(div1);




      const isSameDay = sameDate[index].SameDay === 'True';
      const registrationStatus = eventStatusMap[event.eventID];

      const isUserCreated = createdEvents.some(createdEvent => createdEvent.eventID === event.eventID);
      let buttonText = 'Register';

      if (isUserCreated) {
        buttonText = 'Manage Event';
      }
      else {
        if (registrationStatus === 'Waitlisted') {
          buttonText = 'Waitlisted';
        } else if (registrationStatus === 'Pending' || registrationStatus === 'Approved') {
          buttonText = 'Registered';
        }
      }


      const eventDateHTML = isSameDay
        ? `<span class="event-date">${startDateTime[index].formattedDate} - ${endTime[index].endTime}</span>`
        : `<span class="event-date">${startDateTime[index].formattedDate} - ${endDateTime[index].formattedDate}</span>`;



// ------------------------------------
      learMoreBtn.addEventListener('click', () => {
        const event = events[currentIndex];
        const isSameDay = sameDate[currentIndex].SameDay === 'True';
        const registrationStatus = eventStatusMap[event.eventID];
        const isUserCreated = createdEvents.some(createdEvent => createdEvent.eventID === event.eventID);
        let buttonText = isUserCreated ? 'Manage Event' :
          registrationStatus === 'Waitlisted' ? 'Waitlisted' :
            (registrationStatus === 'Pending' || registrationStatus === 'Approved') ? 'Registered' : 'Register';

        const eventDateHTML = isSameDay
          ? `<span class="event-date">${startDateTime[currentIndex].formattedDate} - ${endTime[currentIndex].endTime}</span>`
          : `<span class="event-date">${startDateTime[currentIndex].formattedDate} - ${endDateTime[currentIndex].formattedDate}</span>`;

        article.style = `background: url('${event.featureImage}') center/cover no-repeat;`;

        article.innerHTML = `
    <button class="close-btn" onclick="closePopup()">&times;</button>
    <div class="popup-event-content">
      ${eventDateHTML}
      <div class="popup-event-title">${event.eventName}</div>
      <div class="popup-event-category">${event.category}</div>
      <div class="popup-event-description">${event.description}</div>
      <div class="popup-event-location">Location: <i>${event.location}</i></div>
      <button class="popup-register-button" ${isUserCreated ? `onclick="window.location.href='/event/${event.eventID}'"` : ''} data-event-id="${event.eventID}">
        ${buttonText}
      </button>
    </div>
  `;

        if (!isUserCreated && !registrationStatus) {
          const popupRegBtn = article.querySelector('.popup-register-button');
          popupRegBtn.addEventListener('click', () => {
            const confirmed = confirm("Are you sure you want to register for this event?");
            if (!confirmed) return;

            fetch('/register-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventID: event.eventID, requireApproval: event.requireApproval })
            })
              .then(res => res.json())
              .then(data => {
                if (!data.success) {
                  toastData.danger.title = "Registration Failed!";
                  toastData.danger.message = data.message;
                  showToast('danger');
                  return;
                }

                popupRegBtn.textContent = data.status === 'Waitlisted' ? 'Waitlisted' : 'Registered';
                popupRegBtn.disabled = true;

                if (data.status === 'Waitlisted') {
                  toastData.info.title = "You're on Waitlist!";
                  toastData.info.message = data.message;
                  showToast('info');
                } else {
                  toastData.success.message = data.message;
                  showToast('success');
                }
              })
              .catch(err => console.error('Registration error:', err));
          });
        }

        openPopup();
      });



      //  CATEGORY
      div3.innerHTML = `
      <div class="card-wrap" data-event-index="${index}" data-category="${event.category}"
        data-image="${event.featureImage}">
        <div class="card">
          <div class="card-bg"></div>
          <div class="card-info">
            <h1>${event.eventName}</h1>
          </div>
        </div>
      </div>`

      app.appendChild(div3);

      div3.querySelector('.card-wrap').addEventListener('click', () => {
        article.style = `background: url('${event.featureImage}') center/cover no-repeat;`;

        if (buttonText == 'Manage Event') {

          article.innerHTML = `
    <button class="close-btn" onclick="closePopup()">&times;</button>
    <div class="popup-event-content">
      ${eventDateHTML}
      <div class="popup-event-title">${event.eventName}</div>
      <div class="popup-event-category">${event.category}</div>
      <div class="popup-event-description">${event.description}</div>
      <div class="popup-event-location">Location: <i>${event.location}</i></div>
      <button class="popup-register-button" onclick="window.location.href='/event/${event.eventID}'" data-event-id="${event.eventID}">
      ${buttonText}
    </button>
    </div>
  `;

        }
        else {

          article.innerHTML = `
    <button class="close-btn" onclick="closePopup()">&times;</button>
    <div class="popup-event-content">
      ${eventDateHTML}
      <div class="popup-event-title">${event.eventName}</div>
      <div class="popup-event-category">${event.category}</div>
      <div class="popup-event-description">${event.description}</div>
      <div class="popup-event-location">Location: <i>${event.location}</i></div>
      <button class="popup-register-button" data-event-id="${event.eventID}">
      ${buttonText}
    </button>
    </div>
  `;

          const popupRegBtn = article.querySelector('.popup-register-button');
          popupRegBtn.disabled = registrationStatus === 'Registered' || registrationStatus === 'Waitlisted';

          if (!registrationStatus) {
            popupRegBtn.addEventListener('click', () => {
              const confirmed = confirm("Are you sure you want to register for this event?");
              if (!confirmed) return;

              fetch('/register-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventID: event.eventID, requireApproval: event.requireApproval })
              })
                .then(res => res.json())
                .then(data => {
                  if (!data.success) {
                    toastData.danger.title = "Registration Failed!";
                    toastData.danger.message = data.message; //show backend error

                    showToast('danger');
                    return;
                  }
                  popupRegBtn.textContent = data.status === 'Waitlisted' ? 'Waitlisted' : 'Registered';
                  popupRegBtn.disabled = true;

                  if (popupRegBtn.textContent == 'Registered') {
                    toastData.success.message = data.message; //show backend error
                    showToast('success');
                    return;
                  }
                  else if (popupRegBtn.textContent == 'Waitlisted') {
                    toastData.info.title = "You're on Waitlist!";
                    toastData.info.message = data.message; //show backend error
                    showToast('info');
                    return;
                  }

                })
                .catch(err => {
                  console.error('Registration error:', err);
                });

            });
          }

        }


        openPopup();
      });


    });



    function initializeCarousel() {
      const cards = document.querySelectorAll(".carousell-card");
      const eventName = document.querySelector(".carousel-event-name");
      const eventCategory = document.querySelector(".carousel-event-category");
      const leftArrow = document.querySelector(".nav-arrow.left");
      const rightArrow = document.querySelector(".nav-arrow.right");
      const carouselWrapper = document.querySelector(".carousel-wrapper");


      let currentIndex = 0;
      let isAnimating = false;
      let autoSlideInterval = null;
      const autoSlideDelay = 3000;

      function updateCarousel(newIndex) {
        if (isAnimating) return;
        isAnimating = true;

        currentIndex = (newIndex + cards.length) % cards.length;

        window.currentIndex = currentIndex;

        cards.forEach((card, i) => {
          const offset = (i - currentIndex + cards.length) % cards.length;

          card.classList.remove(
            "center",
            "left-1",
            "left-2",
            "right-1",
            "right-2",
            "hidden"
          );

          if (offset === 0) {
            card.classList.add("center");
          } else if (offset === 1) {
            card.classList.add("right-1");
          } else if (offset === 2) {
            card.classList.add("right-2");
          } else if (offset === cards.length - 1) {
            card.classList.add("left-1");
          } else if (offset === cards.length - 2) {
            card.classList.add("left-2");
          } else {
            card.classList.add("hidden");
          }
        });

        eventName.style.opacity = "0";
        eventCategory.style.opacity = "0";

        setTimeout(() => {
          if (eventsCarousel[currentIndex]) {
            eventName.textContent = eventsCarousel[currentIndex].name;
            eventCategory.textContent = eventsCarousel[currentIndex].category;
            learMoreBtn.id = eventsCarousel[currentIndex].eventID;

          }
          eventName.style.opacity = "1";
          eventCategory.style.opacity = "1";
        }, 300);

        setTimeout(() => {
          isAnimating = false;
        }, 800);
      }

      function startAutoSlide() {
        if (autoSlideInterval) return;
        autoSlideInterval = setInterval(() => {
          updateCarousel(currentIndex + 1);
        }, autoSlideDelay);
      }

      function stopAutoSlide() {
        if (autoSlideInterval) {
          clearInterval(autoSlideInterval);
          autoSlideInterval = null;
        }
      }

      if (carouselWrapper) {
        carouselWrapper.addEventListener("mouseenter", stopAutoSlide);
        carouselWrapper.addEventListener("mouseleave", startAutoSlide);
      }

      if (leftArrow) {
        leftArrow.addEventListener("click", () => {
          stopAutoSlide();
          updateCarousel(currentIndex - 1);
          setTimeout(startAutoSlide, 1000);
        });
      }

      if (rightArrow) {
        rightArrow.addEventListener("click", () => {
          stopAutoSlide();
          updateCarousel(currentIndex + 1);
          setTimeout(startAutoSlide, 1000);
        });
      }

      cards.forEach((card, i) => {
        card.addEventListener("click", () => {
          stopAutoSlide();
          updateCarousel(i);
          setTimeout(startAutoSlide, 1000);
        });
      });


      //touch/swipe navigation hehe
      let touchStartX = 0;
      let touchEndX = 0;

      document.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });

      document.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      });

      function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
          stopAutoSlide();
          if (diff > 0) {
            updateCarousel(currentIndex + 1);
          } else {
            updateCarousel(currentIndex - 1);
          }
          setTimeout(startAutoSlide, 1000);
        }
      }

      updateCarousel(0);
      startAutoSlide();
    }


    initializeCarousel();


  }

  catch (error) {
    console.error('Error fetching data ', error);
  }

  function attachCardHoverListeners() {
    document.querySelectorAll(".card-wrap").forEach((cardWrap) => {
      const card = cardWrap.querySelector(".card");
      const cardBg = card.querySelector(".card-bg");

      cardBg.style.backgroundImage = `url("${cardWrap.dataset.image}")`;

      const width = card.offsetWidth;
      const height = card.offsetHeight;

      cardWrap.addEventListener("mousemove", (e) => {
        const bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left - width / 2;
        const mouseY = e.clientY - bounds.top - height / 2;

        const px = mouseX / width;
        const py = mouseY / height;

        const rX = px * 30;
        const rY = py * -30;
        const tX = px * -40;
        const tY = py * -40;

        card.style.transform = `rotateY(${rX}deg) rotateX(${rY}deg)`;
        cardBg.style.transform = `translateX(${tX}px) translateY(${tY}px)`;
      });

      cardWrap.addEventListener("mouseleave", () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        cardBg.style.transform = `translateX(0px) translateY(0px)`;
      });
    });
  }

  attachCardHoverListeners();

  document.querySelectorAll(".image-card").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.category;

      const hoverSection = document.getElementById("hover-cards-section");
      const carouselSection = document.getElementById("carousel-section");

      hoverSection.classList.add("active");
      carouselSection.style.display = "none";

      const cards = hoverSection.querySelectorAll(".card-wrap");
      cards.forEach((card) => {
        const cardCategory = card.dataset.category;
        card.style.display = cardCategory === selectedCategory ? "block" : "none";
      });

      hoverSection.scrollIntoView({ behavior: "smooth" });

      attachCardHoverListeners();
    });
  });



});

const overlay = document.getElementById("popupOverlay");

function openPopup() {
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
window.closePopup = openPopup;

function closePopup() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

window.closePopup = closePopup;

overlay.addEventListener('click', e => {
  if (e.target === overlay) closePopup();
});

document.addEventListener('keydown', e => {
  if (e.key === "Escape" && overlay.classList.contains('active')) {
    closePopup();
  }
});


