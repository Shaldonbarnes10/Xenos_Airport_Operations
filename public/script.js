document.addEventListener('DOMContentLoaded', function () {
    // Signup Form
    document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const designation = document.getElementById('designation').value;

        // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Prepare the data to be sent
        const userData = { username, password, designation };

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message);  // Alert success message from the server

            // Reset the form
            e.target.reset();
            window.location.href = '/signin.html';
        } catch (error) {
            console.error('Signup failed:', error);
            alert('Signup failed: ' + error.message);  // Show error message to the user
        }
    });

    // Signin Form
    document.getElementById('signinForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Prepare the data to be sent
        const userData = { username, password };

        try {
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message);  // Alert success message from the server

            // Reset the form
            e.target.reset();
            window.location.href = '/landingPage.html';
        } catch (error) {
            console.error('Signin failed:', error);
            alert('Signin failed: ' + error.message);  // Show error message to the user
        }
    });
});



