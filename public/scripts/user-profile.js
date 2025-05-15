document.addEventListener('DOMContentLoaded', async function() {
    window.updatedUserData = {};

    let userData = null

    try {
        userData = await window.userDataReady;
    } 
    catch (e) {
        console.error("Failed to load user data:", e);
    }

    let userEventsCreated = null

    try {
        userEventsCreated = await window.userEventsCreatedReady;
    } 
    catch (e) {
        console.error("Failed to load user data:", e);
    }

    console.log(userEventsCreated)

    const fullname = document.getElementById('fullname');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');
    const bio = document.getElementById('bio');
    const profilePic = document.getElementById('profilePreview');

    fullname.value = userData.fullname;
    username.value = userData.username;
    email.value = userData.email;
    mobile.value = userData.mobileNumber;
    bio.value = userData.bio || "";
    profilePic.src = userData.profilePic 
    profilePic.onerror =  function() {
        this.onerror = null; // prevent infinite loop if fallback fails
        this.src = "../assets/icons/profile-icon.jpeg";
    };
    
    const uploadButton = document.getElementById('uploadButton');
    const profileUpload = document.getElementById('profileUpload');
    const profilePreview = document.getElementById('profilePreview');

    uploadButton.addEventListener('click', () => {
        profileUpload.click();
    });

    profileUpload.addEventListener('change', async function(e) {
        let file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const getBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
        
            reader.onload = function(e) {
                profilePreview.src = e.target.result;
                resolve(reader.result)
            };

            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading file. Please try again.');
            };

            reader.readAsDataURL(file);
        })

        let profilePic = await getBase64(file)
        let imageFileName = file.name.replace(/\.[^/.]+$/, '')
        let imageFileExtension = file.name.split('.').pop().toLowerCase()

        window.updatedUserData.base64ProfilePic = profilePic
        window.updatedUserData.imageFileName = imageFileName
        window.updatedUserData.imageFileExtension = imageFileExtension

        console.log("Pfp Details: ", window.updatedUserData)
        
        try {
            const response = await fetch("/user-profile", {
                method: "PUT",
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify(window.updatedUserData)
            })

            if (response.ok) {
                const result = await response.json()
                console.log("Server Success: ", result)
                alert("User profile edit success.")
            }
            else {
                const result = await response.json();
                console.log("Server Failed: ", result)
                alert("User profile edit failed.")
            }
        }
        catch (e) {
            console.log("Client Error: ", e)
            alert("An error occurred while updating user info.");
        }
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

            console.log("User Details: ", window.updatedUserData)
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

    // if (!userData.eventsCreated.length == 0) {
    //     const eventsCreatedContainer = document.querySelector('.events_created_container')

    //     eventsCreatedContainer.innerHTML = `
    //         <div class="event_container">
    //             <div class="event_bg" style="background-image: url('https://99designs-blog.imgix.net/blog/wp-content/uploads/2018/12/Gradient_builder_2.jpg?auto=format&q=60&w=1815&h=1815&fit=crop&crop=faces')"></div>
    //             <div class="event_info">
    //                 <div class="event_title">
    //                     <h4></h4>
    //                 </div>
    //                 <div class="event_desc">
    //                     <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
    //                 </div>
    //                 <div class="event_footer">
    //                     <div class="event_date">
    //                         <p>May 01, 2025</p>
    //                     </div>
    //                     <div class="event_more">
    //                         <a href="#" class="events-card-button">Info</a>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     `
    // }
});
