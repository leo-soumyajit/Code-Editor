package com.soumyajit.codeEditor.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.soumyajit.codeEditor.Dtos.UserProfileDTOS;
import com.soumyajit.codeEditor.Entities.User;
import com.soumyajit.codeEditor.Exception.ResourceNotFound;
import com.soumyajit.codeEditor.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.util.ReflectionUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final Cloudinary cloudinary;

    @Transactional
    public UserProfileDTOS updateUserProfile(Map<String, Object> updates) {
        // Get the currently authenticated user.
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<String> restrictedFields = Arrays.asList("email", "password");

        // Update allowed fields using Reflection.
        updates.forEach((key, value) -> {
            if (restrictedFields.contains(key)) {
                throw new IllegalArgumentException("email and password cannot be updated through this method");
            }
            Field fieldToBeSaved = ReflectionUtils.findRequiredField(User.class, key);
            fieldToBeSaved.setAccessible(true);
            ReflectionUtils.setField(fieldToBeSaved, user, value);
        });

        // Save the updated user.
        User updatedUser = userRepository.save(user);

        // Map the User entity to the DTO.
        UserProfileDTOS dto = modelMapper.map(updatedUser, UserProfileDTOS.class);

        // Set activity status:
        if (updatedUser.getLastActive() == null) {
            dto.setActivityStatus("grey");
        } else {
            Duration activeDuration = Duration.between(updatedUser.getLastActive(), LocalDateTime.now());
            dto.setActivityStatus(calculateActivityStatus(activeDuration));
        }

        return dto;
    }
    @Override
    public UserProfileDTOS getUserProfile() {
        // Retrieve the currently authenticated user
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Map the user to the DTO
        UserProfileDTOS dto = modelMapper.map(user, UserProfileDTOS.class);

        // If lastActive is non-null, calculate the active duration and assign an appropriate status.
        // Otherwise, default to "grey" (inactive) similar to LeetCode's style.
        if (user.getLastActive() != null) {
            Duration activeDuration = Duration.between(user.getLastActive(), LocalDateTime.now());
            dto.setActivityStatus(calculateActivityStatus(activeDuration));
        } else {
            dto.setActivityStatus("grey");
        }

        return dto;
    }

    @Transactional
    public UserProfileDTOS updateProfileImage(MultipartFile profilePicture) {
        // Get the currently authenticated user.
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Upload the image to Cloudinary.
        Map uploadResult = null;
        try {
            uploadResult = cloudinary.uploader().upload(profilePicture.getBytes(), ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        String profilePictureUrl = uploadResult.get("url").toString();
        user.setProfileImage(profilePictureUrl);

        // Save the updated user.
        User updatedUser = userRepository.save(user);

        // Map to DTO and set activity status.
        UserProfileDTOS dto = modelMapper.map(updatedUser, UserProfileDTOS.class);
        if (updatedUser.getLastActive() == null) {
            dto.setActivityStatus("grey");
        } else {
            Duration activeDuration = Duration.between(updatedUser.getLastActive(), LocalDateTime.now());
            dto.setActivityStatus(calculateActivityStatus(activeDuration));
        }

        return dto;
    }



    private String calculateActivityStatus(Duration duration) {
        // Convert duration to minutes for comparison.
        long minutes = duration.toMinutes();
        if (minutes < 30) {
            return "deep-green";  // Dark Green if active for less than 30 minutes.
        } else if (minutes >= 60) {
            return "light-green"; // Light Green if active for one hour or more.
        } else {
            return "medium-green"; // For durations between 30 min and 1 hour.
        }
    }
}
