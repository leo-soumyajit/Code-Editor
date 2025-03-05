const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

let otpVerified = false;

// Loader functions for OTP operations.
function showLoader() {
    const loader = document.getElementById('otpLoader');
    if (loader) {
        loader.style.display = 'block';
    }
}

function hideLoader() {
    const loader = document.getElementById('otpLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!otpVerified) {
        showPopup('Please verify the OTP before signing up.', 'error');
        return;
    }

    const form = event.target;
    const formData = new FormData(form);

    const user = {};
    formData.forEach((value, key) => {
        user[key] = value;
    });

    try {
        const response = await fetch('http://localhost:1010/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const result = await response.json();
            showPopup(`Signup successful! Message: ${result.message || 'No message returned'}`, 'success');
        } else {
            const errorPayload = await response.json();
            const errorMessage = (errorPayload.apiError && errorPayload.apiError.message) ||
                (errorPayload.data && errorPayload.data.message) ||
                'User is already present with this email';
            showPopup(`Signup failed: ${errorMessage}`, 'error');
        }
    } catch (error) {
        showPopup(`Error: ${error.message}`, 'error');
    }
});

document.getElementById('password').addEventListener('input', (event) => {
    const strength = getPasswordStrength(event.target.value);
    const strengthText = document.getElementById('password-strength');
    strengthText.textContent = `Password Strength: ${strength}`;
});

document.getElementById('sendOtpButton').addEventListener('click', async () => {
    const email = document.getElementById('email').value;

    if (!email) {
        showPopup('Please enter your email before requesting OTP.', 'error');
        return;
    }

    showLoader(); // Show loader while sending OTP

    try {
        const response = await fetch('http://localhost:1010/otp/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        if (response.ok) {
            const result = await response.json();
            showPopup(result.data || 'OTP sent successfully. Check your email.', 'success');
            document.getElementById('otp').classList.remove('hidden');
            document.getElementById('verifyOtpButton').classList.remove('hidden');
        } else {
            const errorPayload = await response.json();
            const errorMessage = (errorPayload.apiError && errorPayload.apiError.message) ||
                (errorPayload.data && errorPayload.data.message) ||
                'No error message returned';
            showPopup(`Failed to send OTP: ${errorMessage}`, 'error');
        }
    } catch (error) {
        showPopup(`Error: ${error.message}`, 'error');
    } finally {
        hideLoader(); // Hide loader after OTP send attempt
    }
});

document.getElementById('verifyOtpButton').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    if (!otp) {
        showPopup('Please enter the OTP.', 'error');
        return;
    }

    showLoader(); // Show loader while verifying OTP

    try {
        const response = await fetch('http://localhost:1010/otp/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, otp: otp })
        });

        if (response.ok) {
            const result = await response.json();
            showPopup(result.data || 'OTP verified successfully. Now you can set your password.', 'success');
            otpVerified = true;
            document.getElementById('passwordField').classList.remove('hidden');
            document.getElementById('sendOtpButton').classList.add('hidden');
            document.getElementById('otp').classList.add('hidden');
            document.getElementById('verifyOtpButton').classList.add('hidden');
            document.getElementById('signupButton').classList.remove('hidden');
        } else {
            const errorPayload = await response.json();
            const errorMessage = (errorPayload.apiError && errorPayload.apiError.message) ||
                (errorPayload.data && errorPayload.data.message) ||
                'No error message returned';
            showPopup(`OTP verification failed: ${errorMessage}`, 'error');
        }
    } catch (error) {
        showPopup(`Error: ${error.message}`, 'error');
    } finally {
        hideLoader(); // Hide loader after OTP verification attempt
    }
});

document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('togglePassword');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = 'Show';
    }
});

function getPasswordStrength(password) {
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Moderate';
    return 'Strong';
}

function showPopup(message, type) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.display = 'block';

    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = () => { popup.style.display = 'none'; };

    window.onclick = (event) => {
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    };
}
