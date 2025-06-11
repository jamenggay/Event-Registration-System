import { toastData, showToast } from "./alert-toast.js";
      //Sign-up form
      document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
      
        // Fix: use document.getElementById instead of getElementById
        const pass = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (pass !== confirmPass) {
          toastData.danger.title = "Error!";
          toastData.danger.message = "Passwords do not match!";
          showToast('danger');
          return;
        }
        else if (pass.length < 8 && pass.lenght > 20) {
          toastData.danger.title = "Error!";
          toastData.danger.message = "Password must be at 8-20 characters long!";
          showToast('danger');
          return;
        }

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
          clearForm();
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
          
          localStorage.setItem('currentUser', data.userName)
    
            window.location.href = "/events";
        
          
        }
        else{
          toastData.danger.title = "Error!"
          toastData.danger.message = result.message
          showToast('danger');
        }
        

        });

        function clearForm() {
          document.getElementById("signup-form").reset();
          document.getElementById("login-form").reset();
          
        }