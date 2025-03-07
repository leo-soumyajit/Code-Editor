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
        // Set popup classes based on message type
        popup.className = "popup " + (type === "success" ? "success" : "error");
        popup.textContent = message;
        popup.classList.add("show");
        setTimeout(() => {
            popup.classList.remove("show");
        }, 3000);
    }

    // --- Fetch and Populate Profile Data ---
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
        document.getElementById("editName").value = profile.userName || profile.name || "";
        document.getElementById("editBio").value = profile.bio || "";
        document.getElementById("editGithub").value = profile.githubId || "";
        document.getElementById("editLinkedIn").value = profile.linkedInId || "";
        document.getElementById("editGeeksforgeeks").value = profile.geeksforgeeksId || "";
        document.getElementById("editLeetcode").value = profile.leetcodeId || "";
    })
    .catch(error => {
        console.error("Error fetching profile:", error);
        showPopup("Error fetching profile. Please try again.", "error");
    });

    // --- Handle Profile Update Submission (TEXT FIELDS as JSON PUT) ---
    const editProfileForm = document.getElementById("editProfileForm");
    editProfileForm.addEventListener("submit", async (event) => {
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
                setTimeout(() => { window.location.href = "profile.html"; }, 1500);
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

    // --- Handle Cancel Button ---
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    cancelEditBtn.addEventListener("click", () => {
        window.location.href = "profile.html";
    });

    // --- Handle Profile Image Update ---
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
                                errMsg = errorResponse.apiError && errorResponse.apiError.message ? errorResponse.apiError.message : errMsg;
                            } catch (e) {}
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
