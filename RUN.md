# Инструкция по запуску Librarium

## Быстрый старт

### 1. Установка зависимостей

```bash
cd library-reports
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

---

## Запуск через Docker

### Запуск всех сервисов:

```bash
docker-compose up -d
```

### Остановка сервисов:

```bash
docker-compose down
```

### Просмотр логов:

```bash
docker-compose logs -f
```

---

## Сборка для продакшена

### Сборка фронтенда:

```bash
npm run build
```

Собранные файлы будут в директории `dist/`

### Просмотр собранного приложения:

```bash
npm run preview
```

---

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# API Gateway
VITE_API_URL=http://localhost:8080

# Google OAuth (если используется)
VITE_GOOGLE_CLIENT_ID=your_client_id
```

---

## Структура проекта

```
library-reports/
├── src/
│   ├── components/     # React компоненты
│   ├── pages/          # Страницы приложения
│   ├── hooks/          # Пользовательские хуки
│   ├── services/       # API сервисы
│   ├── utils/          # Утилиты
│   └── styles/         # Стили
├── public/             # Статические файлы
├── docker-compose.yml  # Docker конфигурация
├── package.json        # Зависимости
└── vite.config.js      # Конфигурация Vite
```

---

## Доступные скрипты

- `npm run dev` - запуск dev-сервера
- `npm run build` - сборка для продакшена
- `npm run preview` - просмотр собранного приложения
- `npm run lint` - проверка кода линтером

---

## Технические требования

- Node.js 18+
- npm 9+ или yarn 1.22+
- Современный браузер (Chrome, Firefox, Safari, Edge)

---

## Устранение неполадок

### Проблема: Не устанавливаются зависимости

```bash
# Очистка кэша
npm cache clean --force

# Удаление node_modules
rm -rf node_modules package-lock.json

# Повторная установка
npm install
```

### Проблема: Не запускается dev-сервер

```bash
# Проверка занятости порта
netstat -ano | findstr :5173

# Запуск на другом порту
npm run dev -- --port 3000
```

### Проблема: Ошибки сборки

```bash
# Проверка версии Node.js
node --version

# Обновление зависимостей
npm update
```

---

## Поддержка

При возникновении проблем обращайтесь:
- Email: info@librarium.ru
- Telegram: @librarium_support
