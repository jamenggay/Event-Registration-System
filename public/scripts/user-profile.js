document.addEventListener('DOMContentLoaded', async function() {
    window.updatedUserData = {};

    let userData = null

    try {
        userData = await window.originalUserDataReady;
    } 
    catch (e) {
        console.error("Failed to load user data:", e);
    }

    const fullname = document.getElementById('fullname');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');
    const bio = document.getElementById('bio');

    fullname.value = userData.fullname;
    username.value = userData.username;
    email.value = userData.email;
    mobile.value = userData.mobileNumber;
    bio.value = userData.bio || "";

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

    // const rawProfilePic = document.getElementById('profileUpload').files[0]
    // console.log(rawProfilePic)

    // const getBase64 = rawProfilePic => new Promise((resolve, reject) => {
    //       const reader = new FileReader();
    //       reader.readAsDataURL(rawProfilePic);
    //       reader.onload = () => resolve(reader.result);
    //       reader.onerror = reject;
    //   });

    // const profilePic = await getBase64(rawProfilePic)
    // const imageFileName = rawProfilePic.name.replace(/\.[^/.]+$/, '')
    // const imageFileExtension = rawProfilePic.name.split('.').pop().toLowerCase()

    // window.updatedUserData.base64FProfilePic  = profilePic
    // window.updatedUserData.imageFileName = imageFileName
    // window.updatedUserData.imageFileExtension = imageFileExtension

    // console.log(window.updatedUserData.base64FProfilePic, window.updatedUserData.imageFileName,
    //     window.updatedUserData.imageFileExtension
    // )

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
            // TODO: Implement API call to save profile changes
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

            console.log(window.updatedUserData)
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
