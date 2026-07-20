import cv2
import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt
import os
from features_extractor import process_image 
from human_interp import get_human_interpretation 
from human_interp import BASELINES 

def analyze_new_image(image_path, model_path='models/random_forest_model.pkl'):
    """
    Обрабатывает новое изображение, делает предсказание и выводит важность признаков.
    """
    # 1. Загрузка модели
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
    except FileNotFoundError:
        print(f"Ошибка: Модель не найдена по пути {model_path}. Запустите train_ml.py.")
        return

    # 2. Извлечение признаков для нового изображения
    new_features_dict = process_image(image_path)
    
    if new_features_dict is None:
        print("Не удалось извлечь признаки с изображения.")
        return

    # Преобразование в DataFrame для предсказания
    new_features_df = pd.DataFrame([new_features_dict])
    
    # Удаление метки 'label', если она есть (в этом случае ее не должно быть)
    if 'label' in new_features_df.columns:
        new_features_df = new_features_df.drop('label', axis=1)

    # Убедимся, что порядок колонок совпадает с порядком обучения
    feature_names_trained = model.feature_names_in_
    new_features_df = new_features_df[feature_names_trained]

    current_feature_values = new_features_df.iloc[0].to_dict()
    
    # 3. Предсказание
    prediction_proba = model.predict_proba(new_features_df)[0]
    prediction_label = model.predict(new_features_df)[0]

    print("-" * 50)
    print(f"Финальный Прогноз:")
    print(f"  Вероятность 'Болен' (1): {prediction_proba[1]:.4f}")
    print(f"  Вероятность 'Здоров' (0): {prediction_proba[0]:.4f}")
    print(f"  РЕЗУЛЬТАТ: {'БОЛЕН' if prediction_label == 1 else 'ЗДОРОВ'}")
    print("-" * 50)

    # 4. Анализ Важности Признаков (Объяснение)
    importance = model.feature_importances_
    feature_names = np.array(feature_names_trained)

    # Создание DataFrame для удобства
    feature_importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importance
    }).sort_values(by='Importance', ascending=False)
    
    # Фильтрация и вывод 10 самых важных признаков
    top_5 = feature_importance_df.head(5)
    
    print("Топ-5 Признаков и их Интерпретация:")
    for index, row in top_5.iterrows():
        feature_name = row['Feature']
        importance = row['Importance']
        
        # 1. Получаем фактическое значение признака для этого лица
        value = current_feature_values.get(feature_name)
        
        # 2. Получаем человекочитаемую интерпретацию из отдельного модуля
        interpretation = get_human_interpretation(feature_name, value)
        
        # 3. Вывод результата: Важность | Значение | Интерпретация
        print(f"  [{importance:.4f}] ({value:.3f}) - {interpretation}")

    # 5. Визуализация (Box Plot)
    plt.figure(figsize=(10, 6))
    plt.barh(top_5['Feature'][::-1], top_5['Importance'][::-1], color='skyblue')
    plt.xlabel("Важность Признака (Feature Importance)")
    plt.title("Вклад Признаков в Диагноз")
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    # Укажите путь к новому изображению для анализа
    NEW_IMAGE_PATH = 'C:/faces/data/validation/s15s-m_face.png'
    
    if os.path.exists(NEW_IMAGE_PATH):
        analyze_new_image(NEW_IMAGE_PATH)
    else:
        print(f"Пожалуйста, создайте тестовое изображение по пути: {NEW_IMAGE_PATH}")