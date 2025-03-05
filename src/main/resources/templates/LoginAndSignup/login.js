document.getElementById('signinForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  if (!email || !password) {
    showPopup('Please enter both email and password.', 'error');
    return;
  }

  const credentials = { email, password };

  try {
    const response = await fetch('http://localhost:1010/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (response.ok) {
      const result = await response.json();
      showPopup('Login successful!', 'success');

      // Store the access token and user ID, if provided.
      localStorage.setItem('accessToken', result.data.accessToken);
      if (result.data.id !== undefined && result.data.id !== null) {
        localStorage.setItem('userid', result.data.id.toString());
      } else {
        console.error("User ID not returned by the login endpoint.");
      }

      window.location.href = '../Editor/index.html'; // Redirect after login
    } else {
      // For any non-ok response (with wrong password, etc.), show generic error message.
      showPopup('Login failed. Please check your credentials and try again.', 'error');
    }
  } catch (error) {
    showPopup('Login failed. Please try again later.', 'error');
  }
});

function showPopup(message, type) {
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');
  popupMessage.textContent = message;
  popup.style.display = 'block';

  const closeBtn = document.getElementsByClassName('close')[0];
  closeBtn.onclick = () => { popup.style.display = 'none'; };

  window.onclick = (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  };
}
