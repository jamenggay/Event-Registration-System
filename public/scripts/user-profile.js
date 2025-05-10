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
            };

            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading file. Please try again.');
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    });

    // Auto-expand textarea functionality
    document.querySelectorAll('textarea').forEach((textarea) => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    // Password Modal Functions
    function openPasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = "block";
        modal.classList.remove("hide");
        modal.classList.add("show");
    }

    function closePasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.classList.remove("show");
        modal.classList.add("hide");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }

    // Add click event to change password container
    document.querySelector('.change_password_container').addEventListener('click', openPasswordModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('passwordModal');
        if (event.target === modal) {
            closePasswordModal();
        }
    });

    // Close button functionality
    document.querySelector('.close').addEventListener('click', closePasswordModal);

    // Handle password form submission
    async function savePassword() {
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long!');
            return;
        }

        try {
            // Here you would typically make an API call to your backend
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            if (response.ok) {
                alert('Password changed successfully!');
                closePasswordModal();
                // Clear the inputs
                document.getElementById('oldPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to change password. Please try again.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('An error occurred while changing the password. Please try again.');
        }
    }

    // Add click event to save button
    document.querySelector('.modal-content button').addEventListener('click', savePassword);
});
