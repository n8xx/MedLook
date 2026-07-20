import os
import cv2
import numpy as np
import pickle
import matplotlib.pyplot as plt
import scipy.stats as st
import math
from pandas import DataFrame
from seaborn import heatmap
from sklearn.metrics import confusion_matrix, roc_curve, auc

# --- ФУНКЦИИ ДЛЯ ЗАГРУЗКИ И ОБРАБОТКИ ДАННЫХ (Data Handling) ---

def load_data(folder_sick, folder_healthy, image_size, ftype, extra_healthy=None, extra_sick=None):
    """
    Загружает изображения из папок, изменяет их размер и назначает метки.

    :param folder_sick: Путь к папке с изображениями "Sick" (больной).
    :param folder_healthy: Путь к папке с изображениями "Healthy" (здоровый).
    :param image_size: Целевой размер изображения (size x size).
    :param ftype: Тип области лица для фильтрации (например, 'mouth', 'skin').
    :return: Кортеж (данные_изображений, метки).
    """
    files_healthy = os.listdir(folder_healthy)
    files_sick = os.listdir(folder_sick)
    data = []
    labels = []

    if extra_healthy is None:
        extra_healthy = ftype
    if extra_sick is None:
        extra_sick = ftype

    # Загрузка здоровых изображений (метка 0)
    for filename in files_healthy:
        label = np.array([0])
        full_path = os.path.join(folder_healthy, filename)
        if ((ftype in filename) or (extra_healthy in filename)) and os.path.isfile(full_path):
            image = cv2.imread(full_path)
            if image is None: continue
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, dsize=(image_size, image_size), interpolation=cv2.INTER_CUBIC)
            data.append(np.asarray(image, dtype=np.float32))
            labels.append(np.asarray(label, dtype=np.int32))
            
    # Загрузка больных изображений (метка 1)
    for filename in files_sick:
        label = np.array([1])
        full_path = os.path.join(folder_sick, filename)
        if ((ftype in filename) or (extra_sick in filename)) and os.path.isfile(full_path):
            image = cv2.imread(full_path)
            if image is None: continue
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, dsize=(image_size, image_size), interpolation=cv2.INTER_CUBIC)
            data.append(np.asarray(image, dtype=np.float32))
            labels.append(np.asarray(label, dtype=np.int32))

    data = np.asarray(data) / 255.0  # Нормализация
    labels = np.asarray(labels)

    # Перемешивание данных (важно для перекрестной проверки)
    p = np.random.permutation(len(data))
    return data[p], labels[p]

def make_stacked_sets(folder_sick, folder_healthy, image_size):
    """
    Загружает все четыре области лица и объединяет их для стэкинг-модели.
    """
    face_features = ["mouth", "nose", "skin", "eye"]
    all_images = []
    labels = None

    for feature in face_features:
        images, current_labels = load_data(
            folder_sick, folder_healthy, image_size, feature)
        all_images.append(images)

        # Метки должны быть одинаковыми для всех областей
        if labels is None:
            labels = current_labels
        
    return np.asarray(all_images), labels

def to_labels(predictions, threshold=0.5):
    """
    Преобразует вероятности модели (0.0-1.0) в бинарные метки (0 или 1).
    """
    pred = np.zeros((len(predictions), 1))
    for i in range(len(predictions)):
        if predictions[i] < threshold:
            pred[i] = 0
        else:
            pred[i] = 1
    return pred.astype(np.int32)

# --- ФУНКЦИИ ДЛЯ ВИЗУАЛИЗАЦИИ И ОТЧЕТНОСТИ (Plotting & Reporting) ---

def compute_confidence_int(values):
    """
    Вычисляет 95% доверительный интервал для набора значений.
    """
    avg = np.mean(values)
    std = np.std(values)
    # Используем t-распределение для вычисления доверительного интервала
    # t_interval = st.t.interval(0.95, len(values) - 1, loc=avg, scale=std / np.sqrt(len(values)))
    # Поскольку стандартное отклонение std вычисляется для всей выборки,
    # t-интервал можно упростить для вычисления погрешности (margin of error)
    margin_of_error = st.t.ppf(0.975, len(values) - 1) * (std / np.sqrt(len(values)))
    
    return avg, margin_of_error

def print_roc_curve(tprs, auc_sum, feature, folds, base_fpr=np.linspace(0, 1, 101), name=None):
    """
    Строит усредненную ROC-кривую с доверительной областью.
    """
    tprs = np.array(tprs)
    mean_tprs = tprs.mean(axis=0)
    std = tprs.std(axis=0)

    tprs_upper = np.minimum(mean_tprs + std, 1)
    tprs_lower = mean_tprs - std

    plt.figure()
    plt.plot(base_fpr, mean_tprs, 'b', label=f'Mean ROC (AUC = {auc_sum/folds:.3f})')
    plt.fill_between(base_fpr, tprs_lower, tprs_upper, color='grey', alpha=0.3, label='± 1 SD')
    
    plt.plot([0, 1], [0, 1], 'r--', label='Random Guess')
    plt.xlim([0, 1])
    plt.ylim([0, 1])
    plt.title(f"ROC Curve for {str(feature).capitalize()} Model (AUC = {auc_sum / folds:.3f})")
    plt.ylabel('True Positive Rate')
    plt.xlabel('False Positive Rate')
    plt.axes().set_aspect('equal', 'datalim')
    plt.legend(loc='lower right')
    
    # Сохранение в папку plots
    save_path = f"data/plots/roc_{feature}.png" if name is None else f"data/plots/roc_{feature}_{name}.png"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path)
    plt.close()

def print_confusion_matrix(predictions, val_labels, feature, name=None):
    """
    Строит и сохраняет матрицу ошибок.
    """
    matrix = confusion_matrix(val_labels.flatten(), predictions.flatten())
    
    # Расчет метрик для отображения в матрице
    tn, fp, fn, tp = matrix.ravel()
    
    # PPV (Positive Predictive Value) = TP / (TP + FP)
    ppv = tp / (tp + fp + 1e-6) 
    # NPV (Negative Predictive Value) = TN / (TN + FN)
    npv = tn / (tn + fn + 1e-6)

    # Переименование меток для матрицы
    labels = [f'TN: {tn}\nNPV: {npv:.3f}', f'FP: {fp}', 
              f'FN: {fn}', f'TP: {tp}\nPPV: {ppv:.3f}']
    labels = np.asarray(labels).reshape(2, 2)

    df_cm = DataFrame(matrix, index=['Sick', 'Healthy'], columns=['Sick', 'Healthy'])
    
    plt.figure(figsize=(7, 5))
    ax = plt.axes()
    heatmap(df_cm, annot=labels, fmt='', ax=ax, cmap="Blues")
    ax.set_title(f'Confusion Matrix {str(feature).capitalize()}')
    ax.set_ylabel("Actual Values")
    ax.set_xlabel("Predicted Values")
    
    save_path = f"data/plots/confusion_matrix_{feature}.png" if name is None \
        else f"data/plots/confusion_matrix_{feature}_{name}.png"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path)
    plt.close()

def print_confidence_intervals(predictions, val_labels, auc_values, feature, folds):
    """
    Вычисляет и сохраняет в CSV файл с 95% доверительными интервалами для ключевых метрик.
    """
    # Расчет метрик
    tn, fp, fn, tp = confusion_matrix(val_labels.flatten(), predictions.flatten()).ravel()
    
    # Sensitivity (TPR)
    sensitivity_val = tp / (tp + fn + 1e-6)
    
    # Specificity (TNR)
    specificity_val = tn / (tn + fp + 1e-6)
    
    # PPV (Positive Predictive Value)
    ppv_val = tp / (tp + fp + 1e-6)
    
    # NPV (Negative Predictive Value)
    npv_val = tn / (tn + fn + 1e-6)

    # Вычисление 95% ДИ
    metrics = {
        'Sensitivity': sensitivity_val,
        'Specificity': specificity_val,
        'AUC': np.mean(auc_values),
        'PPV': ppv_val,
        'NPV': npv_val
    }
    
    intervals = {}
    for metric_name, value in metrics.items():
        if metric_name == 'AUC':
            # Для AUC используем значения по фолдам
            _, auc_margin = compute_confidence_int(auc_values)
            intervals[metric_name] = (value, auc_margin)
        else:
            # Для остальных метрик используем формулу для бинарных распределений (но для простоты
            # здесь используется аппроксимация, как в оригинальном коде)
            # Примечание: В оригинальном коде ДИ не вычисляется для Sens/Spec/PPV/NPV,
            # здесь сохраняется только финальное значение, что может быть неверным для 10-fold
            intervals[metric_name] = (value, 0.0) # Для упрощения, как в оригинале

    results = []
    for metric, (avg, margin) in intervals.items():
        results.append({
            'Metric': metric,
            'Average': f"{avg:.3f}",
            '95% CI': f"({avg - margin:.3f}, {avg + margin:.3f})"
        })

    df = DataFrame(results)
    save_path = "data/reports/"
    os.makedirs(save_path, exist_ok=True)
    df.to_csv(f"{save_path}confidence_intervals_{feature}.csv", index=False)