  document.addEventListener('DOMContentLoaded', async () => {
    let eventsData = null 
    
    try {
      const response = await fetch("/events-registered", {
        method : 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Events Registered: ", result)
        eventsData = result
      }
      else {
        const error = await response.json()
        console.log("Backend Failed: ", error)   
      }
    }
    catch (e) {
        console.log("Client Error: ", e)
    }

    const eventSection = document.querySelector('.event-section')
    const eventsContainer = document.createElement('div')
    eventsContainer.id = 'events-container'

    // display message if no upcoming/ past events
    const emptyMessage = document.createElement('p')
    emptyMessage.textContent = 'Nothing to see here.'
    emptyMessage.classList.add('empty-message')
    emptyMessage.style.display = 'none'  
    eventSection.appendChild(emptyMessage)

    eventsContainer.innerHTML = eventsData.map(event => {
        const statusClass = 
            event.status === 'Approved' ? 'going' 
          : event.status === 'Declined' ? 'declined'
          : event.status === 'Pending' ? 'pending'
          : 'waitlisted'
        
        const status = 
            event.status === 'Approved' ? 'Going' 
          : event.status === 'Declined' ? 'Declined'
          : event.status === 'Pending' ? 'Pending'
          : 'Waitlisted'

        const startYear = new Date(event.startDateTime).getFullYear()
        const endYear = new Date(event.endDateTime).getFullYear()

        let formattedDate

        if (event.sameDay == 'True') {
          formattedDate = event.formattedStartDateTime.split(',')[0]
        } 
        else if (event.sameMonth == 'True') {
          const startDay = event.formattedStartDateTime.split(',')[0]
          const endDay = event.formattedEndDateTime.split(',')[0].split(' ')[1]
          formattedDate = `${startDay} - ${endDay}`
        } 
        else if (event.sameYear == 'True') {
          const start = event.formattedStartDateTime.split(',')[0]
          const end = event.formattedEndDateTime.split(',')[0]
          formattedDate = `${start} - ${end}`
        } 
        else {
          const start = event.formattedStartDateTime.split(',')[0]
          const end = event.formattedEndDateTime.split(',')[0]
          formattedDate = `${start}, ${startYear} - ${end}, ${endYear}`
        }

        let formattedDay

        if (event.sameDay == 'True') {
          formattedDay = new Date(event.startDateTime).toLocaleString('en-US', { weekday: 'long' })
        } 
        else {
          const startDay = new Date(event.startDateTime).toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' })
          const endDay = new Date(event.endDateTime).toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' })
          formattedDay = `${startDay} - ${endDay}`;
        }

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
              `
      }
    ).join('')

    eventSection.append(eventsContainer)

    const eventCards = document.querySelectorAll('.event-cards')
    const overlay = document.getElementById('popupOverlay') 

    eventCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const event = eventsData[index]
        const statusClass = 
            event.status == 'Approved' ? 'going' 
          : event.status === 'Declined' ? 'declined'
          : event.status === 'Pending' ? 'pending'
          : 'waitlisted'
        
        const status = 
            event.status == 'Approved' ? 'You\'re going' 
          : event.status === 'Declined' ? 'Declined'
          : event.status === 'Pending' ? 'Pending'
          : 'Waitlisted'

        const optionsDate = { month : 'long', day : 'numeric', year : 'numeric'}
        const startYear = new Date(event.startDateTime).getFullYear()

        let formattedDate;

        if (event.sameDay == 'True') {
            formattedDate = new Date(event.startDateTime).toLocaleString('en-US', optionsDate);
        }
        else if (event.sameMonth == 'True') {
            const startDay = event.formattedStartDateTime.split(',')[0];
            const endDay = event.formattedEndDateTime.split(',')[0].split(' ')[1];
            formattedDate = `${startDay} - ${endDay}, ${startYear}`;
        } 
        else if (event.sameYear == 'True') {
            const start = event.formattedStartDateTime.split(',')[0];
            const end = event.formattedEndDateTime.split(',')[0];
            formattedDate = `${start} - ${end}, ${startYear}`;
        } 
        else {
            const start = new Date(event.startDateTime).toLocaleString('en-US', optionsDate);
            const end = new Date(event.endDateTime).toLocaleString('en-US', optionsDate);
            formattedDate = `${start} - ${end}`;
        }

        overlay.innerHTML = `
          <article class="card-popup" style="background: url('${event.featureImage}') center/cover no-repeat">
            <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
            <span class="popup-event-date">${formattedDate}</span>

            <div class="card-content">
              <h2 class="popup-event-title" id="eventTitle">${event.eventName}</h2>
              <p class="event-description" id="eventDesc">${event.description}</p>
              <p class="event-location">Location: ${event.location}</p>
              <p class="${statusClass}-status">${status}</p>
              <div class="feedback-box">
                <a href="${event.feedbackLink}" class="feedback-link">
                  <span>Feedback</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        `
        openPopup()
      })
    })

    function openPopup() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; 
    }

    function closePopup() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    overlay.addEventListener('click', e => {
      if(e.target.id === 'closePopup' || e.target === overlay) closePopup();
    });

    document.addEventListener('keydown', e => {
      if(e.key === "Escape" && overlay.classList.contains('active')) {
        closePopup();
      }
    });

    const buttons = document.querySelectorAll(".toggle-buttons button");
    const groups = document.querySelectorAll(".event-group");

    function filterEvents(showUpcoming) {
      const today = new Date().setHours(0, 0, 0, 0);
      let hasEventGroup = false

      groups.forEach(group => {
        const eventDate = new Date(group.dataset.date).setHours(0, 0, 0, 0);
        const shouldShow = showUpcoming ? eventDate >= today : eventDate < today;
        group.style.display = shouldShow ? "flex" : "none";
        
        if (shouldShow) {
          hasEventGroup = true 
        }
      });

      emptyMessage.style.display = hasEventGroup ? 'none' : 'block';
    }

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const isUpcoming = button.textContent.trim().toLowerCase() === "upcoming";
        filterEvents(isUpcoming);
      });
    });
    
    filterEvents(true)
  })