document.addEventListener("DOMContentLoaded", () => {
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
    const imageUrl = cardWrap.dataset.image;

    cardBg.style.backgroundImage = `url(${imageUrl})`;

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
    if(e.target === overlay) closePopup();
  });

  document.addEventListener('keydown', e => {
    if(e.key === "Escape" && overlay.classList.contains('active')) {
      closePopup();
    }
  });
});

