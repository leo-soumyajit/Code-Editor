package com.soumyajit.codeEditor.Dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfileDTOS {
    private Long id;
    private String name;
    private String bio;
    private String profileImage;
    private String githubId;
    private String linkedInId;
    private String geeksforgeeksId;
    private String leetcodeId;
    private LocalDateTime lastActive;
    private String activityStatus;

}
