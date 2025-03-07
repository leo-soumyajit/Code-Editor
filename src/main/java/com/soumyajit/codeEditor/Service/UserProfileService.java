package com.soumyajit.codeEditor.Service;

import com.soumyajit.codeEditor.Dtos.UserProfileDTOS;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface UserProfileService {
    UserProfileDTOS updateUserProfile(Map<String, Object> updates);

    UserProfileDTOS getUserProfile();

    UserProfileDTOS updateProfileImage(MultipartFile profilePicture);
}
