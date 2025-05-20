document.addEventListener('DOMContentLoaded', async () => {
    let eventData = null

    try {
        eventData = await window.eventDataReady
    }
    catch (e) {
        console.error("Failed to load event data:", e);
    }

    console.log("Client Selected Event Details: ", eventData)

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
            const response = await fetch(`/edit-event/${eventData.eventID}`, {
                method: 'PUT',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify(updatedEventData)
            })

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
            console.log("Client Error: ", e)
        }
    });

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
});
