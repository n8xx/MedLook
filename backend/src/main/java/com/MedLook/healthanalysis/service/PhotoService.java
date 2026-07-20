package com.MedLook.healthanalysis.service;

import com.MedLook.healthanalysis.entity.User;
import com.MedLook.healthanalysis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoService {

    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String uploadUserPhoto(MultipartFile photo, String userEmail) throws IOException {
        // Находим пользователя
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        // Создаем директорию для загрузок, если она не существует
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Генерируем уникальное имя файла
        String originalFileName = photo.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        // Сохраняем файл
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(photo.getInputStream(), filePath);

        // Обновляем пользователя с ссылкой на фото
        String photoUrl = "/uploads/" + uniqueFileName;
        user.setProfileImageUrl(photoUrl);
        userRepository.save(user);

        log.info("Photo uploaded successfully for user: {}, file: {}", userEmail, uniqueFileName);
        
        return photoUrl;
    }

    public byte[] getUserPhoto(String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProfileImageUrl() == null) {
            throw new RuntimeException("User has no photo");
        }

        String fileName = user.getProfileImageUrl().replace("/uploads/", "");
        Path filePath = Paths.get(uploadDir, fileName);
        
        return Files.readAllBytes(filePath);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    public void deleteUserPhoto(String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProfileImageUrl() != null) {
            String fileName = user.getProfileImageUrl().replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            
            user.setProfileImageUrl(null);
            userRepository.save(user);
            
            log.info("Photo deleted for user: {}", userEmail);
        }
    }
}