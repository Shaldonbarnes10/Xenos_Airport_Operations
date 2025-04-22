function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}


document.addEventListener('DOMContentLoaded', function () {
    hideLoader(); // Hide loader if it shows up by default

    // Signup
    document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const designation = document.getElementById('designation').value;

        const passwordRequirements = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRequirements.test(password)) {
            alert("Password must be at least 8 characters long, include at least one uppercase letter, and one number.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const userData = { username, password, designation };

        try {
            showLoader();
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // alert(result.message);
            e.target.reset();
            window.location.href = '/signin.html';
        } catch (error) {
            console.error('Signup failed:', error);
            alert('Signup failed: ' + error.message);
        } finally {
            hideLoader();
        }
    });

    // Signin
    document.getElementById('signinForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userData = { username, password };

        try {
            showLoader();
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            e.target.reset();
            window.location.href = '/landingPage.html';
        } catch (error) {
            console.error('Signin failed:', error);
            alert('Signin failed: ' + error.message);
        } finally {
            hideLoader();
        }
    });
});

