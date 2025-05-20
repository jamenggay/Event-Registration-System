//FRONTEND SCRIPT
const wordElement = document.getElementById("dynamic-word");
  let isExperience = true;

  setInterval(() => {
    isExperience = !isExperience;
    wordElement.textContent = isExperience ? " Experience" : " Event";
    wordElement.className = isExperience ? "experience" : "event";
    wordElement.id = "dynamic-word"; 
  }, 2000);

  