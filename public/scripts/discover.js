//FRONTEND SCRIPT
const wordElement = document.getElementById("dynamic-word");
let isExperience = true;

setInterval(() => {
  isExperience = !isExperience;
  wordElement.textContent = isExperience ? " Experience" : " Event";
  wordElement.className = isExperience ? "experience" : "event";
  wordElement.id = "dynamic-word";
}, 2000);

//BACKEND SCRIPT

document.addEventListener("DOMContentLoaded", async () => {
  const eventList = document.getElementById("events-list");


  try {
    const res1 = await fetch('/event-details');
    const res2 = await fetch('/api/formatStartDate');
    const res3 = await fetch('/api/formatEndDate');
    const res4 = await fetch('/api/compareDate');
    const res5 = await fetch('/api/endTime');
    const events = await res1.json();
    const startDateTime = await res2.json();
    const endDateTime = await res3.json();
    const sameDate = await res4.json();
    const endTime = await res5.json();

    events.forEach((event, index) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.style.backgroundImage = `url('${event.featureImage}')`

      if (sameDate[index].SameDay == 'True') {
        li.innerHTML = `
    <span class="event-date">${startDateTime[index].formattedDate} - ${endTime[index].endTime}</span>
    <div class="event-content">
          <h2 class="event-title">${event.eventName}</h2>
          <p class="event-description">${event.description}</p>
          <p class="event-location">${event.location}</p>
            <button>Register</button>
        </div>
    `;
        eventList.appendChild(li);
      }
      else {
        li.innerHTML = `
    <span class="event-date">${startDateTime[index].formattedDate} - ${endDateTime[index].formattedDate}</span>
    <div class="event-content">
          <h2 class="event-title">${event.eventName}</h2>
          <p class="event-description">${event.description}</p>
          <p class="event-location">${event.location}</p>
            <button>Register</button>
        </div>
    `;
        eventList.appendChild(li);
      }

    });
  }
  catch (error) {
    console.error('Error fetching data ', error);
  }
});
