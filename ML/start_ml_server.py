#!/usr/bin/env python3
"""
Сервер для ML анализа изображений.
Принимает HTTP запросы с изображениями и возвращает результаты анализа.
"""

from flask import Flask, request, jsonify
import os
import tempfile
from analyze_api import analyze_image_for_api

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """
    API endpoint для анализа изображения.
    Принимает изображение в multipart/form-data и возвращает JSON результат.
    """
    try:
        # Проверяем, что файл был отправлен
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file provided",
                "message": "Please provide an image file"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No image file selected",
                "message": "Please select an image file"
            }), 400
        
        # Сохраняем временный файл
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        try:
            # Анализируем изображение
            result = analyze_image_for_api(temp_path)
            return jsonify(result)
        
        finally:
            # Удаляем временный файл
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Analysis failed due to server error"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Проверка состояния сервера.
    """
    return jsonify({
        "status": "healthy",
        "message": "ML Analysis Server is running"
    })

if __name__ == '__main__':
    print("Starting ML Analysis Server...")
    print("Server will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("Analysis endpoint: http://localhost:5000/analyze")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
