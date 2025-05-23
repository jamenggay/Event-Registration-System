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
  
  let minutes = now.getMinutes();
  minutes = Math.floor(minutes / 10) * 10; 
  minutes = String(minutes).padStart(2, '0');
  
  startTime.value = `${hours}:${minutes}`;

  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const endHours = String(oneHourLater.getHours()).padStart(2, '0');
  
  let endMinutes = oneHourLater.getMinutes();
  endMinutes = Math.floor(endMinutes / 10) * 10; 
  endMinutes = String(endMinutes).padStart(2, '0');
  
  endTime.value = `${endHours}:${endMinutes}`;

  // Modal Functions with Animations
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block"; // Make sure the modal is displayed
    modal.classList.remove("hide");
    modal.classList.add("show");
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("show");
    modal.classList.add("hide");

    setTimeout(() => {
      modal.style.display = "none"; // Actually hide it after animation ends
    }, 300); // Match this timeout with the animation duration
  }

  window.saveDescription = function () {
    const description = document.getElementById("descriptionText").value;
    document.querySelector(".event_description p").innerText = description;
    closeModal("descriptionModal");
  };

  window.openDescriptionModal = function () {
    openModal("descriptionModal");
  };

  window.closeDescriptionModal = function () {
    closeModal("descriptionModal");
  };

  document.querySelectorAll('.modal-content textarea').forEach((textarea) => {
    textarea.addEventListener('input', function () {
      this.style.height = 'auto'; 
      this.style.height = (this.scrollHeight) + 'px'; 
    });
  });

  // Location
  window.saveLocation = function () {
    const location = document.getElementById("locationText").value;
    document.querySelector(".event_location p").innerText = location;
    closeModal("locationModal");
  };

  window.openLocationModal = function () {
    openModal("locationModal");
  };

  window.closeLocationModal = function () {
    closeModal("locationModal");
  };

  window.saveFeedback = function () {
    const feedback = document.getElementById("feedbackLinkText").value;
    document.querySelector(".event_feedback p").innerText = feedback;
    closeModal("feedbackModal");
  };

  window.openFeedbackModal = function () {
    openModal("feedbackModal");
  };

  window.closeFeedbackModal = function () {
    closeModal("feedbackModal");
  };

  window.openCapacityModal = function () {
    openModal("capacityModal");
  };

  window.closeCapacityModal = function () {
    closeModal("capacityModal");
  };

  window.saveCapacity = function () {
    const capacity = document.getElementById("capacityInput").value;
    const waitlistEnabled = document.getElementById("waitlistToggle").checked;

    console.log("Max Capacity:", capacity);
    console.log("Waitlist Enabled:", waitlistEnabled);

    const waitlistText = waitlistEnabled ? "Enabled" : "Disabled";
    document.querySelector(".event_capacity p").innerText = `Max Capacity: ${capacity}, Waitlist: ${waitlistText}`;

    closeModal("capacityModal");
  };

  // Theme Switching
  const themeButton = document.querySelector(".switch_color_button");
  let themeIndex = 1;
  const totalThemes = 12;

  themeButton.addEventListener("click", () => {
    document.body.classList.remove(`theme-${themeIndex}`);
    themeIndex = (themeIndex % totalThemes) + 1;
    document.body.classList.add(`theme-${themeIndex}`);
  });

  document.body.classList.add("theme-1");

  // Image Upload
  const uploadButton = document.querySelector(".upload_button");
  const imageInput = document.getElementById("imageUpload");
  const illustrationColor = document.querySelector(".illustration_color");

  uploadButton.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        // Clear old preview if any
        illustrationColor.innerHTML = "";

        // Create new image element
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Event Illustration";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "25px";

        // Log to ensure the file is being read correctly
        console.log("Image loaded:", img.src);

        // Append to preview area
        illustrationColor.appendChild(img);
      };
      reader.onerror = function (error) {
        // If there's an error reading the file, log it
        console.error("Error reading file:", error);
      };

      reader.readAsDataURL(file);
    } else {
      // If the file is not an image, log a warning
      console.warn("Not an image file.");
    }
  });
  
  // Background Image Upload
  document.getElementById('imageUpload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = function (e) {
        // Set the image as the background of the .illustration_color div
        document.querySelector('.illustration_color').style.backgroundImage = `url(${e.target.result})`;
        document.querySelector('.illustration_color').style.backgroundSize = 'cover'; // Ensure it covers the area
        document.querySelector('.illustration_color').style.backgroundPosition = 'center'; // Center the image
      };
      
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  });
});
