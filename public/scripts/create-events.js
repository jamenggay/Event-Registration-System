import {toastData, showToast} from "./alert-toast.js"

    document.addEventListener('DOMContentLoaded', () => {
      const eventForm = document.getElementById('eventForm')

      eventForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        if (!document.getElementById('imageUpload').files || document.getElementById('imageUpload').files.length === 0) {
          
          toastData.warning.message = "Please upload an image.";
          showToast("warning");
          return
        }

        const rawFeatureImage = document.getElementById('imageUpload').files[0]

        const getBase64 = rawFeatureImage => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(rawFeatureImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });

        const featureImage = await getBase64(rawFeatureImage)
        const imageFileName = rawFeatureImage.name.replace(/\.[^/.]+$/, '')
        const imageFileExtension = rawFeatureImage.name.split('.').pop().toLowerCase()

        const rawEventName = document.querySelector('.event_name');
        const eventName = document.getElementById('hiddenEventName');
        eventName.value = rawEventName.textContent.trim();

        const startDate = document.getElementById('start-date').value
        const startTime = document.getElementById('start-time').value
        const endDate = document.getElementById('end-date').value
        const endTime = document.getElementById('end-time').value

        const startDateTime = new Date(new Date(`${startDate}T${startTime}`).getTime() + (8 * 60 * 60 * 1000));
        const endDateTime = new Date(new Date(`${endDate}T${endTime}`).getTime() + (8 * 60 * 60 * 1000));
        const requireApproval = document.getElementById('require-approval').checked ? 'Yes' : 'No';
        const waitlistToggle = document.getElementById('waitlistToggle').checked ? 'Yes' : 'No';
        const lastUpdated = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));

        const eventData = {
          base64FeatureImage: featureImage,
          imageFileName: imageFileName,
          imageFileExtension: imageFileExtension,
          eventName: eventName.value,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          location: document.getElementById('locationText').value,
          description: document.getElementById('descriptionText').value,
          category: document.getElementById('event-category').value,
          feedback: document.getElementById('feedbackLinkText').value,
          requireApproval: requireApproval,
          capacity: document.getElementById('capacityInput').value,
          allowWaitlist: waitlistToggle,
          lastUpdated: lastUpdated,
          themeIndex: window.eventData.themeIndex || 1
        }

        try {
          const response = await fetch("/create-events", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
          })

          if (response.ok) {
            const result = await response.json()
            console.log("Server Success: ", result)
            toastData.success.message = "Event created."
            showToast("success");

            setTimeout(() => {
              window.location.href = "/discover"
            },2500);
            
          }
          else if (response.status == 401) {
            const result = await response.json();
            console.error('Server Failed:', result);
            toastData.info.title = "Please log in first"
            showToast();
            setTimeout(() => {
              window.location.href = "/login"
            }, 3000);
          }
        }
        catch (e) {
          console.log("Client Error: ", e)
          toastData.danger.message = "An error occurred while creating the event";
        }
      })
    });


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
  window.eventData = {}

  themeButton.addEventListener("click", () => {
    document.body.classList.remove(`theme-${themeIndex}`);
    themeIndex = (themeIndex % totalThemes) + 1;
    document.body.classList.add(`theme-${themeIndex}`);
    window.eventData.themeIndex = themeIndex
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
