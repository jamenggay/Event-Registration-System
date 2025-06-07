import { toastData, showToast } from "./alert-toast.js";

document.addEventListener("DOMContentLoaded", async () => {
  let eventsData = null;
  let pastEvents;
  let userRatings = [];

  try {
    const res = await fetch("/api/past-events");
    pastEvents = await res.json();

    const response = await fetch("/events-registered", {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Events Registered: ", result);
      eventsData = result;
    } else {
      const error = await response.json();
      console.log("Backend Failed: ", error);
    }
  } catch (e) {
    console.log("Client Error: ", e);
  }

  fetch("/get-rating")
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.rating)) {
        userRatings = data.rating;
      } else {
        console.error("Expected data.rating to be an array, got:", data.rating);
      }
    });

  function getUserRatingForEvent(eventID) {
    const ratingEntry = userRatings.find((r) => r.eventID === eventID);

    return ratingEntry ? ratingEntry.rating : 0;
  }

  const eventSection = document.querySelector(".event-section");
  const eventsContainer = document.createElement("div");
  eventsContainer.id = "events-container";
  const noEventsPlaceholder = document.querySelector(".no-events-wrapper");

  if (!eventsData || eventsData.length === 0) {
    noEventsPlaceholder.style.display = "flex";
    eventsContainer.style.display = "none";
  } else {
    noEventsPlaceholder.style.display = "none";
    eventsContainer.style.display = "block";
  }

  eventsData.sort(
    (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
  );

  eventsContainer.innerHTML = eventsData

    .map((event) => {
      const statusClass =
        event.status === "Approved"
          ? "going"
          : event.status === "Declined"
          ? "declined"
          : event.status === "Pending"
          ? "pending"
          : "waitlisted";

      const status =
        event.status === "Approved"
          ? "Going"
          : event.status === "Declined"
          ? "Declined"
          : event.status === "Pending"
          ? "Pending"
          : "Waitlisted";

      const startYear = new Date(event.startDateTime).getFullYear();
      const endYear = new Date(event.endDateTime).getFullYear();

      const currentYear = new Date().getFullYear();
      const yearPassed = endYear < currentYear;
      const isPast = pastEvents.some(
        (pastEvent) => pastEvent.eventID === event.eventID
      );

      let formattedDate = event.formattedStartDateTime.split(",")[0];

      // if (yearPassed) {
      //   if (event.sameDay == "True") {
      //     formattedDate = `${event.formattedStartDateTime.split(",")[0]
      //       }, ${endYear}`;
      //   } else if (event.sameMonth == "True") {
      //     const startDay = event.formattedStartDateTime.split(",")[0];
      //     const endDay = event.formattedEndDateTime.split(",")[0].split(" ")[1];
      //     formattedDate = `${startDay} - ${endDay}, ${endYear}`;
      //   } else if (event.sameYear == "True") {
      //     const start = event.formattedStartDateTime.split(",")[0];
      //     const end = event.formattedEndDateTime.split(",")[0];
      //     formattedDate = `${start} - ${end}, ${endYear}`;
      //   } else {
      //     const start = event.formattedStartDateTime.split(",")[0];
      //     const end = event.formattedEndDateTime.split(",")[0];
      //     formattedDate = `${start}, ${startYear} - ${end}, ${endYear}`;
      //   }
      // } else if (event.sameDay == "True") {
      //   formattedDate = event.formattedStartDateTime.split(",")[0];
      // } else if (event.sameMonth == "True") {
      //   const startDay = event.formattedStartDateTime.split(",")[0];
      //   const endDay = event.formattedEndDateTime.split(",")[0].split(" ")[1];
      //   formattedDate = `${startDay}`;
      // } else if (event.sameYear == "True") {
      //   const start = event.formattedStartDateTime.split(",")[0];
      //   const end = event.formattedEndDateTime.split(",")[0];
      //   formattedDate = `${start} - ${end}`;
      // } else {
      //   const start = event.formattedStartDateTime.split(",")[0];
      //   const end = event.formattedEndDateTime.split(",")[0];
      //   formattedDate = `${start}, ${startYear} - ${end}, ${endYear}`;
      // }

      let formattedDay;

      if (event.sameDay == "True") {
        formattedDay = new Date(event.startDateTime).toLocaleString("en-US", {
          weekday: "long",
        });
      } else {
        const startDay = new Date(event.startDateTime).toLocaleString("en-US", {
          weekday: "long",
          timeZone: "UTC",
        });

        formattedDay = `${startDay}`;
      }

      if (isPast) {
        return `
                <div class="event-group" data-date="${event.startDateTime}">
                  <div class="event-date">
                    <strong>${formattedDate}</strong>
                    <span class="weekday">${formattedDay}</span>
                  </div>

                  <div class="event-cards">
                    <div class="event-card theme-${event.themeIndex}">
                      <div class="event-info">
                        <div class="event-time">${event.formattedStartTime} - ${event.formattedEndTime}</div>
                        <div class="event-title">
                          ${event.eventName}
                        </div>
                        <div class="event-meta">
                          <span><img src="${event.profilePic}" onerror="this.onerror=null; this.src='../assets/icons/profile-icon.jpeg'" alt="Profile">${event.fullName}<br><br></span>
                          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2 6.854C2 11.02 7.04 15 8 15s6-3.98 6-8.146C14 3.621 11.314 1 8 1S2 3.62 2 6.854"></path><path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path></g></svg> ${event.location}</span>
                        </div>
                      </div>
                      <img class="event-thumbnail"
                        src="${event.featureImage}"
                        alt="Event Thumbnail" />
                    </div>
                  </div>
                </div> 
              `;
      } else {
        if (status)
          return `
                <div class="event-group" data-date="${event.startDateTime}">
                  <div class="event-date">
                    <strong>${formattedDate}</strong>
                    <span class="weekday">${formattedDay}</span>
                  </div>

                  <div class="event-cards">
                    <div class="event-card theme-${event.themeIndex}">
                      <div class="event-info">
                        <div class="event-time">${event.formattedStartTime} - ${event.formattedEndTime}</div>
                        <div class="event-title">
                          ${event.eventName}
                        </div>
                        <div class="event-meta">
                          <span><img src="${event.profilePic}" onerror="this.onerror=null; this.src='../assets/icons/profile-icon.jpeg'" alt="Profile">${event.fullName}<br><br></span>
                          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2 6.854C2 11.02 7.04 15 8 15s6-3.98 6-8.146C14 3.621 11.314 1 8 1S2 3.62 2 6.854"></path><path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path></g></svg> ${event.location}</span>
                        </div>
                        <div class="event-status ${statusClass}">${status}</div>
                      </div>
                      <img class="event-thumbnail"
                        src="${event.featureImage}"
                        alt="Event Thumbnail" />
                    </div>
                  </div>
                </div> 
              `;
      }
    })
    .join("");

  eventSection.append(eventsContainer);

  const eventCards = document.querySelectorAll(".event-cards");
  let overlay = document.getElementById("popupOverlay");

  eventCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const event = eventsData[index];
      const statusClass =
        event.status == "Approved"
          ? "going"
          : event.status === "Declined"
          ? "declined"
          : event.status === "Pending"
          ? "pending"
          : "waitlisted";

      const status =
        event.status == "Approved"
          ? "You're going"
          : event.status === "Declined"
          ? "Declined"
          : event.status === "Pending"
          ? "Pending"
          : "Waitlisted";

      const optionsDate = { month: "long", day: "numeric", year: "numeric" };
      const startYear = new Date(event.startDateTime).getFullYear();

      let formattedDate;

      if (event.sameDay == "True") {
        const startDay = event.formattedStartDateTime.split(",")[0];
        formattedDate = `${startDay}`;
      } else if (event.sameMonth == "True") {
        const startDay = event.formattedStartDateTime.split(",")[0];
        const endDay = event.formattedEndDateTime.split(",")[0].split(" ")[1];
        formattedDate = `${startDay} - ${endDay}`;
      } else if (event.sameYear == "True") {
        const start = event.formattedStartDateTime.split(",")[0];
        const end = event.formattedEndDateTime.split(",")[0];
        formattedDate = `${start} - ${end}`;
      } else {
        const start = new Date(event.startDateTime).toLocaleString(
          "en-US",
          optionsDate
        );
        const end = new Date(event.endDateTime).toLocaleString(
          "en-US",
          optionsDate
        );
        formattedDate = `${start} - ${end}`;
      }

      const isPast = pastEvents.some(
        (pastEvent) => pastEvent.eventID === event.eventID
      );
      if (isPast) {
        const currentRating = getUserRatingForEvent(event.eventID);

        overlay.innerHTML = `
        <article class="card-popup">
          <div class="card-image" style="background: url('${event.featureImage}') center/cover no-repeat">
              <span class="popup-event-date">${formattedDate}</span>
              <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
            </div>

          <div class="card-content theme-${event.themeIndex}">
            <h2 class="popup-event-title" id="eventTitle">${
              event.eventName
            }</h2>
            <p class="event-description" id="eventDesc">${event.description}</p>
            <p class="event-location">Location: ${event.location}</p>
            <div class="card-actions">
              <div class="feedback-box">
                <a href="${event.feedbackLink}" class="feedback-link">
                  <span>Feedback</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </a>
              </div>
              
              <form class="rating" id="eventRating"  >
                <div class="rating__stars">
                  <input class="rating__input rating__input-1" id="event-rating-1" type="radio" name="rating" value="1" ${
                    currentRating == 1 ? "checked" : ""
                  } />
                  <input class="rating__input rating__input-2" id="event-rating-2" type="radio" name="rating" value="2" ${
                    currentRating == 2 ? "checked" : ""
                  } />
                  <input class="rating__input rating__input-3" id="event-rating-3" type="radio" name="rating" value="3" ${
                    currentRating == 3 ? "checked" : ""
                  } />
                  <input class="rating__input rating__input-4" id="event-rating-4" type="radio" name="rating" value="4" ${
                    currentRating == 4 ? "checked" : ""
                  } />
                  <input class="rating__input rating__input-5" id="event-rating-5" type="radio" name="rating" value="5" ${
                    currentRating == 5 ? "checked" : ""
                  } />
                  <label class="rating__label" for="event-rating-1">
                    <svg class="rating__star" viewBox="0 0 24 24">
                      <path class="rating__star-fill" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z"/>
                      <path class="rating__star-stroke" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z" fill="none" stroke-width="2"/>
                    </svg>
                  </label>
                  <label class="rating__label" for="event-rating-2">
                    <svg class="rating__star" viewBox="0 0 24 24">
                      <path class="rating__star-fill" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z"/>
                      <path class="rating__star-stroke" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z" fill="none" stroke-width="2"/>
                    </svg>
                  </label>
                  <label class="rating__label" for="event-rating-3">
                    <svg class="rating__star" viewBox="0 0 24 24">
                      <path class="rating__star-fill" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z"/>
                      <path class="rating__star-stroke" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z" fill="none" stroke-width="2"/>
                    </svg>
                  </label>
                  <label class="rating__label" for="event-rating-4">
                    <svg class="rating__star" viewBox="0 0 24 24">
                      <path class="rating__star-fill" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z"/>
                      <path class="rating__star-stroke" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z" fill="none" stroke-width="2"/>
                    </svg>
                  </label>
                  <label class="rating__label" for="event-rating-5">
                    <svg class="rating__star" viewBox="0 0 24 24">
                      <path class="rating__star-fill" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z"/>
                      <path class="rating__star-stroke" d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.262L12 19.771l-7.416 4.087L6 15.596 0 9.748l8.332-1.73z" fill="none" stroke-width="2"/>
                    </svg>
                  </label>
                </div>
              </form>

            </div>
          </div>
        </article>
      `;

        const form = document.getElementById("eventRating");
        const eventID = form.dataset.eventId;

        // Fetch existing rating

        document
          .getElementById("event-rating-1")
          .addEventListener("click", async (e) => {
            const data = {
              eventID: event.eventID,
              rating: document.getElementById("event-rating-1").value,
            };

            const response = await fetch("/store-rating", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(data),
            });

            let result = await response.json();

            if (result.success) {
              toastData.info.title = "Notice:";
              toastData.info.message = "You rate this event 1 star.";
              showToast("info");
            } else {
              toastData.danger.message = "Event rating failed.";
              showToast("danger");
            }

            console.log("event-rating-1 clicked!");
          });

        document
          .getElementById("event-rating-2")
          .addEventListener("click", async (e) => {
            const data = {
              eventID: event.eventID,
              rating: document.getElementById("event-rating-2").value,
            };

            const response = await fetch("/store-rating", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(data),
            });

            let result = await response.json();

            if (result.success) {
              toastData.info.title = "Notice:";
              toastData.info.message = "You rate this event 2 stars.";
              showToast("info");
            } else {
              toastData.danger.message = "Event rating failed.";
              showToast("danger");
            }

            console.log("event-rating-2 clicked!");
          });

        document
          .getElementById("event-rating-3")
          .addEventListener("click", async (e) => {
            const data = {
              eventID: event.eventID,
              rating: document.getElementById("event-rating-3").value,
            };

            const response = await fetch("/store-rating", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(data),
            });

            let result = await response.json();

            if (result.success) {
              toastData.info.title = "Notice:";
              toastData.info.message = "You rate this event 3 stars.";
              showToast("info");
            } else {
              toastData.danger.message = "Event rating failed.";
              showToast("danger");
            }

            console.log("event-rating-3 clicked!");
          });

        document
          .getElementById("event-rating-4")
          .addEventListener("click", async (e) => {
            const data = {
              eventID: event.eventID,
              rating: document.getElementById("event-rating-4").value,
            };

            const response = await fetch("/store-rating", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(data),
            });

            let result = await response.json();

            if (result.success) {
              toastData.info.title = "Notice:";
              toastData.info.message = "You rate this event 4 stars.";
              showToast("info");
            } else {
              toastData.danger.message = "Event rating failed.";
              showToast("danger");
            }

            console.log("event-rating-4 clicked!");
          });

        document
          .getElementById("event-rating-5")
          .addEventListener("click", async (e) => {
            const data = {
              eventID: event.eventID,
              rating: document.getElementById("event-rating-5").value,
            };

            const response = await fetch("/store-rating", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify(data),
            });

            let result = await response.json();

            if (result.success) {
              toastData.info.title = "Notice:";
              toastData.info.message = "You rate this event 5 stars.";
              showToast("info");
            } else {
              toastData.danger.message = "Event rating failed.";
              showToast("danger");
            }

            console.log("event-rating-5 clicked!");
          });
      } else {
        if (event.status == "Declined") {
          overlay.innerHTML = `
          <article class="card-popup">
          
            <div class="card-image" style="background: url('${event.featureImage}') center/cover no-repeat">
              <span class="popup-event-date">${formattedDate}</span>
              <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
            </div>

            <div class="card-content theme-${event.themeIndex}">
              <h2 class="popup-event-title" id="eventTitle">${event.eventName}</h2>
              <p class="event-description" id="eventDesc">${event.description}</p>
              <p class="event-location">Location: ${event.location}</p>
              <div class="card-actions">
                <p class="${statusClass}-status">${status}</p>
              </div>
            </div>
          </article>`;
        } else {
          overlay.innerHTML = `
        <article class="card-popup">
        
        <div class="card-image" style="background: url('${event.featureImage}') center/cover no-repeat">
              <span class="popup-event-date">${formattedDate}</span>
              <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
            </div>
          

          <div class="card-content theme-${event.themeIndex}">
    
            <h2 class="popup-event-title" id="eventTitle">${event.eventName}</h2>
            <p class="event-description" id="eventDesc">${event.description}</p>
            <p class="event-location">Location: ${event.location}</p>
            <div class="card-actions">
              <p class="${statusClass}-status">${status}</p>
              <button class="cancel-box" title="Cancel Event">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="cancel-popup-overlay"></div>
              <div class="cancel-popup">
                <h3>Cancel Event</h3>
                <p>We understand that sometimes the stars don't quite align, and you may need to step away from an event. Would you like to cancel your spot? If you change your mind later, no worries—you'll just need to register again to rejoin the fun!</p>
                <div class="cancel-popup-buttons">
                  <button class="cancel-btn">Cancel</button>
                  <button class="confirm-btn" type="button">Confirm</button>
                </div>
              </div>
        </article>
      `;
        }
      }

      openPopup();
      overlay.querySelector(".cancel-box").addEventListener("click", (e) => {
        e.stopPropagation();
        overlay.querySelector(".cancel-popup").classList.add("active");
        overlay.querySelector(".cancel-popup-overlay").classList.add("active");
      });

      overlay.querySelector(".cancel-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        overlay.querySelector(".cancel-popup").classList.remove("active");
        overlay
          .querySelector(".cancel-popup-overlay")
          .classList.remove("active");
      });

      overlay
        .querySelector(".confirm-btn")
        .addEventListener("click", async (e) => {
          e.stopPropagation();

          console.log("Cancel Event: ", index, event);

          try {
            const response = await fetch("/cancel-registration", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eventID: eventsData[index].eventID }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("Backend Success: ", result);
            } else {
              const error = await response.json();
              console.log("Backend Success: ", error);
            }
          } catch (e) {
            console.log("Client Error: ", e);
          }

          toastData.successalternate.title = "Event cancelled.";
          showToast("successalternate");

          setTimeout(() => {
            closePopup();
            location.reload();
          }, 2500);
        });
    });
  });

  function openPopup() {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", (e) => {
    if (e.target.id === "closePopup" || e.target === overlay) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closePopup();
    }
  });

  const buttons = document.querySelectorAll(".toggle-buttons button");
  const groups = document.querySelectorAll(".event-group");

  function filterEvents(showUpcoming) {
    const today = new Date().setHours(0, 0, 0, 0);
    let hasEventGroup = false;

    groups.forEach((group) => {
      const eventDate = new Date(group.dataset.date).setHours(0, 0, 0, 0);
      const shouldShow = showUpcoming ? eventDate >= today : eventDate < today;
      group.style.display = shouldShow ? "flex" : "none";

      if (shouldShow) {
        hasEventGroup = true;
      }
    });

    if (!hasEventGroup) {
      noEventsPlaceholder.style.display = "flex";
      eventsContainer.style.display = "none";
    } else {
      noEventsPlaceholder.style.display = "none";
      eventsContainer.style.display = "block";
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const isUpcoming = button.textContent.trim().toLowerCase() === "upcoming";
      filterEvents(isUpcoming);
    });
  });

  filterEvents(true);
});
