document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('uploadButton');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');

    // Trigger file input when upload button is clicked
    uploadButton.addEventListener('click', () => {
        profileUpload.click();
    });

    // Handle file selection
    profileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check if the file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Create a FileReader to read the image
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Update the preview image
                profilePreview.src = e.target.result;
                
                // Here you would typically upload the file to your server
                // For now, we'll just log the file data
                console.log('File selected:', file.name);
                
                // You can add your server upload logic here
                // Example:
                // const formData = new FormData();
                // formData.append('profileImage', file);
                // fetch('/api/upload-profile', {
                //     method: 'POST',
                //     body: formData
                // })
                // .then(response => response.json())
                // .then(data => console.log('Success:', data))
                // .catch(error => console.error('Error:', error));
            };

            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading file. Please try again.');
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    });
});
