import cv2
import mediapipe as mp
import numpy as np
import os
import pandas as pd
from collections import defaultdict

# Инициализация MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

# --- ОПРЕДЕЛЕНИЕ ЗОН ЛИЦА (Используя индексы MediaPipe Face Mesh) ---
# Эти индексы определяют зоны, где часто проявляются симптомы (бледность, желтуха, синюшность).
# Вы можете адаптировать эти индексы, используя карту лица MediaPipe.

# 1. КОЖА / ЩЕКИ (Cheeks & forehead area, main skin color)
# Индексы для правой и левой стороны лица, включая области щек и лба.
# Взят усредненный набор точек для общей оценки тона кожи
SKIN_LANDMARKS = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 176, 150, 149, 175, 171, 140, 169, 170, 143, 137, 215, 209, 210, 214, 207, 206, 203, 168, 167, 164, 156, 155, 148, 145, 139, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152]

# 2. ГУБЫ (Lips color and moisture)
LIPS_LANDMARKS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 176, 191, 80, 84, 13, 312, 311, 310, 309, 415, 314, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338]

# 3. ГЛАЗА (Sclera or under-eye area for jaundice/dark circles)
# Используем внешний контур области под глазами
EYE_AREA_LANDMARKS = [33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 398, 384, 385, 382, 381, 380, 374, 373, 390, 249, 466, 388, 387, 386, 398, 463]

REGIONS = {
    "skin": SKIN_LANDMARKS,
    "lips": LIPS_LANDMARKS,
    "eye_area": EYE_AREA_LANDMARKS
}

def extract_color_features(image, mask):
    """
    Извлекает среднее значение и стандартное отклонение цвета (RGB и HSV)
    для области, заданной маской.
    """
    # 1. RGB анализ
    pixels_rgb = image[mask > 0]
    
    # 2. HSV анализ (Hue, Saturation, Value - полезно для оттенка и насыщенности)
    image_hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    pixels_hsv = image_hsv[mask > 0]
    
    if pixels_rgb.size == 0:
        return np.zeros(12)  # 12 признаков (6x mean, 6x std)
    
    # Признаки: Среднее и Стандартное Отклонение
    mean_rgb = pixels_rgb.mean(axis=0)
    std_rgb = pixels_rgb.std(axis=0)
    mean_hsv = pixels_hsv.mean(axis=0)
    std_hsv = pixels_hsv.std(axis=0)
    
    # Объединяем 4 вектора в 12 признаков
    features = np.concatenate([mean_rgb, std_rgb, mean_hsv, std_hsv])
    return features


def process_image(image_path):
    """
    Обрабатывает одно изображение, извлекает признаки и возвращает их.
    """
    # Чтение изображения
    image = cv2.imread(image_path)
    if image is None:
        return None
    
    # MediaPipe работает с RGB, OpenCV читает BGR
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    H, W, _ = image_rgb.shape
    all_features = {}

    with mp_face_mesh.FaceMesh(
        static_image_mode=True, 
        max_num_faces=1, 
        min_detection_confidence=0.5) as face_mesh:
        
        results = face_mesh.process(image_rgb)
        
        if not results.multi_face_landmarks:
            print(f"Нет лица на {os.path.basename(image_path)}")
            return None

        # Получаем 468 ключевых точек
        landmarks = results.multi_face_landmarks[0].landmark
        points = []
        for landmark in landmarks:
            # Преобразование нормализованных координат в пиксели
            x = min(int(landmark.x * W), W - 1)
            y = min(int(landmark.y * H), H - 1)
            points.append((x, y))

        # Извлечение признаков для каждой зоны
        for region_name, landmark_indices in REGIONS.items():
            mask = np.zeros((H, W), dtype=np.uint8)
            
            # Конвертируем индексы в фактические точки (MediaPipe использует Convex Hull)
            region_points = np.array([points[i] for i in landmark_indices], dtype=np.int32)
            
            # Создание полигональной маски
            cv2.fillPoly(mask, [region_points], 255)
            
            # Извлечение признаков
            features = extract_color_features(image_rgb, mask)
            
            # Сохранение признаков с префиксом (например, skin_mean_R)
            feature_names = ['mean_R', 'mean_G', 'mean_B', 'std_R', 'std_G', 'std_B', 
                             'mean_H', 'mean_S', 'mean_V', 'std_H', 'std_S', 'std_V']
                             
            for i, name in enumerate(feature_names):
                all_features[f'{region_name}_{name}'] = features[i]

    return all_features


def create_feature_dataset(sick_folder, healthy_folder, output_csv):
    """
    Обрабатывает все изображения и сохраняет общий DataFrame.
    """
    all_data = []
    
    # Обработка здоровых (метки 0)
    for filename in os.listdir(healthy_folder):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            features = process_image(os.path.join(healthy_folder, filename))
            if features:
                features['label'] = 0
                all_data.append(features)

    # Обработка больных (метки 1)
    for filename in os.listdir(sick_folder):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            features = process_image(os.path.join(sick_folder, filename))
            if features:
                features['label'] = 1
                all_data.append(features)

    # Создание и сохранение DataFrame
    df = pd.DataFrame(all_data)
    df.to_csv(output_csv, index=False)
    print(f"\n✅ Датасет признаков сохранен в {output_csv}. Размер: {df.shape}")
    return df

# --- ЗАПУСК СКРИПТА ---
if __name__ == '__main__':
    # Укажите свои папки с данными
    SICK_DIR = 'data/sick'
    HEALTHY_DIR = 'data/health'
    OUTPUT_FILE = 'features/extracted_features.csv'
    
    # Создаем папку features, если она не существует
    os.makedirs('features', exist_ok=True) 

    create_feature_dataset(SICK_DIR, HEALTHY_DIR, OUTPUT_FILE)