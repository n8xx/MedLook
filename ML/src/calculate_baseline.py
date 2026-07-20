import pandas as pd
import numpy as np
import json

def calculate_baselines(features_file, output_file='baselines.json'):
    """
    Считывает CSV-файл признаков, фильтрует здоровых людей (label=0),
    вычисляет среднее и стандартное отклонение для каждого признака
    и сохраняет их в виде JSON для использования в analyze.py.
    """
    try:
        df = pd.read_csv(features_file)
    except FileNotFoundError:
        print(f"Ошибка: Файл признаков не найден по пути {features_file}. Убедитесь, что он существует.")
        return

    # 1. Фильтрация только здоровых людей (label = 0)
    df_healthy = df[df['sick'] == 0].drop(columns=['sick'])

    if df_healthy.empty:
        print("Ошибка: В датасете нет здоровых образцов (label=0). Невозможно рассчитать базовые значения.")
        return

    # 2. Вычисление средних значений (mean) и стандартных отклонений (std)
    baselines_data = {}

    for column in df_healthy.columns:
        mean_val = df_healthy[column].mean()
        std_val = df_healthy[column].std()
        
        # Сохраняем в словаре
        baselines_data[column] = {
            'mean': mean_val,
            'std': std_val
        }

    # 3. Форматирование для Python (JSON)
    # Преобразование numpy-типов в стандартные типы Python для корректной записи в JSON
    
    # 3.1. Сохранение в JSON-файл для удобства
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(baselines_data, f, indent=4)
        
    print(f"✅ Базовые значения сохранены в {output_file}.")

    # 3.2. Генерация готового Python-кода для analyze.py (для копирования)
    python_code = "BASELINES = {\n"
    for feature, data in baselines_data.items():
        # Форматирование с округлением для чистоты кода
        mean_str = f"{data['mean']:.4f}"
        std_str = f"{data['std']:.4f}"
        python_code += f"    '{feature}': {{'mean': {mean_str}, 'std': {std_str}}},\n"
    python_code += "}\n"
    
    print("\n--- ГОТОВЫЙ КОД ДЛЯ КОПИРОВАНИЯ В analyze.py (вместо BASELINES) ---")
    print(python_code)
    print("----------------------------------------------------------------------")


if __name__ == '__main__':
    # Укажите путь к вашему файлу признаков
    FEATURES_FILE_PATH = 'C:/faces/features/medical_features_dataset_n.csv' 
    calculate_baselines(FEATURES_FILE_PATH)