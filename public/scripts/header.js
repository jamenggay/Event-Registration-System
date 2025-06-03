$(document).ready(function() {
    $("#header").load("../views/running-marginals/header.html", function() {
        console.log('Header loaded!');
    });

    async function getUserBasicInfo() {
        try {
            const response = await fetch("/basic-profile", {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const profilePic = document.getElementById('profile-picture')
                profilePic.src = result.profilePic
            } 
            else {
                const error = await response.json();
                console.log("Backend Failed: ", error);
            }
        } 
        catch (e) {
            console.log("Client Error: ", e);
        }
    }

    getUserBasicInfo();
});
