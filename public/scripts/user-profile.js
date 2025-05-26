window.addEventListener('pageshow', function (event) {
    // data receive from cache, reload it automatically
    if (event.persisted) {
        window.location.reload();
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    window.updatedUserData = {};

    let userData = null

    try {
        userData = await window.userDataReady;
    } 
    catch (e) {
        console.error("Failed to load user data:", e);
    }

    let userEventsCreated = null

    try {
        userEventsCreated = await window.userEventsCreatedReady;
    } 
    catch (e) {
        console.error("Failed to load user events created data:", e);
    }

    const fullname = document.getElementById('fullname');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');
    const bio = document.getElementById('bio');
    const profilePic = document.getElementById('profilePreview');

    fullname.value = userData.fullname;
    username.value = userData.username;
    email.value = userData.email;
    mobile.value = userData.mobileNumber;
    bio.value = userData.bio || "";
    profilePic.src = userData.profilePic 
    profilePic.onerror =  function() {
        this.onerror = null; // prevent infinite loop if fallback fails
        this.src = "../assets/icons/profile-icon.jpeg";
    };
    
    const uploadButton = document.getElementById('uploadButton');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');

    uploadButton.addEventListener('click', () => {
        profileUpload.click();
    });

    profileUpload.addEventListener('change', async function(e) {
        let file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const getBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
        
            reader.onload = function(e) {
                profilePreview.src = e.target.result;
                resolve(reader.result)
            };

            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading file. Please try again.');
            };

            reader.readAsDataURL(file);
        })

        let profilePic = await getBase64(file)
        let imageFileName = file.name.replace(/\.[^/.]+$/, '')
        let imageFileExtension = file.name.split('.').pop().toLowerCase()

        window.updatedUserData.base64ProfilePic = profilePic
        window.updatedUserData.imageFileName = imageFileName
        window.updatedUserData.imageFileExtension = imageFileExtension

        console.log("Pfp Details: ", window.updatedUserData)
        
        try {
            const response = await fetch("/user-pfp", {
                method: "PATCH",
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify(window.updatedUserData)
            })

            if (response.ok) {
                const result = await response.json()
                console.log("Server Success: ", result)
                alert("User profile edit success.")
            }
            else {
                const result = await response.json();
                console.log("Server Failed: ", result)
                alert("User profile edit failed.")
            }
        }
        catch (e) {
            console.log("Client Error: ", e)
            alert("An error occurred while updating user info.");
        }
    });


    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateMobile(mobile) {
        return /^[0-9]{11}$/.test(mobile);
    }

    function showValidationMessage(input, message) {
        const existingMessage = input.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.textContent = message;
        } else {
            const messageElement = document.createElement('div');
            messageElement.className = 'validation-message';
            messageElement.textContent = message;
            input.parentElement.appendChild(messageElement);
        }
    }

    function clearValidationMessage(input) {
        const message = input.parentElement.querySelector('.validation-message');
        if (message) {
            message.remove();
        }
    }

    const emailInput = document.getElementById('edit-email');
    const mobileInput = document.getElementById('edit-mobile');

    emailInput.addEventListener('input', function() {
        if (this.value && !validateEmail(this.value)) {
            showValidationMessage(this, 'Please enter a valid email address');
        } else {
            clearValidationMessage(this);
        }
    });

    mobileInput.addEventListener('input', function() {
        if (this.value && !validateMobile(this.value)) {
            showValidationMessage(this, 'Please enter a 11-digit mobile number');
        } else {
            clearValidationMessage(this);
        }
    });

    window.openEditModal = function() {
        const modal = document.getElementById('editProfileModal');
        
        document.getElementById('edit-fullname').value = fullname.value;
        document.getElementById('edit-username').value = username.value;
        document.getElementById('edit-email').value = email.value;
        document.getElementById('edit-mobile').value = mobile.value;
        document.getElementById('edit-bio').value = bio.value;

        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("show"), 10);
    }

    window.closeEditModal = function() {
        const modal = document.getElementById('editProfileModal');
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            document.querySelectorAll('.validation-message').forEach(msg => msg.remove());
        }, 300);
    }

    const saveChangesButton = document.getElementById('save-changes-btn');

    const basicInfoFields = [
        { new: document.getElementById('edit-fullname'), original: userData.fullname },
        { new: document.getElementById('edit-username'), original: userData.username },
        { new: document.getElementById('edit-email'), original: userData.email },
        { new: document.getElementById('edit-mobile'), original: userData.mobileNumber },
        { new: document.getElementById('edit-bio'), original: userData.bio || "" },
    ];

    basicInfoFields.forEach(data => {
        data.new.addEventListener('input', () => {
            if (basicInfoFields.some(item => item.new.value !== item.original)) {
                saveChangesButton.disabled = false
            }
            else {
                saveChangesButton.disabled = true
            }
        })
    })

    window.saveProfile = async function() {
        const new_fullname = document.getElementById('edit-fullname').value;
        const new_username = document.getElementById('edit-username').value;
        const new_email = document.getElementById('edit-email').value;
        const new_mobile = document.getElementById('edit-mobile').value; 
        const new_bio = document.getElementById('edit-bio').value || '';

        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

        let hasError = false;

        if (!new_fullname) {
            showValidationMessage(document.getElementById('edit-fullname'), 'Full name is required');
            hasError = true;
        }
        if (!new_username) {
            showValidationMessage(document.getElementById('edit-username'), 'Username is required');
            hasError = true;
        }
        if (!new_email || !validateEmail(new_email)) {
            showValidationMessage(document.getElementById('edit-email'), 'Valid email address is required');
            hasError = true;
        }
        if (!new_mobile || !validateMobile(new_mobile)) {
            showValidationMessage(document.getElementById('edit-mobile'), 'Valid 11-digit mobile number is required');
            hasError = true;
        }

        if (hasError) return;

        try {
            fullname.value = new_fullname;
            username.value = new_username;
            email.value = new_email;
            mobile.value = new_mobile;
            bio.value = new_bio;

            window.updatedUserData.fullname = fullname.value,
            window.updatedUserData.username = username.value,
            window.updatedUserData.email = email.value,
            window.updatedUserData.mobile = mobile.value,
            window.updatedUserData.bio = bio.value

            console.log("User Details: ", window.updatedUserData)
            closeEditModal();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile changes. Please try again.');
        }
    }

    window.openChangePasswordModal = function() {
        const modal = document.getElementById('changePasswordModal');
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());
        
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("show"), 10);
        
        // Close the edit profile modal
        closeEditModal();
    }

    window.closeChangePasswordModal = function() {
        const modal = document.getElementById('changePasswordModal');
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            document.querySelectorAll('.validation-message').forEach(msg => msg.remove());
        }, 300);
    }

    window.savePasswordChange = async function() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

        let hasError = false;

        if (!currentPassword) {
            showValidationMessage(document.getElementById('current-password'), 'Current password is required');
            hasError = true;
        }
        if (!newPassword) {
            showValidationMessage(document.getElementById('new-password'), 'New password is required');
            hasError = true;
        }
        if (!confirmPassword) {
            showValidationMessage(document.getElementById('confirm-password'), 'Please confirm your new password');
            hasError = true;
        }
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            showValidationMessage(document.getElementById('confirm-password'), 'Passwords do not match');
            hasError = true;
        }
        if (newPassword && newPassword.length < 8) {
            showValidationMessage(document.getElementById('new-password'), 'Password must be at least 8 characters long');
            hasError = true;
        }

        if (hasError) return;

        updatedUserData.currentPassword = currentPassword
        updatedUserData.newPassword = newPassword
        
        try {
            const response = await fetch("/user-password", {
                method: 'PATCH',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify(updatedUserData)
            })

            if (response.ok) {
                const result = await response.json()
                console.log("Server Success: ", result)
                alert("User password edit success.")
                closeChangePasswordModal();
            }
            else if (response.status == 401) {
                const error = await response.json()
                console.log("Server Failed: ", error)
                alert("Incorrect current password.")
            }
            else {
                const result = await response.json();
                console.log("Server Failed: ", result)
                alert("User password edit failed.")
            }
        }
        catch (e) {
            console.log("Client Error: ", e)
            alert("An error occurred while updating the password");
        }
    }

    document.querySelector('#changePasswordModal .close').addEventListener('click', function() {
        closeChangePasswordModal();
    });

    window.addEventListener('click', (event) => {
        const editModal = document.getElementById('editProfileModal');
        const changePasswordModal = document.getElementById('changePasswordModal');

        if (event.target === editModal) {
            closeEditModal();
        }

        if (event.target === changePasswordModal) {
            closeChangePasswordModal();
        }
    });

    document.querySelector('.close').addEventListener('click', function() {
        closeEditModal();
    });

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

    console.log("Events Data: ", userEventsCreated)

    const eventSection = document.querySelector('.event-section')
    const eventsContainer = document.createElement('div')
    eventsContainer.id = 'events-container'

    // display message if no upcoming/ past events
    const emptyMessage = document.createElement('p')
    emptyMessage.textContent = 'Nothing to see here.'
    emptyMessage.classList.add('empty-message')
    emptyMessage.style.display = 'none'  
    eventSection.appendChild(emptyMessage)

    const eventsCreatedContainer = document.querySelector('.events_created_container')
    const overlay = document.getElementById('popupOverlay');

    userEventsCreated.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))

    eventsCreatedContainer.innerHTML = userEventsCreated.map((event, index) => {

        const startObj = new Date(event.startDateTime)
        const endObj = new Date(event.endDateTime)
        const startYear = new Date(event.startDateTime).getFullYear()
        const endYear = new Date(event.endDateTime).getFullYear()

        const optionsDate = { month: 'long', day: 'numeric', timeZone: 'UTC' };
        const optionsDay  = { weekday: 'long', timeZone: 'UTC' };
        const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' };
        
        let formattedDate;

        if (event.sameDay == 'True') {
            formattedDate = startObj.toLocaleString('en-US', optionsDate);
        } 
        else if (event.sameMonth == 'True') {
            formattedDate = `${startObj.toLocaleString('en-US', optionsDate)} - ${endObj.toLocaleString('en-US', { day: 'numeric', timeZone: 'UTC' })}`;
        } 
        else if (event.sameYear == 'True') {
            formattedDate = `${startObj.toLocaleString('en-US', optionsDate)} - ${endObj.toLocaleString('en-US', optionsDate)}`;
        } 
        else {
            formattedDate = `${startObj.toLocaleString('en-US', optionsDate)}, ${startYear} - ${endObj.toLocaleString('en-US', optionsDate)}, ${endYear}`;
        }

        const formattedDay = event.sameDay == 'True' ? startObj.toLocaleString('en-US', optionsDay)
                            : `${startObj.toLocaleString('en-US', optionsDay)} - ${endObj.toLocaleString('en-US', optionsDay)}`

        return `  
                <div class="event-group" data-date="${event.startDateTime}">
                    <div class="event-date">
                        <strong>${formattedDate}</strong>
                        <span class="weekday">${formattedDay}</span>
                    </div>

                    <div class="event-cards" data-index="${index}">
                        <div class="event-card theme-${event.themeIndex}">
                            <div class="event-info">
                                <div class="event-time">${startObj.toLocaleString('en-US', optionsTime)} - ${endObj.toLocaleString('en-US', optionsTime)}</div>
                                <div class="event-title">
                                    ${event.eventName}
                                </div>
                                <div class="event-meta">
                                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2 6.854C2 11.02 7.04 15 8 15s6-3.98 6-8.146C14 3.621 11.314 1 8 1S2 3.62 2 6.854"></path><path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path></g></svg> ${event.location}</span>
                                </div>
                            </div>

                            <img class="event-thumbnail"
                                src="${event.featureImage}"
                                alt="Event Thumbnail" />
                        </div>
                    </div>
                </div>
            `
    }).join('')
        
    const eventCards = document.querySelectorAll('.event-cards');
    
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const index = card.dataset.index
            const event = userEventsCreated[index]

            const optionsDate = { month : 'long', day : 'numeric', year : 'numeric'}
            const optionsDay = { month : 'long', day : 'numeric'}
            const startYear = new Date(event.startDateTime).getFullYear()

            let formattedDate;

            if (event.sameDay == 'True') {
                formattedDate = new Date(event.startDateTime).toLocaleString('en-US', optionsDate);
            } 
            else if (event.sameMonth == 'True') {
                formattedDate = `${new Date(event.startDateTime).toLocaleString('en-US', optionsDay)} - ${new Date(event.endDateTime).toLocaleString('en-US', { day: 'numeric' })}, ${startYear}`;
            } 
            else if (event.sameYear == 'True') {
                formattedDate = `${new Date(event.startDateTime).toLocaleString('en-US', optionsDay)} - ${new Date(event.endDateTime).toLocaleString('en-US', optionsDay)}, ${startYear}`;
            } 
            else {
                formattedDate = `${new Date(event.startDateTime).toLocaleString('en-US', optionsDate)} - ${new Date(event.endDateTime).toLocaleString('en-US', optionsDate)}`;
            }

            overlay.innerHTML = `
                    <article class="card-popup" style="background: url('${event.featureImage}') center/cover no-repeat">
                        <button class="close-btn" aria-label="Close popup" id="closePopup">&times;</button>
                        <span class="popup-event-date">${formattedDate}</span>

                        <div class="card-content">
                            <h2 class="popup-event-title" id="eventTitle">${event.eventName}</h2>
                            <p class="event-description" id="eventDesc">${event.description}</p>
                            <p class="event-location">Location: ${event.location}</p>
                            <button class="link-btn" onclick="window.location.href='/event/${event.eventID}'">You're managing this event!</button>
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
});
