package com.MedLook.healthanalysis.controller;

import com.MedLook.healthanalysis.service.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PhotoController {

    private final PhotoService photoService;

    @PostMapping("/upload-photo")
    public ResponseEntity<String> uploadUserPhoto(
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("userEmail") String userEmail) {
        
        try {
            log.info("Received photo upload request for user: {}, file size: {}", 
                    userEmail, photo.getSize());

            // Проверка файла
            if (photo.isEmpty()) {
                return ResponseEntity.badRequest().body("Photo file is empty");
            }

            if (!isImageFile(photo)) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Сохраняем фото
            String photoUrl = photoService.uploadUserPhoto(photo, userEmail);
            
            return ResponseEntity.ok("Photo uploaded successfully: " + photoUrl);
            
        } catch (IOException e) {
            log.error("Error uploading photo for user: {}", userEmail, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading photo: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/photo")
    public ResponseEntity<byte[]> getUserPhoto(@RequestParam String userEmail) {
        try {
            byte[] photoBytes = photoService.getUserPhoto(userEmail);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // или определить тип из файла
            headers.setContentLength(photoBytes.length);
            
            return new ResponseEntity<>(photoBytes, headers, HttpStatus.OK);
            
        } catch (IOException e) {
            log.error("Error retrieving photo for user: {}", userEmail, e);
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/photo")
    public ResponseEntity<String> deleteUserPhoto(@RequestParam String userEmail) {
        try {
            photoService.deleteUserPhoto(userEmail);
            return ResponseEntity.ok("Photo deleted successfully");
            
        } catch (IOException e) {
            log.error("Error deleting photo for user: {}", userEmail, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting photo: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
}