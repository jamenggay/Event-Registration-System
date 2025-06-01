 import { toastData, showToast } from "./alert-toast.js";
      //Sign-up form
      document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            email: document.getElementById('email').value,
            mobileNum: document.getElementById('mobileNum').value,
            fullName: document.getElementById('fullName').value,
            userName: document.getElementById('userName').value,
            password: document.getElementById('password').value            
        };

        const response = await fetch('/register', {
          method: 'POST',
          headers: {'Content-type': 'application/json'}, //sending json file
          body: JSON.stringify(data) //converts object into JSON string
        });

        let result = await response.json();
        
        if(result.success){
          
          toastData.success.message = result.message;
          showToast('success');
          document.getElementById("signup-form").classList.add("hidden");
          document.getElementById("login-form").classList.remove("hidden");
        }
        else{
          toastData.danger.title = "Error!"
          toastData.danger.message = result.message
          showToast('danger');
        }
      });
        //LOGIN FORM
        document.getElementById('login-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const data = {
            userName: document.getElementById('login_userName').value,
            password: document.getElementById('login_password').value
          };

          const response = await fetch("/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
          });
          let result = await response.json();
        if(result.success){
          
          toastData.success.message = result.message;
          showToast('success');
          localStorage.setItem('currentUser', data.userName)
          setTimeout(() => {
            window.location.href = "/events"
          }, 3000);
          
        }
        else{
          toastData.danger.title = "Error!"
          toastData.danger.message = result.message
          showToast('danger');
        }
        

        });