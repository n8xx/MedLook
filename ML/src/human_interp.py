# BASELINES: Среднее (mean) и Стандартное отклонение (std) для признаков здоровых людей.
# Эти значения рассчитаны скриптом calculate_baselines.py.
BASELINES = {
    'lip_rgb_variance_r': {'mean': 456.1723, 'std': 108.3599},
    'lip_rgb_variance_g': {'mean': 418.0117, 'std': 123.9674},
    'lip_rgb_variance_b': {'mean': 248.1197, 'std': 89.4865},
    'lip_hsv_variance_h': {'mean': 676.5383, 'std': 1319.7384},
    'lip_hsv_variance_s': {'mean': 132.7724, 'std': 70.8945},
    'lip_hsv_variance_v': {'mean': 456.1723, 'std': 108.3599},
    'lip_std_rgb': {'mean': 36.0125, 'std': 2.5426},
    'lip_std_hue': {'mean': 18.4857, 'std': 18.6604},
    'lip_mean_red': {'mean': 150.8629, 'std': 10.8056},
    'lip_mean_hue': {'mean': 10.3383, 'std': 10.1515},
    'lip_mean_saturation': {'mean': 119.3803, 'std': 6.2189},
    'lip_cv_red': {'mean': 0.1414, 'std': 0.0202},
    'eye_variance_hue': {'mean': 140.0704, 'std': 214.0195},
    'eye_variance_saturation': {'mean': 660.8429, 'std': 222.5639},
    'eye_variance_value': {'mean': 632.6555, 'std': 159.0660},
    'eye_dark_circle_indicator': {'mean': 128.1492, 'std': 11.8548},
    'eye_color_uniformity': {'mean': 0.0868, 'std': 0.0926},
    'skin_lab_variance_l': {'mean': 111.7397, 'std': 47.3470},
    'skin_lab_variance_a': {'mean': 4.8759, 'std': 2.4807},
    'skin_lab_variance_b': {'mean': 3.6805, 'std': 1.7493},
    'skin_pallor_indicator': {'mean': 144.7396, 'std': 15.2851},
    'skin_redness_indicator': {'mean': 143.3096, 'std': 2.2570},
    'skin_yellowness_indicator': {'mean': 149.2365, 'std': 2.4801},
}

# Коэффициент отклонения: 1.5 * STD часто используется для определения значительного отклонения.
# Это определяет, насколько далеко значение должно быть от нормы, чтобы получить интерпретацию.
DEVIATION_THRESHOLD = 1.5 

def get_human_interpretation(feature_name: str, feature_value: float) -> str:
    """
    Интерпретирует числовое значение признака, сравнивая его с базовыми
    значениями здоровых людей.

    :param feature_name: Название признака (например, 'lip_mean_saturation').
    :param feature_value: Фактическое значение признака для анализируемого лица.
    :return: Человекочитаемая строка-интерпретация.
    """
    baseline = BASELINES.get(feature_name)
    
    # Если признак не имеет базового значения, возвращаем чистое имя
    if not baseline:
        return feature_name.replace('_', ' ').title()

    mean = baseline['mean']
    std = baseline['std']
    
    # Расчет порогов
    low_threshold = mean - DEVIATION_THRESHOLD * std
    high_threshold = mean + DEVIATION_THRESHOLD * std
    
    # --- ЛОГИКА ИНТЕРПРЕТАЦИИ ---

    # 1. ПРИЗНАКИ БЛЕДНОСТИ/НАСЫЩЕННОСТИ (Низкие значения S, R, высокие значения Pallor Indicator)
    if 'saturation' in feature_name.lower() or 'mean_red' in feature_name.lower() or 'pallor_indicator' in feature_name.lower():
        if feature_name in ['lip_mean_saturation', 'lip_mean_red']:
            # Низкая насыщенность/красный цвет -> Бледность/Синюшность
            if feature_value < low_threshold:
                return f"Бледность/Синюшность губ (Низкая насыщенность/Красный)"
            if feature_value > high_threshold:
                return f"Покраснение/Воспаление губ (Высокая насыщенность/Красный)"
        
        if 'pallor_indicator' in feature_name.lower():
            # Высокий Pallor Indicator -> Бледность
            if feature_value > high_threshold:
                return f"Выраженная бледность/Отсутствие румянца (Высокий Pallor Index)"

    # 2. ПРИЗНАКИ ЖЕЛТУХИ (Высокие значения H, Yellowness Indicator)
    if 'hue' in feature_name.lower() or 'yellowness_indicator' in feature_name.lower():
        # Высокий оттенок H или Yellowness -> Желтуха
        if feature_value > high_threshold:
            return f"Желтушность/Желтоватый оттенок (Высокий Yellowness Index/Hue)"

    # 3. ПРИЗНАКИ ПОКРАСНЕНИЯ/ВОСПАЛЕНИЯ (Высокие значения Redness Indicator)
    if 'redness_indicator' in feature_name.lower():
        if feature_value > high_threshold:
            return f"Высокое покраснение/Воспаление кожи (Высокий Redness Index)"
            
    # 4. ПРИЗНАКИ НЕРАВНОМЕРНОСТИ/СИЛЬНЫЕ ТЕМНЫЕ КРУГИ (Высокие STD/Variance)
    if 'variance' in feature_name.lower() or 'std' in feature_name.lower():
        if 'eye_dark_circle_indicator' in feature_name.lower():
             if feature_value > high_threshold:
                return f"Выраженные темные круги под глазами"
        
        # Высокая дисперсия (variance) = неоднородность
        if feature_value > high_threshold:
            return f"Неоднородность цвета/Текстуры в области {feature_name.split('_')[0].upper()}"
            
    # 5. Если значение отклоняется от нормы, но не попадает в специфическую категорию
    if feature_value < low_threshold or feature_value > high_threshold:
        return f"Значительное отклонение признака {feature_name.split('_')[-1]} (Нарушение нормы)"

    # Если признак не отклоняется критически
    return feature_name.replace('_', ' ').title() 