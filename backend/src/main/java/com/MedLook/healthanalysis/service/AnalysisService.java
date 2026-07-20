package com.MedLook.healthanalysis.service;

import com.MedLook.healthanalysis.dto.AnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final String uploadDir = "./uploads/";
    private final String mlServerUrl = "http://localhost:5000/analyze";

    public AnalysisResponse analyzeImage(MultipartFile image, String userId) throws IOException {
        try {
            // 1. Отправляем изображение в ML сервер
            AnalysisResult result = callMLServer(image);
            
            // 2. Формируем ответ
            return AnalysisResponse.builder()
                .success(true)
                .message("Analysis completed successfully")
                .diagnosis(result.diagnosis)
                .confidence(result.confidence)
                .description(result.description)
                .symptoms(result.symptoms)
                .recommendations(result.recommendations)
                .featureImportance(result.featureImportance)
                .riskLevel(result.riskLevel)
                .imageUrl("") // URL будет добавлен на фронтенде
                .build();
                
        } catch (Exception e) {
            log.error("Error during analysis", e);
            return AnalysisResponse.builder()
                .success(false)
                .message("Analysis failed: " + e.getMessage())
                .build();
        }
    }

    private String saveImage(MultipartFile image, String userId) throws IOException {
        // Создаем уникальное имя файла
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = "analysis_" + System.currentTimeMillis() + extension;
        
        // Создаем директорию если не существует
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Сохраняем файл
        Path filePath = uploadPath.resolve(filename);
        Files.copy(image.getInputStream(), filePath);
        
        return filePath.toString();
    }

    private AnalysisResult callMLServer(MultipartFile image) throws IOException {
        // Временная заглушка - в реальности нужно отправлять HTTP запрос к Flask серверу
        // и парсить JSON ответ
        
        // Заглушка для демонстрации
        List<AnalysisResponse.Symptom> symptoms = Arrays.asList(
            AnalysisResponse.Symptom.builder()
                .name("Асимметрия")
                .value(75.0)
                .description("Обнаружена легкая асимметрия лица")
                .build(),
            AnalysisResponse.Symptom.builder()
                .name("Неровные края")
                .value(60.0)
                .description("Незначительные неровности в контурах")
                .build(),
            AnalysisResponse.Symptom.builder()
                .name("Неоднородный цвет")
                .value(80.0)
                .description("Наблюдается неоднородность цвета кожи")
                .build()
        );
        
        List<String> recommendations = Arrays.asList(
            "Консультация дерматолога в течение 7 дней",
            "Избегать прямого солнечного света",
            "Использовать солнцезащитные средства SPF 50+",
            "Регулярно увлажнять кожу"
        );
        
        Map<String, Double> featureImportance = new HashMap<>();
        featureImportance.put("skin_tone", 0.25);
        featureImportance.put("lip_color", 0.20);
        featureImportance.put("eye_area", 0.18);
        featureImportance.put("symmetry", 0.15);
        featureImportance.put("texture", 0.12);
        featureImportance.put("moisture", 0.10);
        
        return new AnalysisResult(
            "Предварительный анализ кожи",
            85.0,
            "На изображении обнаружены признаки, требующие внимания специалиста. Рекомендуется консультация дерматолога.",
            symptoms,
            recommendations,
            featureImportance,
            "medium"
        );
    }

    private AnalysisResult runPythonAnalysis(String imagePath) throws IOException, InterruptedException {
        // Подготавливаем команду для запуска Python скрипта
        List<String> command = Arrays.asList(
            pythonPath,
            mlScriptPath,
            imagePath
        );
        
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(Paths.get("../ML").toFile());
        
        // Запускаем процесс
        Process process = processBuilder.start();
        
        // Ждем завершения (максимум 30 секунд)
        boolean finished = process.waitFor(30, java.util.concurrent.TimeUnit.SECONDS);
        
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Analysis timeout");
        }
        
        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException("Python script failed with exit code: " + exitCode);
        }
        
        // Парсим результат (здесь нужно будет реализовать парсинг вывода Python скрипта)
        return parseAnalysisResult(process);
    }

    private AnalysisResult parseAnalysisResult(Process process) throws IOException {
        // Читаем JSON ответ от Python скрипта
        String jsonOutput = new String(process.getInputStream().readAllBytes());
        log.info("Python script output: {}", jsonOutput);
        
        try {
            // Парсим JSON (здесь нужно добавить JSON библиотеку)
            // Пока используем заглушку, но в реальности нужно парсить JSON
            
            // Временная заглушка для демонстрации
            List<AnalysisResponse.Symptom> symptoms = Arrays.asList(
                AnalysisResponse.Symptom.builder()
                    .name("Асимметрия")
                    .value(75.0)
                    .description("Обнаружена легкая асимметрия лица")
                    .build(),
                AnalysisResponse.Symptom.builder()
                    .name("Неровные края")
                    .value(60.0)
                    .description("Незначительные неровности в контурах")
                    .build(),
                AnalysisResponse.Symptom.builder()
                    .name("Неоднородный цвет")
                    .value(80.0)
                    .description("Наблюдается неоднородность цвета кожи")
                    .build()
            );
            
            List<String> recommendations = Arrays.asList(
                "Консультация дерматолога в течение 7 дней",
                "Избегать прямого солнечного света",
                "Использовать солнцезащитные средства SPF 50+",
                "Регулярно увлажнять кожу"
            );
            
            Map<String, Double> featureImportance = new HashMap<>();
            featureImportance.put("skin_tone", 0.25);
            featureImportance.put("lip_color", 0.20);
            featureImportance.put("eye_area", 0.18);
            featureImportance.put("symmetry", 0.15);
            featureImportance.put("texture", 0.12);
            featureImportance.put("moisture", 0.10);
            
            return new AnalysisResult(
                "Предварительный анализ кожи",
                85.0,
                "На изображении обнаружены признаки, требующие внимания специалиста. Рекомендуется консультация дерматолога.",
                symptoms,
                recommendations,
                featureImportance,
                "medium"
            );
            
        } catch (Exception e) {
            log.error("Error parsing Python script output", e);
            throw new RuntimeException("Failed to parse analysis result", e);
        }
    }

    private static class AnalysisResult {
        final String diagnosis;
        final double confidence;
        final String description;
        final List<AnalysisResponse.Symptom> symptoms;
        final List<String> recommendations;
        final Map<String, Double> featureImportance;
        final String riskLevel;

        AnalysisResult(String diagnosis, double confidence, String description,
                      List<AnalysisResponse.Symptom> symptoms, List<String> recommendations,
                      Map<String, Double> featureImportance, String riskLevel) {
            this.diagnosis = diagnosis;
            this.confidence = confidence;
            this.description = description;
            this.symptoms = symptoms;
            this.recommendations = recommendations;
            this.featureImportance = featureImportance;
            this.riskLevel = riskLevel;
        }
    }
}
