import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import numpy as np
import pickle
import os

def train_and_evaluate_model(features_file, model_save_path='models/random_forest_model.pkl'):
    """
    Загружает признаки, обучает модель Random Forest и оценивает ее.
    """
    try:
        df = pd.read_csv(features_file)
    except FileNotFoundError:
        print(f"Ошибка: Файл признаков не найден по пути {features_file}. Запустите feature_extractor.py.")
        return

    # Разделение на признаки (X) и метки (y)
    X = df.drop('label', axis=1)
    y = df['label']
    feature_names = X.columns.tolist()

    # K-Fold Cross-Validation (более надежная оценка)
    N_SPLITS = 5
    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=42)
    
    auc_scores = []
    
    print(f"Начинается {N_SPLITS}-кратная стратифицированная перекрестная проверка...")

    for fold, (train_index, test_index) in enumerate(skf.split(X, y)):
        X_train, X_test = X.iloc[train_index], X.iloc[test_index]
        y_train, y_test = y.iloc[train_index], y.iloc[test_index]

        # Инициализация и обучение Random Forest
        model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        model.fit(X_train, y_train)

        # Предсказание вероятностей (для AUC)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Оценка
        auc_score = roc_auc_score(y_test, y_pred_proba)
        auc_scores.append(auc_score)
        
        print(f"Fold {fold+1}: AUC = {auc_score:.4f}")

    print("-" * 30)
    print(f"Средний AUC по {N_SPLITS} фолдам: {np.mean(auc_scores):.4f} ± {np.std(auc_scores):.4f}")

    # Обучение финальной модели на всем наборе данных
    final_model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    final_model.fit(X, y)
    
    # Сохранение финальной модели
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    with open(model_save_path, 'wb') as f:
        pickle.dump(final_model, f)
        
    print(f"Финальная модель Random Forest сохранена в {model_save_path}")
    return final_model, feature_names

if __name__ == '__main__':
    # Укажите путь к созданному CSV-файлу
    FEATURES_FILE = 'features/extracted_features.csv'
    train_and_evaluate_model(FEATURES_FILE)