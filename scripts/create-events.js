document.addEventListener("DOMContentLoaded", function () {
    const startDate = document.getElementById("start-date");
    const endDate = document.getElementById("end-date");
    const startTime = document.getElementById("start-time");
    const endTime = document.getElementById("end-time");
  
    const now = new Date();
  
    const isoDate = now.toISOString().split("T")[0];
    startDate.value = isoDate;
    endDate.value = isoDate;
  
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    startTime.value = `${hours}:${minutes}`;
  
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const endHours = String(oneHourLater.getHours()).padStart(2, '0');
    const endMinutes = String(oneHourLater.getMinutes()).padStart(2, '0');
    endTime.value = `${endHours}:${endMinutes}`;
  });
  