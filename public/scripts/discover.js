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
    const res6 = await fetch('api/user-registrations');
    const events = await res1.json();
    const startDateTime = await res2.json();
    const endDateTime = await res3.json();
    const sameDate = await res4.json();
    const endTime = await res5.json();
    const registeredEvent = await res6.json();
    const registeredEventIDs = registeredEvent.registeredEventIDs;

    events.forEach((event, index) => {
  const li = document.createElement('li');
  li.className = 'item';
  li.style.backgroundImage = `url('${event.featureImage}')`;

  const isSameDay = sameDate[index].SameDay === 'True';
  const isRegistered = registeredEventIDs.includes(event.eventID); 

  const eventDateHTML = isSameDay
    ? `<span class="event-date">${startDateTime[index].formattedDate} - ${endTime[index].endTime}</span>`
    : `<span class="event-date">${startDateTime[index].formattedDate} - ${endDateTime[index].formattedDate}</span>`;

  li.innerHTML = `
    ${eventDateHTML}
    <div class="event-content">
      <h2 class="event-title">${event.eventName}</h2>
      <p class="event-description">${event.description}</p>
      <p class="event-location">${event.location}</p>
      <button class="register-btn" data-event-id="${event.eventID}">${isRegistered ? 'Registered' : 'Register'}</button>
    </div>
  `;

  eventList.appendChild(li);

  const button = li.querySelector('.register-btn');
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
});

  }
  catch (error) {
    console.error('Error fetching data ', error);
  }
});
