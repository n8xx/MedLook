# Установка и настройка MedLook

## 📋 Требования

### Обязательные компоненты

1. **Java 17+**
   - Скачайте с [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) или [OpenJDK](https://openjdk.org/)
   - Проверьте установку: `java -version`

2. **Maven 3.6+**
   - Скачайте с [Apache Maven](https://maven.apache.org/download.cgi)
   - Добавьте в PATH переменную окружения
   - Проверьте установку: `mvn -version`

3. **Node.js 16+ и npm**
   - Скачайте с [Node.js](https://nodejs.org/)
   - npm устанавливается автоматически
   - Проверьте установку: `node --version` и `npm --version`

## 🚀 Установка

### 1. Клонирование проекта
```bash
git clone <repository-url>
cd MedLook
```

### 2. Настройка бэкенда
```bash
cd backend
mvn clean install
```

### 3. Настройка фронтенда
```bash
cd frontend
npm install
```

## 🏃‍♂️ Запуск

### Автоматический запуск
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### Ручной запуск

#### Бэкенд
```bash
cd backend
mvn spring-boot:run
```

#### Фронтенд
```bash
cd frontend
npm run dev
```

## 🔧 Настройка портов

- **Бэкенд**: http://localhost:8080
- **Фронтенд**: http://localhost:3000

Если порты заняты, измените настройки:

### Бэкенд (application.properties)
```properties
server.port=8080
```

### Фронтенд (vite.config.js)
```javascript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

## 🐛 Решение проблем

### Ошибка "mvn не является внутренней или внешней командой"
- Установите Maven и добавьте в PATH
- Перезапустите командную строку

### Ошибка "npm не является внутренней или внешней командой"
- Установите Node.js
- Перезапустите командную строку

### Ошибка CORS
- Убедитесь, что бэкенд запущен на порту 8080
- Проверьте настройки CORS в WebConfig.java

### Ошибка загрузки файлов
- Убедитесь, что папка `backend/uploads` существует
- Проверьте права доступа к папке

## 📁 Структура после установки

```
MedLook/
├── backend/
│   ├── target/              # Скомпилированные файлы
│   ├── uploads/            # Загруженные файлы
│   └── src/main/java/      # Исходный код
├── frontend/
│   ├── node_modules/       # Зависимости npm
│   ├── dist/              # Собранный фронтенд
│   └── src/               # Исходный код
└── start.bat              # Скрипт запуска
```

## ✅ Проверка установки

1. **Java**: `java -version` должен показать версию 17+
2. **Maven**: `mvn -version` должен показать версию 3.6+
3. **Node.js**: `node --version` должен показать версию 16+
4. **npm**: `npm --version` должен показать версию 8+

## 🆘 Поддержка

При возникновении проблем:
1. Убедитесь, что все компоненты установлены
2. Проверьте переменные окружения PATH
3. Перезапустите командную строку/терминал
4. Очистите кэш: `mvn clean` и `npm cache clean --force`
