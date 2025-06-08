//BACKEND SCRIPTSSS
import { toastData, showToast } from "./alert-toast.js";


function showCarousel() {
  const carousel = document.getElementById("carousel-section");
  const hoverCards = document.getElementById("hover-cards-section");

  carousel.style.display = "block";
  hoverCards.classList.remove("active");
  hoverCards.style.display = "none"; // Hide the entire hover cards section

  // Hide all .card-wrap elements globally
  document.querySelectorAll(".card-wrap").forEach((card) => {
    card.style.display = "none";
  });

  carousel?.scrollIntoView({ behavior: "smooth" });
}

window.showCarousel = showCarousel;

document.addEventListener("DOMContentLoaded", async () => {
  // Ensure only carousel is visible on load
  const hoverCardsSection = document.getElementById("hover-cards-section");
  const carouselSection = document.getElementById("carousel-section");
  if (hoverCardsSection) {
    hoverCardsSection.classList.remove("active");
    hoverCardsSection.style.display = "none";
  }
  if (carouselSection) {
    carouselSection.style.display = "block";
  }

  const carousellTrack = document.getElementById("carousell-trackID");
  const eventDetails = document.getElementById("event-details")
  const app = document.getElementById("app");
  const overlay = document.getElementById("popupOverlay");
  const learMoreBtn = document.getElementById("LearnMore-btn");


    const wordElement = document.getElementById("dynamic-word");
  let isExperience = true;

  setInterval(() => {
    isExperience = !isExperience;
    wordElement.textContent = isExperience ? " Experience" : " Event";
    wordElement.className = isExperience ? "experience" : "event";
    wordElement.id = "dynamic-word";
  }, 2000);


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



    let eventStatusMap = {};
    registeredData.registrations.forEach(reg => {
      eventStatusMap[reg.eventID] = reg.status;
    });
    // Make eventStatusMap globally accessible
    window.eventStatusMap = eventStatusMap;



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




      // Always get the latest registration status from window.eventStatusMap
      const registrationStatus = window.eventStatusMap[event.eventID];

      const isSameDay = sameDate[index].SameDay === 'True';
      const isUserCreated = createdEvents.some(createdEvent => createdEvent.eventID === event.eventID);
      let buttonText = 'Register';
      if (isUserCreated) {
        buttonText = 'Manage Event';
      }
      else {
        if (registrationStatus === 'Waitlisted') {
          buttonText = 'Waitlisted';
        } else if (registrationStatus === 'Pending' || registrationStatus === 'Approved' || registrationStatus === 'Declined') {
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
            (registrationStatus === 'Pending' || registrationStatus === 'Approved' || registrationStatus == 'Declined') ? 'Registered' : 'Register';

        const eventDateHTML = isSameDay
          ? `<span class="event-date">${startDateTime[currentIndex].formattedDate} - ${endTime[currentIndex].endTime}</span>`
          : `<span class="event-date">${startDateTime[currentIndex].formattedDate} - ${endDateTime[currentIndex].formattedDate}</span>`;


        overlay.innerHTML = `
        <article class="card-popup">
    <div class="card-image" style="background: url('${event.featureImage}') center/cover no-repeat">
              <span class="popup-event-date">${eventDateHTML}</span>
              <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
              <div class="scroll-down-indicator mobile-hide">Scroll down ↓</div>
      </div>
      
      <div class="card-content theme-${event.themeIndex}">
        <h2 class="popup-event-title">${event.eventName}</h2>
        <div class="popup-event-category category-${event.category}" style="color: var(--category-color-${event.category});">${event.category}</div>
        <p class="popup-event-description">${event.description}</p>
        <div class="popup-event-location">Location: <i>${event.location}</i></div>
        <div class="card-actions">
        <button class="popup-register-button" ${isUserCreated ? `onclick=\"window.location.href='/event/${event.eventID}'\"` : ''} data-event-id="${event.eventID}">
          ${buttonText}
        </button>
        </div>
    </div>

    </article>

    <div class="cancel-popup-overlay"></div>
      <div class="cancel-popup">
        <h3>Register Event</h3>
        <p>Are you sure you want to register for this event?</p>
        <div class="cancel-popup-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn" type="button">Confirm</button>
        </div>
      </div>
  `;
        // Attach close button event
        const closeBtn = overlay.querySelector('.close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closePopup);

        const popupRegBtn = overlay.querySelector('.popup-register-button');
        if (popupRegBtn) {
          popupRegBtn.disabled = registrationStatus === 'Registered' || registrationStatus === 'Waitlisted';
        }

        if (!registrationStatus && popupRegBtn) {
          popupRegBtn.addEventListener('click', () => {
            overlay.querySelector('.cancel-popup').classList.add('active');
            overlay.querySelector('.cancel-popup-overlay').classList.add('active');

            overlay.querySelector('.cancel-popup .cancel-btn').addEventListener('click', () => {
              overlay.querySelector('.cancel-popup').classList.remove('active');
              overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
            });

            overlay.querySelector('.confirm-btn').addEventListener('click', () => {
              fetch('/register-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventID: event.eventID, requireApproval: event.requireApproval })
              })
                .then(res => res.json())
                .then(data => {
                  if (!data.success) {
                    overlay.querySelector('.cancel-popup').classList.remove('active');
                    overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
                    toastData.danger.title = "Registration Failed!";
                    toastData.danger.message = data.message;
                    showToast('danger');
                    return;
                  } 

                  // Update global eventStatusMap
                  window.eventStatusMap[event.eventID] = data.status;
                  popupRegBtn.textContent = data.status === 'Waitlisted' ? 'Waitlisted' : 'Registered';
                  popupRegBtn.disabled = true;

                  if (data.status === 'Waitlisted') {
                    overlay.querySelector('.cancel-popup').classList.remove('active');
                    overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
                    toastData.info.title = "You're on Waitlist!";
                    toastData.info.message = data.message;
                    showToast('info');
                  } else {
                    overlay.querySelector('.cancel-popup').classList.remove('active');
                    overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
                    toastData.success.message = data.message;
                    showToast('success');
                  }
                })
                .catch(err => console.error('Registration error:', err));

            });

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
      

        // Always get the latest registration status from window.eventStatusMap
        const registrationStatus = window.eventStatusMap[event.eventID];
        let buttonText = 'Register';
        if (isUserCreated) {
          buttonText = 'Manage Event';
        } else if (registrationStatus === 'Waitlisted') {
          buttonText = 'Waitlisted';
        } else if (registrationStatus === 'Pending' || registrationStatus === 'Approved' || registrationStatus === 'Declined') {
          buttonText = 'Registered';
        }

        if (buttonText == 'Manage Event') {

          overlay.innerHTML = `
          <article class="card-popup">
    <div class="card-image" style="background: url('${event.featureImage}') center/cover no-repeat">
              <span class="popup-event-date">${eventDateHTML}</span>
              <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
              <div class="scroll-down-indicator mobile-hide">Scroll down ↓</div>
      </div>
    <div class="card-content theme-${event.themeIndex}">
      <div class="popup-event-title">${event.eventName}</div>
      <div class="popup-event-category category-${event.category}" style="color: var(--category-color-${event.category});">${event.category}</div>
      <div class="popup-event-description">${event.description}</div>
      <div class="popup-event-location">Location: <i>${event.location}</i></div>
      <div class="card-actions">
      <button class="popup-register-button" onclick="window.location.href='/event/${event.eventID}'" data-event-id="${event.eventID}">
      ${buttonText}
    </button>
    </div>
    </div>
          </article>
    <div class="cancel-popup-overlay"></div>
      <div class="cancel-popup">
        <h3>Register Event</h3>
        <p>Are you sure you want to register for this event?</p>
        <div class="cancel-popup-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn" type="button">Confirm</button>
        </div>
      </div>
  `;
          // Attach close button event
          const closeBtn = overlay.querySelector('.close-btn');
          if (closeBtn) closeBtn.addEventListener('click', closePopup);

        }
        else {

          overlay.innerHTML = `
          <article class="card-popup">
    <div class="card-image" style="background: url('${event.featureImage}') center/cover no-repeat">
              <span class="popup-event-date">${eventDateHTML}</span>
              <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
              <div class="scroll-down-indicator mobile-hide">Scroll down ↓</div>
      </div>
     <div class="card-content theme-${event.themeIndex}">
      <div class="popup-event-title">${event.eventName}</div>
      <div class="popup-event-category category-${event.category}" style="color: var(--category-color-${event.category});">${event.category}</div>
      <div class="popup-event-description">${event.description}</div>
      <div class="popup-event-location">Location: <i>${event.location}</i></div>
      <div class="card-actions">
      <button class="popup-register-button" data-event-id="${event.eventID}">
      ${buttonText}
    </button>
    </div>
    </div>
    </article>

    <div class="cancel-popup-overlay"></div>
      <div class="cancel-popup">
        <h3>Register Event</h3>
        <p>Are you sure you want to register for this event?</p>
        <div class="cancel-popup-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn" type="button">Confirm</button>
        </div>
      </div>
  `;
          // Attach close button event
          const closeBtn = overlay.querySelector('.close-btn');
          if (closeBtn) closeBtn.addEventListener('click', closePopup);

          const popupRegBtn = overlay.querySelector('.popup-register-button');
          if (popupRegBtn) {
            popupRegBtn.disabled = registrationStatus === 'Registered' || registrationStatus === 'Waitlisted';
          }

          if (!registrationStatus && popupRegBtn) {
            popupRegBtn.addEventListener('click', () => {
              overlay.querySelector('.cancel-popup').classList.add('active');
              overlay.querySelector('.cancel-popup-overlay').classList.add('active');

              overlay.querySelector('.cancel-popup .cancel-btn').addEventListener('click', () => {
                overlay.querySelector('.cancel-popup').classList.remove('active');
                overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
              });

              overlay.querySelector('.confirm-btn').addEventListener('click', () => {
                fetch('/register-event', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventID: event.eventID, requireApproval: event.requireApproval })
                })
                  .then(res => res.json())
                  .then(data => {
                    if (!data.success) {
                      overlay.querySelector('.cancel-popup').classList.remove('active');
                      overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
                      toastData.danger.title = "Registration Failed!";
                      toastData.danger.message = data.message; //show backend error
                      showToast('danger');
                      return;
                    }
                    // Update global eventStatusMap
                    window.eventStatusMap[event.eventID] = data.status;
                    popupRegBtn.textContent = data.status === 'Waitlisted' ? 'Waitlisted' : 'Registered';
                    popupRegBtn.disabled = true;
                    if (popupRegBtn.textContent == 'Registered') {
                      overlay.querySelector('.cancel-popup').classList.remove('active');
                      overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
                      toastData.success.message = data.message; //show backend error
                      showToast('success');
                      return;
                    }
                    else if (popupRegBtn.textContent == 'Waitlisted') {
                      overlay.querySelector('.cancel-popup').classList.remove('active');
                      overlay.querySelector('.cancel-popup-overlay').classList.remove('active');
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

        const totalCards = cards.length;

        window.currentIndex = currentIndex;

        cards.forEach((card, i) => {
          let offset = i - currentIndex;

          if (totalCards > 2) {
            if (offset > totalCards / 2) {
              offset -= totalCards;
            }
            else if (offset < -totalCards / 2) {
              offset += totalCards;
            }
          }

          card.classList.remove(
            "center",
            "left-1",
            "left-2",
            "right-1",
            "right-2",
            "hidden"
          );


          if (totalCards === 1) {
            card.classList.add("center");
          }
          else if (offset === 0) {
            card.classList.add("center");
          }
          else if (offset === 1) {
            card.classList.add("right-1");
          }
          else if (offset === -1) {
            card.classList.add("left-1");
          }
          else if (offset === 2 && totalCards >= 4) {
            card.classList.add("right-2");
          }
          else if (offset === -2 && totalCards >= 5) {
            card.classList.add("left-2");
          }
          else {
            card.classList.add("hidden");
          }
          // if (offset === 0) {
          //   card.classList.add("center");
          // } else if (offset === 1) {
          //   card.classList.add("right-1");
          // } else if (offset === 2) {
          //   card.classList.add("right-2");
          // } else if (offset === cards.length - 1) {
          //   card.classList.add("left-1");
          // } else if (offset === cards.length - 2) {
          //   card.classList.add("left-2");
          // } else {
          //   card.classList.add("hidden");
          // }
        });

        eventName.style.opacity = "0";
        eventCategory.style.opacity = "0";

        setTimeout(() => {
          if (eventsCarousel[currentIndex]) {
            eventName.textContent = eventsCarousel[currentIndex].name;
            eventCategory.textContent = eventsCarousel[currentIndex].category;
            // learMoreBtn.id = eventsCarousel[currentIndex].eventID;

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
      
      const cardCategoryH1 = document.getElementById("card-category");
      cardCategoryH1.textContent = selectedCategory;
     
      cardCategoryH1.className = "about-title category-" + selectedCategory;

      const hoverSection = document.getElementById("hover-cards-section");
      const carouselSection = document.getElementById("carousel-section");
      hoverSection.classList.add("active");
      hoverSection.style.display = "block"; // Show the hover cards section
      carouselSection.style.display = "none";

      // Show only the relevant .card-wrap elements
      document.querySelectorAll(".card-wrap").forEach((card) => {
        const cardCategory = card.dataset.category;
        window.cardCategory = cardCategory;
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



