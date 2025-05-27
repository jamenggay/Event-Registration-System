document.addEventListener('DOMContentLoaded', async () => {
    const eventID = window.location.pathname.split('/').pop()

    const socket = new WebSocket(`ws://localhost:3000/event/${eventID}`)

    let eventData = null
    let registrationData = null
    let approvedGuestsData = null

    let hasEventData = false;
    let hasRegistrationData = false;
    let hasApprovedGuestsData = false;

    function flagData() {
        if (hasEventData && hasRegistrationData && hasApprovedGuestsData) {
            setEventManagement(eventData, registrationData, approvedGuestsData);
        }
        else if (hasRegistrationData == false && hasApprovedGuestsData == false) {
            console.log("Registration and Approved Guests data are still missing.")
        }
        else if (hasApprovedGuestsData == false) {
            console.log("Approved Guests data is still missing.")  
        }
    }

    socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'getEventData' }));
        socket.send(JSON.stringify({ type: 'getRegistrationData' }));
        socket.send(JSON.stringify({ type : 'getApprovedGuestsData' }))

        socket.addEventListener('message', event => {
            let data = JSON.parse(event.data)

            if (data.type === 'eventData') {
                if (data.status == 200) {
                    console.log("Client Selected Event Details: ", data.eventData)
                    hasEventData = true;
                    eventData = data.eventData
                }
                else if (data.status == 500) {
                    console.log("Backend Failed: ", data.message, data.error)
                }
            }
            else if (data.type === 'registrationData') {
                if (data.status == 200) {
                    console.log("Client Registrants Details: ", data.registrationData)
                    hasRegistrationData = true;
                    registrationData = data.registrationData
                }
                else if (data.status == 500) {
                    console.log("Backend Failed: ", data.message, data.error)
                }               
            }
            else if (data.type == 'approvedGuestsData') {
                 if (data.status == 200) {
                    console.log("Client Approved Guests Details: ", data.approvedGuestsData)
                    hasApprovedGuestsData = true;                       
                    approvedGuestsData = data.approvedGuestsData
                }
                else if (data.status == 500) {
                    console.log("Backend Failed: ", data.message, data.error)
                }                   
            }
             
            flagData()
        })
    })
    
    async function setEventManagement(eventData, registrationData, approvedGuestsData) {
        // Event Handling

        // Cache DOM elements
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const modal = document.getElementById('editEventModal');
        const editButton = document.querySelector('.edit-button');
        const closeModal = document.querySelector('.close-modal');
        const cancelButton = document.querySelector('.cancel-button');
        const editEventForm = document.getElementById('editEventForm');
        const uploadButton = document.querySelector('.upload_button');
        const eventImage = document.getElementById('latestEventImage');
        const imagePreview = document.getElementById('imagePreview');

        // Tab switching functionality
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Function to format date and time
        const formatDateTime = (dateTime) => {
            try {
                const dateTimeObj = new Date(dateTime);

                return dateTimeObj.toLocaleString('en-US', {
                    timeZone: 'UTC',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
            } 
            catch (error) {
                console.error('Error formatting date:', error);
                return 'Invalid date';
            }
        };

        // Function to parse date and time from formatted string
        const parseDateTime = (formattedString) => {
            try {
                // Remove " at " and create a new string the Date constructor can understand
                const cleanedString = formattedString.replace(' at ', ',');
                const dateTimeObj = new Date(cleanedString);

                if (isNaN(dateTimeObj.getTime())) {
                    console.warn('Invalid date string');
                }

                return {
                    date: dateTimeObj.toISOString().split('T')[0],
                    time: dateTimeObj.toTimeString().slice(0, 5)
                };
            } 
            catch (error) {
                console.error('Error parsing date:', error);
                return { date: '', time: '' };
            }
        };

        // Function to display event data
        const displayEventData = (eventData) => {
            try {
                if (eventData.base64FeatureImage) {
                    // Show newly uploaded image
                    document.getElementById('eventImage').src = eventData.base64FeatureImage;
                    document.getElementById('eventImage').style.display = 'block';
                } 
                else if (eventData.featureImage) {
                    document.getElementById('eventImage').src = eventData.featureImage;
                    document.getElementById('eventImage').style.display = 'block';
                }

                document.querySelector('.event_name').textContent = eventData.eventName || '';

                if (eventData.startDateTime) {
                    document.querySelector('.start-datetime').textContent = 
                        formatDateTime(eventData.startDateTime);
                }

                if (eventData.endDateTime) {
                    document.querySelector('.end-datetime').textContent = 
                        formatDateTime(eventData.endDateTime);
                }

                document.querySelector('.location-text').textContent = eventData.location || '';
                document.querySelector('.description-text').textContent = eventData.description || '';
                document.querySelector('.category-text').textContent = eventData.category || '';
                document.querySelector('.feedback-link').textContent = eventData.feedbackLink || '';
                document.querySelector('.approval-status').textContent = 
                    eventData.requireApproval === 'Yes' ? 'Required' : 'Not Required';

                let approvalStatus = document.querySelector('.approval-status').textContent
                displayGuestData(approvalStatus)

                if (eventData.capacity) {
                    document.querySelector('.capacity-text').textContent = `${eventData.capacity}`;
                    document.querySelector('.waitlist-status').textContent = 
                        `Waitlist: ${eventData.allowWaitlist === 'Yes' ? 'Enabled' : 'Disabled'}`;
                }
            } 
            catch (error) {
                console.error('Error displaying event data:', error);
            }
        };

        // Function to populate modal form with current event data
        const populateModalForm = (currentEventData) => {
            try {
                document.getElementById('eventName').value = currentEventData.eventName || '';

                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const formatDate = (date) => date.toISOString().split('T')[0];

                const startDate = currentEventData.startDate ? new Date(currentEventData.startDate) : now;
                document.getElementById('startDate').value = formatDate(startDate);
                document.getElementById('startTime').value = currentEventData.startTime;

                const endDate = currentEventData.endDate ? new Date(currentEventData.endDate) : tomorrow;
                document.getElementById('endDate').value = formatDate(endDate);
                document.getElementById('endTime').value = currentEventData.endTime;

                document.getElementById('location').value = currentEventData.location || '';
                document.getElementById('description').value = currentEventData.description || '';
                document.getElementById('category').value = currentEventData.category || '';
                document.getElementById('feedbackLink').value = currentEventData.feedbackLink || '';
                document.getElementById('max_capacity').value = currentEventData.capacity || '';
                
                document.getElementById('require_approval').checked = currentEventData.requireApproval
                document.getElementById('over_capacity_waitlist').checked = currentEventData.waitlist

                if (currentEventData.featureImage) {
                    imagePreview.src = currentEventData.featureImage;
                } else {
                    imagePreview.src = '../assets/images/default-event.jpg';
                }
            } catch (error) {
                console.error('Error populating modal form:', error);
            }
        };

        const saveChangesButton = document.getElementById('save-changes-btn');
        
        const eventFormFields = [ 
            {   new : document.getElementById('eventName'),     original : eventData.eventName },
            {   new : document.getElementById('startDate'),     original : new Date(eventData.startDateTime).toISOString().split('T')[0] },      
            {   new : document.getElementById('startTime'),     original : new Date(eventData.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) },
            {   new : document.getElementById('endDate'),       original : new Date(eventData.endDateTime).toISOString().split('T')[0] },        
            {   new : document.getElementById('endTime'),       original : new Date(eventData.endDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) },
            {   new : document.getElementById('location'),      original : eventData.location },
            {   new : document.getElementById('description'),   original : eventData.description },
            {   new : document.getElementById('category'),      original : eventData.category },
            {   new : document.getElementById('feedbackLink'),  original : eventData.feedbackLink },
            {   new : document.getElementById('max_capacity'),  original : eventData.capacity },
            {   new : document.getElementById('require_approval'), original : eventData.requireApproval === 'Yes' ? true : false, isCheckbox : true },
            {   new : document.getElementById('over_capacity_waitlist'), original : eventData.allowWaitlist === 'Yes' ? true : false, isCheckbox : true }
        ]

        eventFormFields.forEach(data => {
            const eventType = data.isCheckbox === true ? 'change' : 'input'

            data.new.addEventListener(eventType, () => {
                // use String() to convert non-string values 
                const hasChanges = eventFormFields.some(item => { 
                    const currentValue = item.isCheckbox === true ? item.new.checked : item.new.value
                    return String(currentValue) !== String(item.original) 
                })

                saveChangesButton.disabled = !hasChanges
                console.log(hasChanges ? 'Save Changes: Enabled' : 'Save Changes: Disabled')
            })
        })

        // Function to get current event data from the page
        const getCurrentEventData = () => {
            try {
                const startDateTime = parseDateTime(document.querySelector('.start-datetime').textContent);
                const endDateTime = parseDateTime(document.querySelector('.end-datetime').textContent);
                
                return {
                    eventName: document.querySelector('.event_name').textContent,
                    startDate: startDateTime.date,
                    startTime: startDateTime.time,
                    endDate: endDateTime.date,
                    endTime: endDateTime.time,
                    location: document.querySelector('.location-text').textContent,
                    description: document.querySelector('.description-text').textContent,
                    category: document.querySelector('.category-text').textContent,
                    feedbackLink: document.querySelector('.feedback-link').textContent,
                    requireApproval: document.querySelector('.approval-status').textContent === 'Required' ? true : false,
                    capacity: document.querySelector('.capacity-text').textContent || 0,
                    waitlist: document.querySelector('.waitlist-status').textContent.includes('Enabled') ? true : false,
                    featureImage: document.getElementById('eventImage').src
                };
            } catch (error) {
                console.error('Error getting current event data:', error);
                return {};
            }
        };

        // Modal functionality
        const closeModalHandler = () => {
            modal.style.display = 'none';
        };

        const openModalHandler = (e) => {
            e.preventDefault();
            try {
                const currentEventData = getCurrentEventData();
                populateModalForm(currentEventData);
                modal.style.display = 'block';
            } catch (error) {
                console.error('Error opening modal:', error);
            }
        };

        editButton.addEventListener('click', openModalHandler);
        closeModal.addEventListener('click', closeModalHandler);
        cancelButton.addEventListener('click', closeModalHandler);

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });

        // Handle image upload
        let featureImage = null
        let imageFileName = null
        let imageFileExtension = null

        uploadButton.addEventListener('click', () => 
            eventImage.click()
        );

        eventImage.addEventListener('change', async (e) => {
            try {
                const file = e.target.files[0];
                
                if (file) {
                    const getBase64 = file => new Promise(async (resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = (e) => {
                            imagePreview.src = e.target.result;
                            imagePreview.style.display = 'block';
                            resolve(reader.result)
                        };

                        reader.onerror = () => {
                            console.error('Error reading file');
                            alert('Error reading file. Please try again.');
                        }

                        reader.readAsDataURL(file);
                    })

                    featureImage = await getBase64(file)
                    imageFileName = file.name.replace(/\.[^/.]+$/, '')
                    imageFileExtension = file.name.split('.').pop().toLowerCase()
                }
                saveChangesButton.disabled = false
            } 
            catch (error) {
                console.error('Error handling image upload:', error);
            }
        });

        // Handle form submission
        editEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const startDate = document.getElementById('startDate').value
            const startTime = document.getElementById('startTime').value
            const endDate   = document.getElementById('endDate').value
            const endTime   = document.getElementById('endTime').value

            const startDateTime   = new Date(new Date(`${startDate}T${startTime}`).getTime() + (8 * 60 * 60 * 1000));
            const endDateTime     = new Date(new Date(`${endDate}T${endTime}`).getTime() + (8 * 60 * 60 * 1000));
            const requireApproval = document.getElementById('require_approval').checked ? 'Yes' : 'No'
            const waitlistToggle  = document.getElementById('over_capacity_waitlist').checked ? 'Yes' : 'No'
            const lastUpdated     = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));
            
            const updatedEventData = {
                eventID             : eventData.eventID,
                base64FeatureImage  : featureImage,
                imageFileName       : imageFileName,
                imageFileExtension  : imageFileExtension,
                dbImagePath     : eventData.featureImage,
                eventName       : document.getElementById('eventName').value,
                startDateTime   : startDateTime,
                endDateTime     : endDateTime,
                location        : document.getElementById('location').value,
                description     : document.getElementById('description').value,
                category        : document.getElementById('category').value,
                feedbackLink    : document.getElementById('feedbackLink').value,
                requireApproval : requireApproval,
                capacity        : document.getElementById('max_capacity').value || 0,
                allowWaitlist   : waitlistToggle,
                lastUpdated     : lastUpdated
            }

            try {
                const response = await fetch(`/event/${eventData.eventID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type' : 'application/json' },
                    body: JSON.stringify(updatedEventData)
                })

                socket.send(JSON.stringify({ type: 'getEventData' }));

                if (response.ok) {
                    const result = await response.json()
                    console.log("Backend Success: ", result)
                    displayEventData(updatedEventData);
                    closeModalHandler();            
                }
                else {
                    const error = await response.json()
                    console.log("Backend Failed: ", error)
                }                
            } 
            catch (error) {
                console.log("Client Error: ", error)
            }
        });


        // Guest Handling
        const guestsContainer = document.getElementById('guest')

        function displayGuestData(approvalStatus) {
            if (approvalStatus === 'Required') {
                if (registrationData.length == 0) {
                    guestsContainer.innerHTML = `
                                        <h1>Guest List</h1>
                                        <p class = 'empty-message'>Guest list is currently empty.</p>
                                    `
                }
                else if (registrationData.length != 0) {
                    let pendingGuests = registrationData.filter(guest => guest.status == 'Pending' || guest.status == 'Approved' || guest.status == 'Declined')
                    pendingGuests.sort((a, b) => b.registrationID - a.registrationID)

                    let waitlistedGuests = registrationData.filter(guest => guest.status == 'Waitlisted')

                    if (pendingGuests.length == 0) {
                        guestsContainer.innerHTML = `
                                            <h1>Guest List</h1>
                                            <p class = 'empty-message'>Guest list is currently empty.</p>
                                        `
                    }

                    if (pendingGuests.length != 0) {
                        guestsContainer.innerHTML = `
                            <h1>Guest List</h1> ${pendingGuests.map(guest => 
                            `<div class="attendee-container">
                                <div class="attendee-info">
                                    <img src="${guest.profilePic}" onerror= "this.onerror=null; this.src='../assets/icons/profile-icon.jpeg';" class="icon-flex" alt="Profile">
                                    <span class="attendee-name">${guest.fullname}</span>
                                </div>
                                <div class="attendee-actions">
                                    <button class="accept">Dalo</button>
                                    <button class="decline">Decline</button>
                                </div>
                            </div>`
                        ).join('')}`
                    }
                
                    if (waitlistedGuests.length != 0) {
                        const waitlistedContainer = document.createElement('div')
                        waitlistedContainer.id = "waitlisted-container"
                            
                        waitlistedContainer.innerHTML = `
                            <h1>Waitlisted</h1> ${waitlistedGuests.map(guest => 
                            `<div class="attendee-container">
                                <div class="attendee-info">
                                    <img src="${guest.profilePic}" onerror= "this.onerror=null; this.src='../assets/icons/profile-icon.jpeg';" class="icon-flex" alt="Profile">
                                    <span class="attendee-name">${guest.fullname}</span>
                                </div>
                                <div class="attendee-actions">
                                    <button class="accept">Dalo</button>
                                    <button class="decline">Decline</button>
                                </div>
                            </div>`
                        ).join('')}`
                        
                        guestsContainer.append(waitlistedContainer)
                    }

                    const acceptGuestBtn = document.querySelectorAll('.accept')

                    acceptGuestBtn.forEach((button, index) => {
                        button.addEventListener('click', async () => {
                            registrationData = [...pendingGuests, ...waitlistedGuests]

                            const acceptedGuest = registrationData[index]
                            console.log(acceptedGuest)
                            
                            const guestData = {
                                eventID : acceptedGuest.eventID,
                                userID : acceptedGuest.userID,
                                status : 'Approved'
                            }
                            
                            try {
                                const response = await fetch(`/registrant`, {
                                    method : 'PATCH',
                                    headers : { 'Content-Type' : 'application/json' },
                                    body : JSON.stringify(guestData)
                                })

                                socket.send(JSON.stringify({ type: 'getRegistrationData' }));
                                socket.send(JSON.stringify({ type : 'getApprovedGuestsData' }))

                                if (response.ok) {
                                    const result = await response.json()
                                    console.log("Backend Success: ", result)
                                    alert('Guest Accepted!')
                                }
                                else {
                                    const error = await response.json()
                                    console.log("Backend Failed: ", error)
                                }
                            }
                            catch (e) {
                                console.log("Client Error: ", e)
                            }
                        })
                    })

                    const declineGuestBtn = document.querySelectorAll('.decline')

                    declineGuestBtn.forEach((button, index) => {
                        button.addEventListener('click', async () => {
                            registrationData = [...pendingGuests, ...waitlistedGuests]

                            const declinedGuest = registrationData[index]
                            console.log(declinedGuest)

                            const guestData = {
                                eventID : declinedGuest.eventID,
                                userID : declinedGuest.userID,
                                status : 'Declined'
                            }
                            
                            try {
                                const response = await fetch(`/registrant`, {
                                    method : 'PATCH',
                                    headers : { 'Content-Type' : 'application/json' },
                                    body : JSON.stringify(guestData)
                                })

                                socket.send(JSON.stringify({ type: 'getRegistrationData' }));
                                socket.send(JSON.stringify({ type : 'getApprovedGuestsData' }))

                                if (response.ok) {
                                    const result = await response.json()
                                    console.log("Backend Success: ", result)
                                    alert('Guest Declined!')
                                }
                                else {
                                    const error = await response.json()
                                    console.log("Backend Failed: ", error)
                                }
                            }
                            catch (e) {
                                console.log("Client Error: ", e)
                            }
                        })
                    })
                }
            }
            else {
                guestsContainer.innerHTML = `
                                        <h1>Guest List</h1>
                                        <p class = 'empty-message'>Guest list is currently empty.</p>
                                    `
            }
        }

        
        // Check-In Handling
        const checkInContainer = document.getElementById('check-in')

        if (approvedGuestsData.length == 0) {
            checkInContainer.innerHTML = `
                                        <h1>Check In</h1>
                                        <p class = 'empty-message'>Check In is currently empty.</p>
                                    `
        }
        else if (approvedGuestsData.length != 0) {
            checkInContainer.innerHTML = `
                <h1>Check In</h1>
                ${approvedGuestsData.map(guest => `
                    <div class="checkin-guest">
                        <div class="guest-info">
                            <img src="${guest.profilePic}" onerror="this.onerror=null; this.src='../assets/icons/profile-icon.jpeg';" class="icon-flex" alt="Profile">
                            <span class="guest-name">${guest.fullname}</span>
                        </div>
                        <div class="attendance-options">
                            <label class="attendance-option attended">
                                <input type="radio" class="attended-guest" name="attendance1" value="attended">
                                <span>Attended</span>
                            </label>
                            <label class="attendance-option not-attended">
                                <input type="radio" class="not-attended-guest" name="attendance1" value="not-attended">
                                <span>Not Attended</span>
                            </label>
                        </div>
                    </div>`
                ).join('')}
            `

            const attendedButton = document.querySelectorAll('.attended-guest')

            attendedButton.forEach((button, index) => {
                button.addEventListener('click', async () => {
                    const guest = approvedGuestsData[index]

                    const attendanceData = {
                        eventID : eventData.eventID,
                        userID : guest.userID,
                        checkedInAt : new Date(new Date().getTime() + (8 * 60 * 60 * 1000))
                    }

                    try {
                        const response = await fetch("/checkin-attendee", {
                            method : 'POST',
                            headers : { 'Content-Type' : 'application/json' },
                            body : JSON.stringify(attendanceData)
                        })

                        socket.send(JSON.stringify({ type : 'getApprovedGuestsData' }))

                        if (response.ok) {
                            const result = await response.json()
                            console.log("Backend Success: ", result)
                        }
                        else {
                            const error = await response.json()
                            console.log("Backend Failed: ", error)
                        }
                    }
                    catch (e) {
                        console.log("Client Error: ", e)
                    }
                })
            })

            const notAttendedButton = document.querySelectorAll('.not-attended-guest')

            notAttendedButton.forEach((button, index) => {
                button.addEventListener('click', async () => {
                    const guest = approvedGuestsData[index]

                    const attendanceData = {
                        eventID : eventData.eventID,
                        userID : guest.userID,
                    }

                    try {
                        const response = await fetch("/checkin-attendee", {
                            method : 'DELETE',
                            headers : { 'Content-Type' : 'application/json' },
                            body : JSON.stringify(attendanceData)
                        })

                        socket.send(JSON.stringify({ type : 'getApprovedGuestsData' }))

                        if (response.ok) {
                            const result = await response.json()
                            console.log("Backend Success: ", result)
                        }
                        else if (response.status == 404) {
                            const result = await response.json()
                            console.log("Backend Message: ", result)
                        }
                        else {
                            const error = await response.json()
                            console.log("Backend Failed: ", error)
                        }
                    }
                    catch (e) {
                        console.log("Client Error: ", e)
                    }
                })
            })
        }

        // Handle radio button changes for check-in
        document.querySelectorAll('input[type="radio"][name^="attendance"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const checkinGuest = this.closest('.checkin-guest');
                checkinGuest.classList.remove('attended', 'not-attended');
                
                if (this.value === 'attended') {
                    checkinGuest.classList.add('attended');
                } else if (this.value === 'not-attended') {
                    checkinGuest.classList.add('not-attended');
                }
            });
        });

        displayEventData(eventData);
    }

});
