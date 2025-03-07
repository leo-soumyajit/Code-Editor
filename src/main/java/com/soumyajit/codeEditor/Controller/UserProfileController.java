package com.soumyajit.codeEditor.Controller;

import com.soumyajit.codeEditor.Dtos.UserProfileDTOS;
import com.soumyajit.codeEditor.Service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/user-profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class UserProfileController {
    private final UserProfileService userProfileService;



    @GetMapping("/myProfile")
    public ResponseEntity<UserProfileDTOS> getUserProfile() {

        return ResponseEntity.ok(userProfileService.getUserProfile());
    }


    @PutMapping(value = "/update", consumes = "application/json")
    public ResponseEntity<UserProfileDTOS> updateUserProfile(@RequestBody Map<String, Object> updates
                                                             ) {
        return ResponseEntity.ok(userProfileService.updateUserProfile(updates));
    }

    @PutMapping(value = "/updateImage", consumes = {"multipart/form-data"})
    public ResponseEntity<UserProfileDTOS> updateProfileImage(
            @RequestParam("profilePicture") MultipartFile profilePicture) throws IOException {
        return ResponseEntity.ok(userProfileService.updateProfileImage(profilePicture));
    }


}














