document.addEventListener("DOMContentLoaded", () => {

  // ----- Standard Popup Function (for regular notifications) -----
  function standardPopupShow(message, type) {
    // Try to get the standard popup element
    let popup = document.getElementById("popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "popup";
      popup.className = "popup";
      document.body.appendChild(popup);
    }
    // Set the class based on the type (success or error)
    popup.className = "popup " + (type === "success" ? "success" : "error") + " show";
    popup.textContent = message;
    popup.style.display = "block";
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => {
        popup.style.display = "none";
      }, 300);
    }, 3000);
  }

  // ----- Overlay Popup Function (for redirect countdown on token expiry) -----
  function popupShow(message, type, redirect = false) {
    // Use the overlay element with id "popupid"
    let overlay = document.getElementById("popupid");
    if (!overlay) {
      // Create the overlay popup if not present
      overlay = document.createElement("div");
      overlay.id = "popupid";
      overlay.className = "popup-overlay";

      const msgEl = document.createElement("span");
      msgEl.id = "popup-message";
      overlay.appendChild(msgEl);

      const timerEl = document.createElement("div");
      timerEl.id = "popup-timer";
      overlay.appendChild(timerEl);

      const closeEl = document.createElement("span");
      closeEl.className = "close";
      closeEl.innerHTML = "&times;";
      overlay.appendChild(closeEl);

      document.body.appendChild(overlay);
    }

    const popupMessage = document.getElementById("popup-message");
    const popupTimer = document.getElementById("popup-timer");

    // Do not override your CSS styles—only set text content.
    popupMessage.textContent = message;
    overlay.style.display = "block";

    if (redirect) {
      let seconds = 3;
      popupTimer.textContent = "Redirecting in " + seconds + " seconds...";
      const interval = setInterval(() => {
        seconds--;
        popupTimer.textContent = "Redirecting in " + seconds + " seconds...";
        if (seconds <= 0) {
          clearInterval(interval);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userid");
          window.location.href = "../LoginAndSignup/auth.html";
        }
      }, 1000);
    } else {
      popupTimer.textContent = "";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 3000);
    }

    // Attach close listener to the close button.
    const closeBtn = overlay.getElementsByClassName("close")[0];
    if (closeBtn) {
      closeBtn.onclick = () => { overlay.style.display = "none"; };
    }
    // Hide overlay when clicking outside the popup content.
    window.onclick = (event) => {
      if (event.target === overlay) {
        overlay.style.display = "none";
      }
    };
  }

  // ----- Utility: Check if Response indicates token expiry (401 Unauthorized) -----
  function checkAuth(response) {
    if (response.status === 401) {
      popupShow("Your session has expired. Redirecting in 3 seconds...", "error", true);
      return false;
    }
    return true;
  }

  // ----- Fetch User Profile Data -----
  fetch("http://localhost:1010/user-profile/myProfile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("accessToken")
    },
  })
  .then(response => {
    if (!checkAuth(response)) return;
    if (!response.ok) {
      throw new Error("Failed to fetch profile: " + response.status);
    }
    return response.json();
  })
  .then(apiResponse => {
    const profile = apiResponse.data;
    const defaultImage = "Images/default-profile.png";

    // Update profile image
    const profileImage = document.getElementById("profileImage");
    if (profileImage) {
      profileImage.src = profile.profileImage || defaultImage;
    }

    // Update text details
    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
      userNameEl.textContent = profile.userName || profile.name || "Anonymous";
    }
    const bioEl = document.getElementById("bio");
    if (bioEl) {
      bioEl.textContent = "Bio: " + (profile.bio || "Not provided");
    }

    // Update social detail texts
    const githubIdEl = document.getElementById("githubId");
    if (githubIdEl) { githubIdEl.textContent = profile.githubId || "-"; }
    const linkedInIdEl = document.getElementById("linkedInId");
    if (linkedInIdEl) { linkedInIdEl.textContent = profile.linkedInId || "-"; }
    const geeksforgeeksIdEl = document.getElementById("geeksforgeeksId");
    if (geeksforgeeksIdEl) { geeksforgeeksIdEl.textContent = profile.geeksforgeeksId || "-"; }
    const leetcodeIdEl = document.getElementById("leetcodeId");
    if (leetcodeIdEl) { leetcodeIdEl.textContent = profile.leetcodeId || "-"; }

    // Update social media icon links if provided
    const githubLink = document.getElementById("githubLink");
    if (githubLink && profile.github) {
      githubLink.href = profile.github;
    }
    const linkedinLink = document.getElementById("linkedinLink");
    if (linkedinLink && profile.linkedin) {
      linkedinLink.href = profile.linkedin;
    }
    const gfgLink = document.getElementById("gfgLink");
    if (gfgLink && profile.geeksforgeeks) {
      gfgLink.href = profile.geeksforgeeks;
    }
    const leetcodeLink = document.getElementById("leetcodeLink");
    if (leetcodeLink && profile.leetcode) {
      leetcodeLink.href = profile.leetcode;
    }
  })
  .catch(error => {
    console.error("Error fetching profile:", error);
    standardPopupShow("Error fetching profile. Please try again.", "error");
  });

  // ----- Handle Profile Image Update -----
  const editImageBtn = document.getElementById("editImageBtn");
  if (editImageBtn) {
    editImageBtn.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";

      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            popupShow("Access token is missing or invalid!", "error", true);
            return;
          }
          const imageFormData = new FormData();
          imageFormData.append("profilePicture", file);
          console.log("Uploading file:", file.name);

          try {
            const response = await fetch("http://localhost:1010/user-profile/updateImage", {
              method: "PUT",
              mode: "cors",
              credentials: "include",
              headers: {
                "Authorization": "Bearer " + accessToken,
              },
              body: imageFormData,
            });

            if (!checkAuth(response)) return;

            console.log("Image update response status:", response.status);

            if (response.ok) {
              const updatedProfile = await response.json();
              // Try both direct and nested properties
              let newImageUrl = updatedProfile.profileImage;
              if (!newImageUrl && updatedProfile.data) {
                newImageUrl = updatedProfile.data.profileImage;
              }
              if (newImageUrl) {
                document.getElementById("profileImage").src = newImageUrl;
                standardPopupShow("Profile image updated successfully!", "success");
              } else {
                standardPopupShow("Profile image updated, but no image URL returned.", "error");
              }
            } else {
              let errMsg = "Failed to update profile image.";
              try {
                const errorResponse = await response.json();
                errMsg = errorResponse.apiError && errorResponse.apiError.message ? errorResponse.apiError.message : errMsg;
              } catch (parseError) {
                console.error("Error parsing error response:", parseError);
              }
              standardPopupShow(errMsg, "error");
            }
          } catch (error) {
            console.error("Error uploading profile image:", error);
            standardPopupShow("Error uploading profile image. Please try again.", "error");
          }
        }
      };
      fileInput.click();
    });
  }

  // Standard popup fallback function in case overlay isn't used
  function standardPopupShow(message, type) {
    let popup = document.getElementById("popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "popup";
      popup.className = "popup";
      document.body.appendChild(popup);
    }
    popup.className = "popup " + (type === "success" ? "success" : "error") + " show";
    popup.textContent = message;
    popup.style.display = "block";
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => {
        popup.style.display = "none";
      }, 300);
    }, 3000);
  }
});
