package com.MedLook.healthanalysis.controller;

import com.MedLook.healthanalysis.dto.AnalysisRequest;
import com.MedLook.healthanalysis.dto.AnalysisResponse;
import com.MedLook.healthanalysis.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/analyze")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping
    public ResponseEntity<AnalysisResponse> analyzePhoto(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "userId", required = false) String userId) {
        
        try {
            log.info("Received analysis request for image: {}, size: {}", 
                    image.getOriginalFilename(), image.getSize());

            // Проверка файла
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    AnalysisResponse.builder()
                        .success(false)
                        .message("Image file is empty")
                        .build()
                );
            }

            if (!isImageFile(image)) {
                return ResponseEntity.badRequest().body(
                    AnalysisResponse.builder()
                        .success(false)
                        .message("Only image files are allowed")
                        .build()
                );
            }

            // Анализ изображения
            AnalysisResponse response = analysisService.analyzeImage(image, userId);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            log.error("Error analyzing image", e);
            return ResponseEntity.internalServerError().body(
                AnalysisResponse.builder()
                    .success(false)
                    .message("Error analyzing image: " + e.getMessage())
                    .build()
            );
        } catch (Exception e) {
            log.error("Unexpected error during analysis", e);
            return ResponseEntity.internalServerError().body(
                AnalysisResponse.builder()
                    .success(false)
                    .message("Unexpected error: " + e.getMessage())
                    .build()
            );
        }
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
}
