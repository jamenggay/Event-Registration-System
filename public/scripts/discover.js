//BACKEND SCRIPT

document.addEventListener("DOMContentLoaded", async () => {
  const eventList = document.getElementById("events-list");
  const thumbnail = document.getElementById("next-event")
  const app = document.getElementById("app");
  const overlay = document.getElementById("popupOverlay");


  try {
    const res1 = await fetch('/event-details');
    const res2 = await fetch('/api/formatStartDate');
    const res3 = await fetch('/api/formatEndDate');
    const res4 = await fetch('/api/compareDate');
    const res5 = await fetch('/api/endTime');
    const res6 = await fetch('api/user-registrations');
    const events = await res1.json();
    const startDateTime = await res2.json();
    const endDateTime = await res3.json();
    const sameDate = await res4.json();
    const endTime = await res5.json();
    const registeredEvent = await res6.json();
    const registeredEventIDs = registeredEvent.registeredEventIDs;
    const article = document.createElement('article');
    article.className = "card-popup";
  
      

        events.forEach((event, index) => {
      
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
    
      console.log (currentEvent);
        
      div1.className = "item";
      div2.className = "item";
      div3.className = "popupContainer";
      
      

      const isSameDay = sameDate[index].SameDay === 'True';
      const isRegistered = registeredEventIDs.includes(event.eventID);

      const eventDateHTML = isSameDay
        ? `<span class="event-date">${startDateTime[index].formattedDate} - ${endTime[index].endTime}</span>`
        : `<span class="event-date">${startDateTime[index].formattedDate} - ${endDateTime[index].formattedDate}</span>`;

      div1.innerHTML = `
    
        <img src="${event.featureImage}">
        <div class="event-content">
        ${eventDateHTML}
          <h2 class="event-title">${event.eventName}</h2>
          <p class="event-description">${event.description}</p>
          <p class="event-location">${event.location}</p>
          <button class="register-button" data-event-id="${event.eventID}">${isRegistered ? 'Registered' : 'Register'}</button>
        </div>`;

      eventList.appendChild(div1);

      const button = div1.querySelector('.register-button');
      button.disabled = isRegistered;

      if (!isRegistered) {
        button.addEventListener('click', () => {
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
                alert(data.message); // Show backend error message
                return;
              }
              button.textContent = 'Registered';
              button.disabled = true;
              alert(data.message);
            })
            .catch(err => {
              console.error('Registration error:', err);
            });

        });
      }

      div2.innerHTML =
        `<img src="${event.featureImage}">`;

      thumbnail.appendChild(div2);

      div3.innerHTML = `
      <div class="card-wrap" onclick="openPopup()" data-category="${event.category}"
        data-image="${event.featureImage}">
        <div class="card">
          <div class="card-bg"></div>
          <div class="card-info">
            <h1>${event.eventName}</h1>
          </div>
        </div>
      </div>`

      app.appendChild(div3);

    const isSameDayPopup   = sameDate[index].SameDay === 'True';
    const eventDatePopup = isSameDayPopup
      ? `<div class="popup-event-date"">${startDateTime[index].formattedDate} - ${endTime[index].endTime}</div>`
        : `<div class="popup-event-date">${startDateTime[index].formattedDate} - ${endDateTime[index].formattedDate}</div>`;
      article.innerHTML = `
      <button class="close-btn" onclick="closePopup()">&times;</button>
      <div class="popup-event-content">
        ${eventDatePopup}
        <div class="popup-event-title">${events[index].eventName}</div>
        <div class="popup-event-category">${events[index].category}</div>
        <div class="popup-event-description">${events[index].description}</div>
        <div class="popup-event-location">Location: <i>${events[index].location}</i></div>
        <button class="popup-register-button" data-event-id="${events[index].eventID}">${isRegistered ? 'Registered' : 'Register'}</button>
      </div>`;
      overlay.appendChild(article);


    });

      }
    
  catch (error) {
    console.error('Error fetching data ', error);
  }


  //FRONTEND SCRIPT
  const wordElement = document.getElementById("dynamic-word");
  let isExperience = true;

  setInterval(() => {
    isExperience = !isExperience;
    wordElement.textContent = isExperience ? " Experience" : " Event";
    wordElement.className = isExperience ? "experience" : "event";
    wordElement.id = "dynamic-word";
  }, 2000);

  //--------------------------
  let nextDom = document.getElementById("next");
  let prevDom = document.getElementById("prev");

  let carouselDom = document.querySelector(".carousel");
  let SliderDom = carouselDom.querySelector(".carousel .list");
  let thumbnailBorderDom = document.querySelector(".carousel .thumbnail");
  let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll(".carousel .thumbnail .item");

  thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);

  let timeRunning = 3000;
  let timeAutoNext = 7000;
  let runTimeOut;
  let runNextAuto = setTimeout(() => nextDom.click(), timeAutoNext);

  function showThumbnail() {
    thumbnailBorderDom.style.opacity = "1";
    thumbnailBorderDom.style.pointerEvents = "auto";
  }

  function hideThumbnail() {
    thumbnailBorderDom.style.opacity = "0";
    thumbnailBorderDom.style.pointerEvents = "none";
  }

  function showSlider(type) {
    let SliderItemsDom = SliderDom.querySelectorAll(".carousel .list .item");
    let thumbnailItemsDom = document.querySelectorAll(".carousel .thumbnail .item");

    if (type === "next") {
      SliderDom.appendChild(SliderItemsDom[0]);
      thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
      carouselDom.classList.add("next");
    } else {
      SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
      thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
      carouselDom.classList.add("prev");
    }

    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
      carouselDom.classList.remove("next", "prev");
    }, timeRunning);

    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => nextDom.click(), timeAutoNext);
  }

  nextDom.onclick = () => {
    showSlider("next");
    showThumbnail();
  };

  prevDom.onclick = () => {
    showSlider("prev");
    showThumbnail();
  };

  carouselDom.addEventListener("mouseenter", () => {
    clearTimeout(runNextAuto);
    hideThumbnail();
  });

  carouselDom.addEventListener("mouseleave", () => {
    showThumbnail();
    runNextAuto = setTimeout(() => nextDom.click(), timeAutoNext);
  });

  [nextDom, prevDom].forEach((btn) => {
    btn.addEventListener("mouseenter", showThumbnail);
  });

  function attachCardHoverListeners() {
    document.querySelectorAll(".card-wrap").forEach((cardWrap) => {
      const card = cardWrap.querySelector(".card");
      const cardBg = card.querySelector(".card-bg");
      // const imageUrl = 

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
  if (e.target === overlay) closePopup();
});

document.addEventListener('keydown', e => {
  if (e.key === "Escape" && overlay.classList.contains('active')) {
    closePopup();
  }
});

