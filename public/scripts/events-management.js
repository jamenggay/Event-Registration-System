document.addEventListener('DOMContentLoaded', () => {
    // Dummy Data ni Rishaye
    const eventData = {
        "allowWaitlist": "Yes",
        "capacity": 100,
        "category": "Technology",
        "description": "Join us in 𝐒𝐩𝐚𝐫𝐤𝐟𝐞𝐬𝐭 𝟐𝟎𝟐𝟓, a hackathon where brilliant minds come together to solve real-world challenges through 𝐜𝐫𝐞𝐚𝐭𝐢𝐯𝐢𝐭𝐲, 𝐜𝐨𝐥𝐥𝐚𝐛𝐨𝐫𝐚𝐭𝐢𝐨𝐧, 𝐚𝐧𝐝 𝐜𝐮𝐭𝐭𝐢𝐧𝐠-𝐞𝐝𝐠𝐞 𝐢𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧.",
        "endDateTime": "2025-06-07T18:30:00.000Z",
        "eventID": 29,
        "eventName": "SparkFest 2025",
        "featureImage": "/uploads/featureImage/event_sample 5 (1).jpg",
        "feedbackLink": "https://www.facebook.com/gdg.pupmnl",
        "lastUpdated": "2025-05-27T20:05:57.747Z",
        "location": "The Globe Tower, 2608 7th Ave, Taguig, 1634 Metro Manila",
        "requireApproval": "Yes",
        "startDateTime": "2025-06-07T08:00:00.000Z"
    };

    const registrationData = [
        {
            "eventID": 29,
            "fullname": "Jamaine Tuazon",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 3,
            "status": "Approved",
            "userID": 7
        },
        {
            "eventID": 29,
            "fullname": "Jorge Fuertes",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 4,
            "status": "Approved",
            "userID": 8
        },
        {
            "eventID": 29,
            "fullname": "Reynald Quijano",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 6,
            "status": "Declined",
            "userID": 9
        },
        {
            "eventID": 29,
            "fullname": "Rishaye Melad",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 9,
            "status": "Waitlisted",
            "userID": 10
        },
        {
            "eventID": 29,
            "fullname": "Fe Fer Mint",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 11,
            "status": "Pending",
            "userID": 12
        }
    ];

    const approvedGuestsData = [
        {
            "eventID": 29,
            "fullname": "Jamaine Tuazon",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 3,
            "status": "Approved",
            "userID": 7
        },
        {
            "eventID": 29,
            "fullname": "Jorge Fuertes",
            "profilePic": "../assets/icons/profile-icon.jpeg",
            "registrationID": 4,
            "status": "Approved",
            "userID": 8
        }
    ];

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
    const eventImage = document.getElementById('eventImage');
    const imagePreview = document.getElementById('imagePreview');

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
    const formatDateTime = (dateTimeString) => {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    // Function to parse date and time from formatted string
    const parseDateTime = (formattedString) => {
        try {
            const dateObj = new Date(formattedString);
            if (isNaN(dateObj.getTime())) {
                throw new Error('Invalid date string');
            }
            
            return {
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toTimeString().slice(0, 5)
            };
        } catch (error) {
            console.error('Error parsing date:', error);
            return { date: '', time: '' };
        }
    };

    // Function to display event data
    const displayEventData = (data) => {
        try {
            console.log('Displaying event data:', data); // Debug log

            if (data.featureImage) {
                const imagePath = data.featureImage.startsWith('/') ? data.featureImage : `/${data.featureImage}`;
                const eventImage = document.getElementById('eventImage');
                eventImage.src = imagePath;
                eventImage.style.display = 'block';
                console.log('Setting image path:', imagePath); // Debug log
            }

            // Update event details
            const eventName = document.querySelector('.event_name');
            if (eventName) eventName.textContent = data.eventName || '';

            const startDateTime = document.querySelector('.start-datetime');
            if (startDateTime && data.startDateTime) {
                startDateTime.textContent = formatDateTime(data.startDateTime);
            }

            const endDateTime = document.querySelector('.end-datetime');
            if (endDateTime && data.endDateTime) {
                endDateTime.textContent = formatDateTime(data.endDateTime);
            }

            const locationText = document.querySelector('.location-text');
            if (locationText) locationText.textContent = data.location || '';

            const descriptionText = document.querySelector('.description-text');
            if (descriptionText) descriptionText.textContent = data.description || '';

            const categoryText = document.querySelector('.category-text');
            if (categoryText) categoryText.textContent = data.category || '';

            const feedbackLink = document.querySelector('.feedback-link');
            if (feedbackLink) feedbackLink.textContent = data.feedbackLink || '';

            const approvalStatus = document.querySelector('.approval-status');
            if (approvalStatus) {
                approvalStatus.textContent = data.requireApproval === "Yes" ? 'Required' : 'Not Required';
            }

            const capacityText = document.querySelector('.capacity-text');
            if (capacityText && data.capacity) {
                capacityText.textContent = `Maximum: ${data.capacity}`;
            }

            const waitlistStatus = document.querySelector('.waitlist-status');
            if (waitlistStatus) {
                waitlistStatus.textContent = `Waitlist: ${data.allowWaitlist === "Yes" ? 'Enabled' : 'Disabled'}`;
            }
        } catch (error) {
            console.error('Error displaying event data:', error);
        }
    };

    // Function to display guest list
    const displayGuestList = (guests) => {
        try {
            console.log('Displaying guest list:', guests);
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
                        `;
                        waitlistedContainer.appendChild(guestElement);
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
                            <div class="toggle-wrapper ${guest.status.toLowerCase() === 'declined' ? 'active-right' : 
                                                      guest.status.toLowerCase() === 'pending' ? 'active-neutral' : 
                                                      'active-left'}" id="toggle-${guest.registrationID}">
                                <div class="slider"></div>
                                <label onclick="setPosition('left', ${guest.registrationID})">Dalo</label>
                                <label onclick="setPosition('right', ${guest.registrationID})">Decline</label>
                            </div>
                        </div>
                    `;
                    statusContainer.appendChild(guestElement);

                    // Add click event listeners to the toggle buttons only for non-waitlisted guests
                    const toggleGroup = guestElement.querySelector('.toggle-wrapper');
                    
                    // Add the setPosition function to the window object
                    window.setPosition = function(position, registrationId) {
                        const toggle = document.getElementById(`toggle-${registrationId}`);
                        const container = toggle.closest('.attendee-container');
                        const statusElement = container.querySelector('.event-status');
                        
                        toggle.classList.remove('active-left', 'active-right');
                        
                        if (position === 'left') {
                            toggle.classList.add('active-left');
                            statusElement.textContent = 'Going';
                            statusElement.className = 'event-status going';
                            newStatus = 'Approved';
                        } else if (position === 'right') {
                            toggle.classList.add('active-right');
                            statusElement.textContent = 'Declined';
                            statusElement.className = 'event-status declined';
                            newStatus = 'Declined';
                        }

                        // Find the guest in registrationData and update their status
                        const guestName = container.querySelector('.attendee-name').textContent;
                        const guestToUpdate = registrationData.find(guest => guest.fullname === guestName);

                        if (guestToUpdate) {
                            guestToUpdate.status = newStatus;
                            console.log(`Updated status for ${guestToUpdate.fullname} to ${newStatus}`);
                            
                            // Optionally, re-filter the list if there's a search term
                            const currentSearchTerm = guestSearchInput.value;
                            if (currentSearchTerm) {
                                filterGuests(currentSearchTerm, document.getElementById('guest'));
                            }
                        }
                    };
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

    // Function to display check-in list
    const displayCheckInList = (guests) => {
        try {
            console.log('Displaying check-in list:', guests);
            const checkInContainer = document.querySelector('#check-in');
            if (!checkInContainer) {
                console.error('Check-in container not found');
                return;
            }

            const existingGuests = checkInContainer.querySelectorAll('.checkin-guest');
            existingGuests.forEach(guest => guest.remove());

            guests.forEach(guest => {
                const guestElement = document.createElement('div');
                guestElement.className = 'checkin-guest';
                const profilePicPath = guest.profilePic.startsWith('/') ? guest.profilePic : `/${guest.profilePic}`;
                guestElement.innerHTML = `
                    <div class="guest-info">
                        <img src="${profilePicPath}" class="icon-flex" alt="Profile">
                        <span class="guest-name">${guest.fullname}</span>
                    </div>
                    <div class="attendance-options">
                        <label class="attendance-option attended">
                            <input type="radio" name="attendance${guest.registrationID}" value="attended">
                            <span>Attended</span>
                        </label>
                        <label class="attendance-option not-attended">
                            <input type="radio" name="attendance${guest.registrationID}" value="not-attended">
                            <span>Not Attended</span>
                        </label>
                    </div>
                `;
                checkInContainer.appendChild(guestElement);

                // Add event listeners for the radio buttons
                const radioButtons = guestElement.querySelectorAll('input[type="radio"]');
                radioButtons.forEach(radio => {
                    radio.addEventListener('change', function() {
                        const checkinGuest = this.closest('.checkin-guest');
                        checkinGuest.classList.remove('attended', 'not-attended');
                        
                        if (this.value === 'attended') {
                            checkinGuest.classList.add('attended');
                        } else if (this.value === 'not-attended') {
                            checkinGuest.classList.add('not-attended');
                        }

                        // Update the guest's attendance status in the data
                        guest.attendanceStatus = this.value;
                        console.log(`Updated attendance for ${guest.fullname}: ${this.value}`);
                    });
                });
            });
        } catch (error) {
            console.error('Error displaying check-in list:', error);
        }
    };

    // Add CSS classes for attendance status
    const style = document.createElement('style');
    style.textContent = `
        .checkin-guest.attended {
            background-color: #28a745;
        }
        .checkin-guest.attended .guest-name,
        .checkin-guest.attended .attendance-option span {
            color: white;
        }
        .checkin-guest.attended .guest-info img {
            filter: brightness(0) invert(1);
        }
        .checkin-guest.not-attended {
            background-color: #dc3545;
        }
        .checkin-guest.not-attended .guest-name,
        .checkin-guest.not-attended .attendance-option span {
            color: white;
        }
        .checkin-guest.not-attended .guest-info img {
            filter: brightness(0) invert(1);
        }
        .attendance-option {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            background-color: white;
        }
        .attendance-option input[type="radio"] {
            display: none;
        }
        .attendance-option span {
            font-size: 0.9rem;
            font-weight: 500;
            color: #333;
        }
        .attendance-option.attended {
            background-color: #28a745;
        }
        .attendance-option.attended span {
            color: white;
        }
        .attendance-option.not-attended {
            background-color: #dc3545;
        }
        .attendance-option.not-attended span {
            color: white;
        }
    `;
    document.head.appendChild(style);

    // Function to populate modal form with current event data
    const populateModalForm = (eventData) => {
        try {
            document.getElementById('eventName').value = eventData.name || '';

            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const formatDate = (date) => date.toISOString().split('T')[0];
            const formatTime = (date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            const startDate = eventData.startDate ? new Date(eventData.startDate) : now;
            document.getElementById('startDate').value = formatDate(startDate);
            document.getElementById('startTime').value = formatTime(startDate);

            const endDate = eventData.endDate ? new Date(eventData.endDate) : tomorrow;
            document.getElementById('endDate').value = formatDate(endDate);
            document.getElementById('endTime').value = formatTime(endDate);

            document.getElementById('location').value = eventData.location || '';
            document.getElementById('description').value = eventData.description || '';
            document.getElementById('category').value = eventData.category || '';
            document.getElementById('feedbackLink').value = eventData.feedbackLink || '';
            document.getElementById('max_capacity').value = eventData.capacity || '';
            
            document.getElementById('require_approval').checked = eventData.requireApproval || false;
            document.getElementById('over_capacity_waitlist').checked = eventData.waitlist || false;

            if (eventData.image) {
                imagePreview.src = eventData.image;
            } else {
                imagePreview.src = '../assets/images/default-event.jpg';
            }
        } catch (error) {
            console.error('Error populating modal form:', error);
        }
    };

    // Function to get current event data from the page
    const getCurrentEventData = () => {
        try {
            const startDateTime = parseDateTime(document.querySelector('.start-datetime').textContent);
            const endDateTime = parseDateTime(document.querySelector('.end-datetime').textContent);
            
            return {
                name: document.querySelector('.event_name').textContent,
                startDate: startDateTime.date,
                startTime: startDateTime.time,
                endDate: endDateTime.date,
                endTime: endDateTime.time,
                location: document.querySelector('.location-text').textContent,
                description: document.querySelector('.description-text').textContent,
                category: document.querySelector('.category-text').textContent,
                feedbackLink: document.querySelector('.feedback-link').textContent,
                requireApproval: document.querySelector('.approval-status').textContent === 'Required',
                capacity: parseInt(document.querySelector('.capacity-text').textContent.split(': ')[1]) || 0,
                waitlist: document.querySelector('.waitlist-status').textContent.includes('Enabled'),
                image: document.getElementById('eventImage').src
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

    deleteModalConfirmBtn.addEventListener('click', () => {
        try {
            // Here you would typically make an API call to delete the event
            console.log('Deleting event:', eventData.eventID);
            
            // Close the modal and show a success message
            closeModalHandler(deleteModal);
            alert('Event deleted successfully!');
            
            // Redirect to events list page or handle as needed
            // window.location.href = '/events';
        } catch (error) {
            console.error('Error deleting event:', error);
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
    uploadButton.addEventListener('click', () => eventImage.click());

    eventImage.addEventListener('change', (e) => {
        try {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error handling image upload:', error);
        }
    });

    // Handle form submission
    editEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const formData = {
                name: document.getElementById('eventName').value,
                startDate: document.getElementById('startDate').value,
                startTime: document.getElementById('startTime').value,
                endDate: document.getElementById('endDate').value,
                endTime: document.getElementById('endTime').value,
                location: document.getElementById('location').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                feedbackLink: document.getElementById('feedbackLink').value,
                requireApproval: document.getElementById('require_approval').checked,
                capacity: parseInt(document.getElementById('max_capacity').value) || 0,
                waitlist: document.getElementById('over_capacity_waitlist').checked,
                image: imagePreview.src
            };

            displayEventData(formData);
            closeModalHandler(editModal);
        } catch (error) {
            console.error('Error handling form submission:', error);
        }
    });

    // Initialize the display
    console.log('Initializing display with event data:', eventData);
    displayEventData(eventData);
    displayGuestList(registrationData);
    displayCheckInList(approvedGuestsData);
});

