package com.MedLook.healthanalysis.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class PhotoUploadRequest {
    private MultipartFile photo;
    private String userEmail; // Идентификатор пользователя
}