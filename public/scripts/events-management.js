document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const modal = document.getElementById('editEventModal');
    const editButton = document.querySelector('.edit-button');
    const closeModal = document.querySelector('.close-modal');
    const cancelButton = document.querySelector('.cancel-button');
    const editEventForm = document.getElementById('editEventForm');
    const uploadButton = document.querySelector('.upload_button');
    const eventImage = document.getElementById('eventImage');
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
    const formatDateTime = (date, time) => {
        try {
            const [year, month, day] = date.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            
            const dateObj = new Date(year, month - 1, day, hours, minutes);
            
            return dateObj.toLocaleString('en-US', {
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
    const displayEventData = (eventData) => {
        try {
            if (eventData.image) {
                document.getElementById('eventImage').src = eventData.image;
                document.getElementById('eventImage').style.display = 'block';
            }

            document.querySelector('.event_name').textContent = eventData.name || '';

            if (eventData.startDate && eventData.startTime) {
                document.querySelector('.start-datetime').textContent = 
                    formatDateTime(eventData.startDate, eventData.startTime);
            }
            if (eventData.endDate && eventData.endTime) {
                document.querySelector('.end-datetime').textContent = 
                    formatDateTime(eventData.endDate, eventData.endTime);
            }

            document.querySelector('.location-text').textContent = eventData.location || '';
            document.querySelector('.description-text').textContent = eventData.description || '';
            document.querySelector('.category-text').textContent = eventData.category || '';
            document.querySelector('.feedback-link').textContent = eventData.feedbackLink || '';
            document.querySelector('.approval-status').textContent = 
                eventData.requireApproval ? 'Required' : 'Not Required';

            if (eventData.capacity) {
                document.querySelector('.capacity-text').textContent = `Maximum: ${eventData.capacity}`;
                document.querySelector('.waitlist-status').textContent = 
                    `Waitlist: ${eventData.waitlist ? 'Enabled' : 'Disabled'}`;
            }
        } catch (error) {
            console.error('Error displaying event data:', error);
        }
    };

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
            closeModalHandler();
        } catch (error) {
            console.error('Error handling form submission:', error);
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

    // For testing/development - remove in production
    const sampleEventData = {
        name: "Event ni R2J",
        startDate: "2024-03-20",
        startTime: "14:00",
        endDate: "2024-03-20",
        endTime: "16:00",
        location: "NU - Manila",
        description: "ang tulang ito ay para sa mga batang ina.",
        category: "Technology",
        feedbackLink: "https://feedback.example.com",
        requireApproval: true,
        capacity: 100,
        waitlist: true
    };
    displayEventData(sampleEventData);
});
