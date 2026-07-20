#!/usr/bin/env python3
"""
API версия анализа изображения для интеграции с Java Spring Boot приложением.
Принимает путь к изображению как аргумент командной строки и возвращает JSON результат.
"""

import cv2
import pandas as pd
import numpy as np
import pickle
import json
import sys
import os
from features_extractor import process_image 
from human_interp import get_human_interpretation 

def analyze_image_for_api(image_path, model_path='models/random_forest_model.pkl'):
    """
    Анализирует изображение и возвращает результат в формате JSON для API.
    """
    try:
        # 1. Загрузка модели
        if not os.path.exists(model_path):
            return {
                "success": False,
                "error": f"Model not found at {model_path}",
                "message": "ML model is not available. Please train the model first."
            }

        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # 2. Проверка существования изображения
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": f"Image not found at {image_path}",
                "message": "Image file does not exist."
            }

        # 3. Извлечение признаков
        new_features_dict = process_image(image_path)
        
        if new_features_dict is None:
            return {
                "success": False,
                "error": "Feature extraction failed",
                "message": "Could not extract features from the image. Please check image quality."
            }

        # 4. Подготовка данных для предсказания
        new_features_df = pd.DataFrame([new_features_dict])
        
        # Удаление метки 'label', если она есть
        if 'label' in new_features_df.columns:
            new_features_df = new_features_df.drop('label', axis=1)

        # Убедимся, что порядок колонок совпадает с порядком обучения
        feature_names_trained = model.feature_names_in_
        new_features_df = new_features_df[feature_names_trained]

        current_feature_values = new_features_df.iloc[0].to_dict()
        
        # 5. Предсказание
        prediction_proba = model.predict_proba(new_features_df)[0]
        prediction_label = model.predict(new_features_df)[0]

        # 6. Анализ важности признаков
        importance = model.feature_importances_
        feature_names = np.array(feature_names_trained)

        # Создание DataFrame для важности признаков
        feature_importance_df = pd.DataFrame({
            'Feature': feature_names,
            'Importance': importance
        }).sort_values(by='Importance', ascending=False)
        
        # Топ-5 признаков
        top_5 = feature_importance_df.head(5)
        
        # 7. Формирование симптомов
        symptoms = []
        for index, row in top_5.iterrows():
            feature_name = row['Feature']
            importance = row['Importance']
            value = current_feature_values.get(feature_name, 0)
            interpretation = get_human_interpretation(feature_name, value)
            
            symptoms.append({
                "name": feature_name,
                "value": float(value),
                "description": interpretation,
                "importance": float(importance)
            })

        # 8. Определение уровня риска
        sick_probability = prediction_proba[1]
        if sick_probability > 0.8:
            risk_level = "high"
        elif sick_probability > 0.6:
            risk_level = "medium"
        else:
            risk_level = "low"

        # 9. Формирование рекомендаций
        recommendations = []
        if risk_level == "high":
            recommendations.extend([
                "Немедленная консультация врача",
                "Избегать самолечения",
                "Мониторинг состояния"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Консультация специалиста в течение недели",
                "Наблюдение за изменениями",
                "Ведение здорового образа жизни"
            ])
        else:
            recommendations.extend([
                "Регулярные профилактические осмотры",
                "Поддержание здорового образа жизни",
                "Солнцезащитные средства"
            ])

        # 10. Формирование результата
        result = {
            "success": True,
            "diagnosis": "БОЛЕН" if prediction_label == 1 else "ЗДОРОВ",
            "confidence": float(max(prediction_proba)),
            "description": f"Анализ показывает {'высокую' if sick_probability > 0.7 else 'среднюю' if sick_probability > 0.4 else 'низкую'} вероятность наличия проблем со здоровьем.",
            "symptoms": symptoms,
            "recommendations": recommendations,
            "feature_importance": {
                feature: float(importance) 
                for feature, importance in zip(top_5['Feature'], top_5['Importance'])
            },
            "risk_level": risk_level,
            "probabilities": {
                "healthy": float(prediction_proba[0]),
                "sick": float(prediction_proba[1])
            }
        }

        return result

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Analysis failed due to unexpected error."
        }

def main():
    """
    Главная функция для запуска из командной строки.
    """
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Invalid arguments",
            "message": "Usage: python analyze_api.py <image_path>"
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    result = analyze_image_for_api(image_path)
    
    # Выводим результат в формате JSON
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
