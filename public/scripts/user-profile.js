document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('uploadButton');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');

    uploadButton.addEventListener('click', () => {
        profileUpload.click();
    });

    profileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            profilePreview.src = e.target.result;
        };

        reader.onerror = function() {
            console.error('Error reading file');
            alert('Error reading file. Please try again.');
        };

        reader.readAsDataURL(file);
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
        
        document.getElementById('edit-fullname').value = document.getElementById('fullname').value;
        document.getElementById('edit-username').value = document.getElementById('username').value;
        document.getElementById('edit-email').value = document.getElementById('email').value;
        document.getElementById('edit-mobile').value = document.getElementById('mobile').value;
        document.getElementById('edit-bio').value = document.getElementById('bio').value;

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

    window.saveProfile = async function() {
        const fullname = document.getElementById('edit-fullname').value;
        const username = document.getElementById('edit-username').value;
        const email = document.getElementById('edit-email').value;
        const mobile = document.getElementById('edit-mobile').value;
        const bio = document.getElementById('edit-bio').value;

        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());

        let hasError = false;

        if (!fullname) {
            showValidationMessage(document.getElementById('edit-fullname'), 'Full name is required');
            hasError = true;
        }
        if (!username) {
            showValidationMessage(document.getElementById('edit-username'), 'Username is required');
            hasError = true;
        }
        if (!email || !validateEmail(email)) {
            showValidationMessage(document.getElementById('edit-email'), 'Valid email address is required');
            hasError = true;
        }
        if (!mobile || !validateMobile(mobile)) {
            showValidationMessage(document.getElementById('edit-mobile'), 'Valid 11-digit mobile number is required');
            hasError = true;
        }

        if (hasError) return;

        try {
            // TODO: Implement API call to save profile changes
            
            document.getElementById('fullname').value = fullname;
            document.getElementById('username').value = username;
            document.getElementById('email').value = email;
            document.getElementById('mobile').value = mobile;
            document.getElementById('bio').value = bio;

            closeEditModal();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile changes. Please try again.');
        }
    }

    window.addEventListener('click', (event) => {
        const editModal = document.getElementById('editProfileModal');
        if (event.target === editModal) {
            closeEditModal();
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
});
