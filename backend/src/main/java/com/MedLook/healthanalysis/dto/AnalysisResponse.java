package com.MedLook.healthanalysis.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalysisResponse {
    private boolean success;
    private String message;
    private String diagnosis;
    private double confidence;
    private String description;
    private List<Symptom> symptoms;
    private List<String> recommendations;
    private Map<String, Double> featureImportance;
    private String riskLevel;
    private String imageUrl;
    
    @Data
    @Builder
    public static class Symptom {
        private String name;
        private double value;
        private String description;
    }
}
