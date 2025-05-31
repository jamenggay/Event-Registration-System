document.addEventListener('DOMContentLoaded', () => {
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
        //Event Tab Handling

        // Cache DOM elements
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const editModal = document.getElementById('editEventModal');
        const deleteModal = document.getElementById('deleteEventModal');
        const deleteOverlay = document.getElementById('deleteEventOverlay');
        const editButton = document.querySelector('.edit-button');
        const deleteButton = document.querySelector('.delete-button');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        const cancelButtons = document.querySelectorAll('.cancel-button');
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
                    const eventImage = document.getElementById('eventImage');
                    eventImage.src = eventData.base64FeatureImage;
                    eventImage.style.display = 'block';
                }
                else if (eventData.featureImage) {
                    const eventImage = document.getElementById('eventImage');
                    eventImage.src = eventData.featureImage;
                    eventImage.style.display = 'block';
                }

                // Update event details
                const eventName = document.querySelector('.event_name');
                if (eventName) eventName.textContent = eventData.eventName || '';

                const startDateTime = document.querySelector('.start-datetime');
                if (startDateTime && eventData.startDateTime) {
                    startDateTime.textContent = formatDateTime(eventData.startDateTime);
                }

                const endDateTime = document.querySelector('.end-datetime');
                if (endDateTime && eventData.endDateTime) {
                    endDateTime.textContent = formatDateTime(eventData.endDateTime);
                }

                const locationText = document.querySelector('.location-text');
                if (locationText) locationText.textContent = eventData.location || '';

                const descriptionText = document.querySelector('.description-text');
                if (descriptionText) descriptionText.textContent = eventData.description || '';

                const categoryText = document.querySelector('.category-text');
                if (categoryText) categoryText.textContent = eventData.category || '';

                const feedbackLink = document.querySelector('.feedback-link');
                if (feedbackLink) feedbackLink.textContent = eventData.feedbackLink || '';

                let approvalStatus = document.querySelector('.approval-status');
                // displayGuestData(approvalStatus)
                if (approvalStatus) {
                    approvalStatus.textContent = eventData.requireApproval === "Yes" ? 'Required' : 'Not Required';
                }

                const capacityText = document.querySelector('.capacity-text');
                const waitlistStatus = document.querySelector('.waitlist-status');
            
                if (eventData.capacity == 0) {
                    capacityText.textContent = ``;
                    waitlistStatus.textContent =
                        `Waitlist: ${eventData.allowWaitlist === 'Yes' ? 'Enabled' : 'Disabled'}`;
                }
                else if (eventData.capacity) {
                    capacityText.textContent = `${eventData.capacity}`;
                    waitlistStatus.textContent = 
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
        const closeModalHandler = (modal) => {
            if (modal === deleteModal) {
                deleteModal.classList.remove('active');
                deleteOverlay.classList.remove('active');
            } else {
                modal.style.display = 'none';
            }
        };

        const openEditModalHandler = (e) => {
            e.preventDefault();
            try {
                const currentEventData = getCurrentEventData();
                populateModalForm(currentEventData);
                editModal.style.display = 'block';
            } catch (error) {
                console.error('Error opening edit modal:', error);
            }
        };

        const openDeleteModalHandler = (e) => {
            e.preventDefault();
            deleteModal.classList.add('active');
            deleteOverlay.classList.add('active');
        };

        // Event listeners for modals
        editButton.addEventListener('click', openEditModalHandler);
        deleteButton.addEventListener('click', openDeleteModalHandler);

        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                closeModalHandler(modal);
            });
        });

        cancelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                closeModalHandler(modal);
            });
        });

        // Handle delete modal buttons
        const deleteModalCancelBtn = deleteModal.querySelector('.cancel-btn');
        const deleteModalConfirmBtn = deleteModal.querySelector('.confirm-btn');

        deleteModalCancelBtn.addEventListener('click', () => {
            closeModalHandler(deleteModal);
        });

        deleteModalConfirmBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/delete-event', {
                    method : 'DELETE',
                    headers : { 'Content-Type' : 'application/json' },
                    body : JSON.stringify({ eventID : eventData.eventID })
                })

                if (response.ok) {
                    const result = await response.json()
                    console.log("Backend Sucess: ", result)
                    alert('Event deleted successfully!');
                    closeModalHandler(deleteModal);
                    window.location.href = '/events'
                }
                else {
                    const error = await response.json()
                    console.log("Backend Sucess: ", error)
                }
            } 
            catch (error) {
                console.error('Client Error:', error);
                alert('Failed to delete event. Please try again.');
            }
        });

        // Close delete modal when clicking overlay
        deleteOverlay.addEventListener('click', () => {
            closeModalHandler(deleteModal);
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModalHandler(e.target);
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
                    closeModalHandler(editModal);
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

        // Search functionality
        const guestSearchInput = document.querySelector('#guest .search-input');
        const checkinSearchInput = document.querySelector('#check-in .search-input');

        const filterGuests = (searchTerm, container) => {
            const guests = container.querySelectorAll('.attendee-container, .checkin-guest');
            searchTerm = searchTerm.toLowerCase().trim();

            if (!searchTerm) {
                // If search is empty, show all guests
                guests.forEach(guest => {
                    guest.style.display = '';
                    guest.style.opacity = '1';
                    guest.style.transform = 'translateY(0)';
                });
                return;
            }

            guests.forEach(guest => {
                const guestName = guest.querySelector('.attendee-name, .guest-name').textContent.toLowerCase();
                
                // Check if the name starts with the search term (prefix matching)
                const matchFound = guestName.startsWith(searchTerm);
                
                // Apply smooth transition for showing/hiding
                guest.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                if (matchFound) {
                    guest.style.display = '';
                    guest.style.opacity = '1';
                    guest.style.transform = 'translateY(0)';
                } else {
                    guest.style.opacity = '0';
                    guest.style.transform = 'translateY(-10px)';
                    // Hide the element after the transition
                    setTimeout(() => {
                        guest.style.display = 'none';
                    }, 300);
                }
            });
        };

        // Add debounce function to prevent too many searches while typing
        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        // Apply debounced search to both inputs
        if (guestSearchInput) {
            guestSearchInput.addEventListener('input', debounce((e) => {
                filterGuests(e.target.value, document.getElementById('guest'));
            }, 300));
        }

        if (checkinSearchInput) {
            checkinSearchInput.addEventListener('input', debounce((e) => {
                filterGuests(e.target.value, document.getElementById('check-in'));
            }, 300));
        }

        // Add clear search functionality
        const addClearSearchButton = (input) => {
            const clearButton = document.createElement('button');
            clearButton.className = 'clear-search';
            clearButton.innerHTML = '&times;';
            clearButton.style.display = 'none';
            
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(clearButton);

            clearButton.addEventListener('click', () => {
                input.value = '';
                input.focus();
                clearButton.style.display = 'none';
                
                // Reset all guests in the current tab
                const container = input.closest('.tab-pane');
                const guests = container.querySelectorAll('.attendee-container, .checkin-guest');
                guests.forEach(guest => {
                    guest.style.display = '';
                    guest.style.opacity = '1';
                    guest.style.transform = 'translateY(0)';
                });
            });

            input.addEventListener('input', (e) => {
                clearButton.style.display = e.target.value ? 'block' : 'none';
                // If input is empty, reset the list
                if (!e.target.value) {
                    const container = input.closest('.tab-pane');
                    const guests = container.querySelectorAll('.attendee-container, .checkin-guest');
                    guests.forEach(guest => {
                        guest.style.display = '';
                        guest.style.opacity = '1';
                        guest.style.transform = 'translateY(0)';
                    });
                }
            });
        };

        if (guestSearchInput) addClearSearchButton(guestSearchInput);
        if (checkinSearchInput) addClearSearchButton(checkinSearchInput);

        
        // Guest Tab Handling

        // Function to display guest list
        const displayGuestList = (guests) => {
            try {
                const guestListContainer = document.querySelector('#guest');
                if (!guestListContainer) {
                    console.error('Guest list container not found');
                    return;
                }

                // Clear existing content and add title
                guestListContainer.innerHTML = `
                    <h1>Guest List</h1>
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search guests...">
                    </div>
                    <div class="status-section">
                        <div class="status-container"></div>
                    </div>
                    ${eventData.allowWaitlist === "Yes" ? `
                    <div class="status-section">
                        <h3>Waitlisted</h3>
                        <div class="status-container waitlisted-container"></div>
                    </div>
                    ` : ''}
                `;

                // Get the status containers
                const statusContainer = guestListContainer.querySelector('.status-container:not(.waitlisted-container)');
                const waitlistedContainer = guestListContainer.querySelector('.waitlisted-container');

                guests.forEach(guest => {
                    const guestElement = document.createElement('div');
                    guestElement.className = 'attendee-container';
                    const profilePicPath = guest.profilePic.startsWith('/') ? guest.profilePic : `/${guest.profilePic}`;
                    
                    // Map the status to the appropriate class and display text
                    let statusClass = '';
                    let statusText = '';
                    switch(guest.status.toLowerCase()) {
                        case 'approved':
                            statusClass = 'going';
                            statusText = 'Going';
                            break;
                        case 'declined':
                            statusClass = 'declined';
                            statusText = 'Declined';
                            break;
                        case 'pending':
                            statusClass = 'pending';
                            statusText = 'Pending';
                            break;
                        case 'waitlisted':
                            statusClass = 'waitlisted';
                            statusText = 'Waitlisted';
                            break;
                        default:
                            statusClass = 'pending';
                            statusText = 'Pending';
                    }

                    // Create different HTML based on status
                    if (guest.status.toLowerCase() === 'waitlisted') {
                        // Only append waitlisted guests if the waitlist container exists (i.e., waitlist is enabled)
                        if (waitlistedContainer) {
                            guestElement.innerHTML = `
                                <div class="attendee-info">
                                    <img src="${profilePicPath}" class="icon-flex" alt="Profile">
                                    <span class="attendee-name">${guest.fullname}</span>
                                </div>
                                <div class="attendee-actions">
                                    <div class="onoffswitch">
                                        <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="onoffswitch-${guest.registrationID}" 
                                        ${guest.status.toLowerCase() !== 'declined' ? 'checked' : ''}>
                                        <label class="onoffswitch-label" for="onoffswitch-${guest.registrationID}">
                                            <span class="onoffswitch-inner"></span>
                                            <span class="onoffswitch-switch"></span>
                                        </label>
                                    </div>
                                </div>
                            `;
                            waitlistedContainer.appendChild(guestElement);

                            // Add click event listeners to the toggle buttons
                            const checkbox = guestElement.querySelector('.onoffswitch-checkbox');
                            
                            checkbox.addEventListener('change', async function(e) {
                                // Toggle between states
                                if (this.checked) {
                                    newStatus = 'Approved';

                                    const guestData = {
                                        eventID : guest.eventID,
                                        userID : guest.userID,
                                        status : newStatus
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
                                    
                                } else {
                                    newStatus = 'Declined';

                                    const guestData = {
                                        eventID : guest.eventID,
                                        userID : guest.userID,
                                        status : newStatus
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
                                }
                                
                                // Optionally, re-filter the list if there's a search term
                                const currentSearchTerm = guestSearchInput.value;
                                if (currentSearchTerm) {
                                    filterGuests(currentSearchTerm, document.getElementById('guest'));
                                }
                            });
                        }
                    } else {
                        guestElement.innerHTML = `
                            <div class="attendee-info">
                                <img src="${profilePicPath}" class="icon-flex" alt="Profile">
                                <span class="attendee-name">${guest.fullname}</span>
                            </div>
                            <div class="attendee-status">
                                <span class="event-status ${statusClass}">${statusText}</span>
                            </div>
                            <div class="attendee-actions">
                                <div class="onoffswitch">
                                    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="onoffswitch-${guest.registrationID}" ${guest.status.toLowerCase() !== 'declined' ? 'checked' : ''}>
                                    <label class="onoffswitch-label" for="onoffswitch-${guest.registrationID}">
                                        <span class="onoffswitch-inner"></span>
                                        <span class="onoffswitch-switch"></span>
                                    </label>
                                </div>
                            </div>
                        `;
                        statusContainer.appendChild(guestElement);

                        // Add click event listeners to the toggle buttons
                        const checkbox = guestElement.querySelector('.onoffswitch-checkbox');
                        
                        checkbox.addEventListener('change', async function(e) {
                            const container = this.closest('.attendee-container');
                            const statusElement = container.querySelector('.event-status');

                            // Toggle between states
                            if (this.checked) {
                                statusElement.textContent = 'Going';
                                statusElement.className = 'event-status going';
                                newStatus = 'Approved';

                                const guestData = {
                                    eventID : guest.eventID,
                                    userID : guest.userID,
                                    status : newStatus
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
                            } else {
                                statusElement.textContent = 'Declined';
                                statusElement.className = 'event-status declined';
                                newStatus = 'Declined';

                                const guestData = {
                                    eventID : guest.eventID,
                                    userID : guest.userID,
                                    status : newStatus
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
                            }
                            
                            // Optionally, re-filter the list if there's a search term
                            const currentSearchTerm = guestSearchInput.value;
                            if (currentSearchTerm) {
                                filterGuests(currentSearchTerm, document.getElementById('guest'));
                            }
                        });
                    }
                });

                // Reinitialize search functionality after displaying the guest list
                const newGuestSearchInput = guestListContainer.querySelector('.search-input');
                if (newGuestSearchInput) {
                    newGuestSearchInput.addEventListener('input', debounce((e) => {
                        filterGuests(e.target.value, guestListContainer);
                    }, 300));
                    addClearSearchButton(newGuestSearchInput);
                }
            } catch (error) {
                console.error('Error displaying guest list:', error);
            }
        };


        //Check In Tab Handling

        // // Function to display check-in list
        // const displayCheckInList = (guests) => {
        //     try {
        //         console.log('Displaying check-in list:', guests);
        //         const checkInContainer = document.querySelector('#check-in');
        //         if (!checkInContainer) {
        //             console.error('Check-in container not found');
        //             return;
        //         }

        //         const existingGuests = checkInContainer.querySelectorAll('.checkin-guest');
        //         existingGuests.forEach(guest => guest.remove());

        //         guests.forEach(guest => {
        //             const guestElement = document.createElement('div');
        //             guestElement.className = 'checkin-guest';
        //             const profilePicPath = guest.profilePic.startsWith('/') ? guest.profilePic : `/${guest.profilePic}`;
        //             guestElement.innerHTML = `
        //                 <div class="guest-info">
        //                     <img src="${profilePicPath}" class="icon-flex" alt="Profile">
        //                     <span class="guest-name">${guest.fullname}</span>
        //                 </div>
        //                 <div class="attendance-options">
        //                     <label class="attendance-option attended">
        //                         <input type="radio" name="attendance${guest.registrationID}" value="attended">
        //                         <span>Attended</span>
        //                     </label>
        //                     <label class="attendance-option not-attended">
        //                         <input type="radio" name="attendance${guest.registrationID}" value="not-attended">
        //                         <span>Not Attended</span>
        //                     </label>
        //                 </div>
        //             `;
        //             checkInContainer.appendChild(guestElement);

        //             // Add event listeners for the radio buttons
        //             const radioButtons = guestElement.querySelectorAll('input[type="radio"]');
        //             radioButtons.forEach(radio => {
        //                 radio.addEventListener('change', function() {
        //                     const checkinGuest = this.closest('.checkin-guest');
        //                     checkinGuest.classList.remove('attended', 'not-attended');
                            
        //                     if (this.value === 'attended') {
        //                         checkinGuest.classList.add('attended');
        //                     } else if (this.value === 'not-attended') {
        //                         checkinGuest.classList.add('not-attended');
        //                     }

        //                     // Update the guest's attendance status in the data
        //                     guest.attendanceStatus = this.value;
        //                     console.log(`Updated attendance for ${guest.fullname}: ${this.value}`);
        //                 });
        //             });
        //         });
        //     } catch (error) {
        //         console.error('Error displaying check-in list:', error);
        //     }
        // };

        displayEventData(eventData);

        let pendingGuests = registrationData.filter(guest => guest.status == 'Pending' || guest.status == 'Approved' || guest.status == 'Declined')
        pendingGuests.sort((a, b) => b.registrationID - a.registrationID)

        let waitlistedGuests = registrationData.filter(guest => guest.status == 'Waitlisted')
        registrationData = [...pendingGuests, ...waitlistedGuests]

        displayGuestList(registrationData);
        // displayCheckInList(approvedGuestsData);
    }
});
