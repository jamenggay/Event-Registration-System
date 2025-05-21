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

  
try{
  const res = await fetch('/event-details')  ;
  const rs = await fetch('/api/formatStartDate');
  const events = await res.json();
  const startDateTime = await rs.json();

  events.forEach((event, index) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.style.backgroundImage = `url('${event.featureImage}')` 

    li.innerHTML = `
    <span class="event-date">${startDateTime[index].formattedDate}</span>
    <div class="event-content">
          <h2 class="event-title">${event.eventName}</h2>
          <p class="event-description">${event.description}</p>
          <p class="event-location">${event.location}</p>
            <button>Register</button>
        </div>
    `;
    eventList.appendChild(li);
  });
}
catch(error){
  console.error('Error fetching data ', error);
}  
});
