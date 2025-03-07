document.addEventListener("DOMContentLoaded", () => {
    // --- Custom Popup Function ---
    function showPopup(message, type) {
        let popup = document.getElementById("popup");
        if (!popup) {
            popup = document.createElement("div");
            popup.id = "popup";
            popup.className = "popup";
            document.body.appendChild(popup);
        }
        // Set appearance based on type
        popup.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
        popup.style.color = "#fff";
        popup.textContent = message;
        popup.style.display = "block";
        setTimeout(() => {
            popup.style.display = "none";
        }, 3000);
    }

    // --- FETCH THE USER PROFILE ---
    fetch("http://localhost:1010/user-profile/myProfile", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("accessToken")
        }
    })
    .then(response => {
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
        if (profileImage) { profileImage.src = profile.profileImage || defaultImage; }

        // Update text details
        const userNameEl = document.getElementById("userName");
        if (userNameEl) { userNameEl.textContent = profile.userName || profile.name || "Anonymous"; }
        const bioEl = document.getElementById("bio");
        if (bioEl) { bioEl.textContent = "Bio: " + (profile.bio || "Not provided"); }
        const githubIdEl = document.getElementById("githubId");
        if (githubIdEl) { githubIdEl.textContent = profile.githubId || "-"; }
        const linkedInIdEl = document.getElementById("linkedInId");
        if (linkedInIdEl) { linkedInIdEl.textContent = profile.linkedInId || "-"; }
        const geeksforgeeksIdEl = document.getElementById("geeksforgeeksId");
        if (geeksforgeeksIdEl) { geeksforgeeksIdEl.textContent = profile.geeksforgeeksId || "-"; }
        const leetcodeIdEl = document.getElementById("leetcodeId");
        if (leetcodeIdEl) { leetcodeIdEl.textContent = profile.leetcodeId || "-"; }

        // Populate edit form fields (text fields only)
        const editNameEl = document.getElementById("editName");
        if (editNameEl) { editNameEl.value = profile.userName || profile.name || ""; }
        const editBioEl = document.getElementById("editBio");
        if (editBioEl) { editBioEl.value = profile.bio || ""; }
        const editGithubEl = document.getElementById("editGithub");
        if (editGithubEl) { editGithubEl.value = profile.githubId || ""; }
        const editLinkedInEl = document.getElementById("editLinkedIn");
        if (editLinkedInEl) { editLinkedInEl.value = profile.linkedInId || ""; }
        const editGeeksforgeeksEl = document.getElementById("editGeeksforgeeks");
        if (editGeeksforgeeksEl) { editGeeksforgeeksEl.value = profile.geeksforgeeksId || ""; }
        const editLeetcodeEl = document.getElementById("editLeetcode");
        if (editLeetcodeEl) { editLeetcodeEl.value = profile.leetcodeId || ""; }
    })
    .catch(error => {
        console.error("Error fetching profile:", error);
        showPopup("Error fetching profile. Please try again.", "error");
    });

    // --- TOGGLE EDIT MODE ---
    const editProfileBtn = document.getElementById("editProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const profileDisplay = document.getElementById("profileDisplay");
    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileBtn && cancelEditBtn && profileDisplay && editProfileForm) {
        editProfileBtn.addEventListener("click", () => {
            console.log("Edit Profile button clicked");
            profileDisplay.style.display = "none";
            editProfileForm.style.display = "block";
        });
        cancelEditBtn.addEventListener("click", () => {
            console.log("Cancel Edit button clicked");
            editProfileForm.style.display = "none";
            profileDisplay.style.display = "flex";
        });
    } else {
        console.warn("Toggle elements not found. Please check HTML IDs.");
    }

    // --- HANDLE PROFILE TEXT UPDATE VIA PUT (JSON) ---
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const updatedProfileData = {
                name: document.getElementById("editName").value,
                bio: document.getElementById("editBio").value,
                githubId: document.getElementById("editGithub").value,
                linkedInId: document.getElementById("editLinkedIn").value,
                geeksforgeeksId: document.getElementById("editGeeksforgeeks").value,
                leetcodeId: document.getElementById("editLeetcode").value
            };
            const accessToken = localStorage.getItem("accessToken");
            console.log("Using accessToken:", accessToken);
            if (!accessToken) {
                showPopup("Access token is missing or invalid!", "error");
                return;
            }
            try {
                const response = await fetch("http://localhost:1010/user-profile/update", {
                    method: "PUT",
                    mode: "cors",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + accessToken
                    },
                    body: JSON.stringify(updatedProfileData)
                });
                console.log("Response Status:", response.status);
                if (response.ok) {
                    const updatedProfile = await response.json();
                    showPopup("Profile updated successfully!", "success");
                    setTimeout(() => location.reload(), 1500);
                } else {
                    const errorResponse = await response.json();
                    showPopup("Failed to update profile: " +
                        ((errorResponse.apiError && errorResponse.apiError.message) || "Unknown error"), "error");
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                showPopup("Error updating profile. Please try again.", "error");
            }
        });
    }

    // --- HANDLE PROFILE IMAGE UPDATE (HOVER EDIT BUTTON) ---
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
                    const imageFormData = new FormData();
                    imageFormData.append("profilePicture", file);
                    try {
                        const response = await fetch("http://localhost:1010/user-profile/updateImage", {
                            method: "PUT",
                            mode: "cors",
                            credentials: "include",
                            headers: {
                                "Authorization": "Bearer " + accessToken
                            },
                            body: imageFormData
                        });
                        if (response.ok) {
                            const updatedProfile = await response.json();
                            document.getElementById("profileImage").src = updatedProfile.profileImage;
                            showPopup("Profile image updated successfully!", "success");
                        } else {
                            let errMsg = "Failed to update profile image.";
                            try {
                                const errorResponse = await response.json();
                                errMsg = errorResponse.apiError && errorResponse.apiError.message
                                         ? errorResponse.apiError.message
                                         : errMsg;
                            } catch (parseError) {}
                            showPopup(errMsg, "error");
                        }
                    } catch (error) {
                        console.error("Error uploading profile image:", error);
                        showPopup("Error uploading profile image. Please try again.", "error");
                    }
                }
            };
            fileInput.click();
        });
    }
});
