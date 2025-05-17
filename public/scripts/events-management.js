$(document).ready(function() {
    // Tab switching functionality
    $('.tab-button').click(function() {
        // Remove active class from all buttons and panes
        $('.tab-button').removeClass('active');
        $('.tab-pane').removeClass('active');
        
        // Add active class to clicked button
        $(this).addClass('active');
        
        // Show corresponding tab content
        const tabId = $(this).data('tab');
        $(`#${tabId}`).addClass('active');
    });

    // Function to format date and time
    function formatDateTime(date, time) {
        const dateObj = new Date(`${date}T${time}`);
        return dateObj.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    // Function to display event data
    function displayEventData(eventData) {
        // Set event image
        if (eventData.image) {
            $('#eventImage').attr('src', eventData.image).show();
        }

        // Set event name
        $('.event_name').text(eventData.name);

        // Set dates
        $('.start-datetime').text(formatDateTime(eventData.startDate, eventData.startTime));
        $('.end-datetime').text(formatDateTime(eventData.endDate, eventData.endTime));

        // Set location
        $('.location-text').text(eventData.location);

        // Set description
        $('.description-text').text(eventData.description);

        // Set category
        $('.category-text').text(eventData.category);

        // Set feedback link
        $('.feedback-link').text(eventData.feedbackLink);

        // Set approval status
        $('.approval-status').text(eventData.requireApproval ? 'Required' : 'Not Required');

        // Set capacity
        if (eventData.capacity) {
            $('.capacity-text').text(`Maximum: ${eventData.capacity}`);
            $('.waitlist-status').text(`Waitlist: ${eventData.waitlist ? 'Enabled' : 'Disabled'}`);
        }
    }

    // Check for event data in localStorage when page loads
    const savedEventData = localStorage.getItem('eventData');
    if (savedEventData) {
        const eventData = JSON.parse(savedEventData);
        displayEventData(eventData);
        // Clear the data after displaying it
        localStorage.removeItem('eventData');
    }

    // Edit button functionality
    $('.edit-button').click(function() {
        // Redirect back to create event page with data
        const currentEventData = {
            name: $('.event_name').text(),
            location: $('.location-text').text(),
            description: $('.description-text').text(),
            category: $('.category-text').text(),
            feedbackLink: $('.feedback-link').text(),
            // Add other fields as needed
        };
        
        localStorage.setItem('editEventData', JSON.stringify(currentEventData));
        // window.location.href = '../link here';
    });

    // Listen for event creation
    window.addEventListener('eventCreated', function(e) {
        const eventData = e.detail;
        displayEventData(eventData);
    });

    // For testing/development - remove in production
    // Simulate receiving event data
    const sampleEventData = {
        name: "Sample Event",
        startDate: "2024-03-20",
        startTime: "14:00",
        endDate: "2024-03-20",
        endTime: "16:00",
        location: "Sample Location",
        description: "This is a sample event description.",
        category: "Technology",
        feedbackLink: "https://feedback.example.com",
        requireApproval: true,
        capacity: 100,
        waitlist: true
    };
    displayEventData(sampleEventData);
});
