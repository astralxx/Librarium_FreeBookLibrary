# 📚 Librarium - Книжная онлайн библиотека

Современное веб-приложение для чтения книг с микросервисной архитектурой.
(пока не рабатает 🥺, я меняю mysql на postgresql)

## 🏗️ Архитектура

Проект состоит из следующих компонентов:

- **Frontend** - React приложение (Vite)
- **API Gateway** - Go сервис для маршрутизации запросов
- **Auth Service** - Go сервис для аутентификации (JWT, Google OAuth)
- **Books Service** - Go сервис для работы с каталогом книг
- **PostgreSQL** - Базы данных для auth и books сервисов

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)
- Go 1.21+ (для локальной разработки)

### Запуск через Docker Compose

1. Клонировать репозиторий:
```bash
git clone <repository-url>
cd library-reports
```

2. Создать `.env` файлы на основе примеров:
```bash
cp auth-service/.env.example auth-service/.env
cp books-service/.env.example books-service/.env
cp gateway/.env.example gateway/.env
```

3. (Опционально) Настроить Google OAuth:
   - Перейти в [Google Cloud Console](https://console.cloud.google.com/)
   - Создать OAuth 2.0 credentials
   - Обновить `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в `auth-service/.env`

4. Запустить все сервисы:
```bash
docker-compose up -d
```

5. Дождаться запуска всех сервисов (30 секунд)

6. Открыть приложение:
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:8080

### Локальная разработка

#### Frontend

```bash
npm install
npm run dev
```

#### Auth Service

```bash
cd auth-service
go mod download
go run main.go
```

#### Books Service

```bash
cd books-service
go mod download
go run main.go
```

#### Gateway

```bash
cd gateway
go mod download
go run main.go
```

## 📁 Структура проекта

```
library-reports/
├── auth-service/          # Сервис аутентификации
│   ├── main.go
│   ├── go.mod
│   ├── .env.example
│   └── Dockerfile
├── books-service/         # Сервис книг
│   ├── main.go
│   ├── go.mod
│   ├── .env.example
│   └── Dockerfile
├── gateway/               # API Gateway
│   ├── main.go
│   ├── go.mod
│   ├── .env.example
│   └── Dockerfile
├── src/                   # React frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── styles/
├── public/                # Статические файлы
├── docker-compose.yml     # Docker Compose конфигурация
├── Dockerfile.frontend    # Dockerfile для frontend
├── nginx.conf             # Nginx конфигурация
└── README.md
```

## 🔧 Конфигурация

### Переменные окружения

#### Auth Service
| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DB_USER` | Пользователь MySQL | `root` |
| `DB_PASS` | Пароль MySQL | `ur_password` |
| `DB_HOST` | Хост MySQL | `127.0.0.1:3306` |
| `DB_NAME` | Имя БД | `librariumdb` |
| `JWT_SECRET` | Секретный ключ JWT | (обязательно) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | (опционально) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | (опционально) |
| `SERVER_PORT` | Порт сервера | `3000` |
| `FRONTEND_URL` | URL фронтенда | `http://localhost:5173` |

#### Books Service
| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DB_USER` | Пользователь PostgreSQL | `root` |
| `DB_PASS` | Пароль PostgreSQL | `ur_password` |
| `DB_HOST` | Хост PostgreSQL | `127.0.0.1:3307` |
| `DB_NAME` | Имя БД | `books-db` |
| `SERVER_PORT` | Порт сервера | `3001` |

#### Gateway
| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `AUTH_SERVICE_URL` | URL Auth Service | `http://localhost:3000` |
| `BOOKS_SERVICE_URL` | URL Books Service | `http://localhost:3001` |
| `SERVER_PORT` | Порт сервера | `8080` |
| `JWT_SECRET` | Секретный ключ JWT | (обязательно) |
| `CORS_ALLOWED_ORIGINS` | Разрешенные origins | `http://localhost:5173` |

## 🔐 Безопасность

### JWT Аутентификация
- Токены хранятся в HttpOnly cookies
- Поддержка Google OAuth 2.0
- Валидация JWT на уровне Gateway

### CORS
- Настроен для локальной разработки
- Поддержка credentials

### Cookies
- `HttpOnly: true` - защита от XSS
- `Secure: true` в production (HTTPS)
- `SameSite: Lax` - защита от CSRF

## 📡 API Endpoints

### Auth Service (через Gateway)
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/logout` - Выход
- `GET /auth/profile` - Профиль пользователя
- `GET /auth/google/login` - Google OAuth
- `GET /auth/callback` - Google OAuth callback

### Books Service (через Gateway)
- `GET /books/featured` - Рекомендуемые книги
- `GET /books/category?category=popular` - Популярные книги
- `GET /books/category?category=new` - Новинки
- `GET /books/category?category=fantasy` - Фантастика
- `GET /books/category?category=selfdev` - Саморазвитие
- `GET /books/category?category=comics` - Комиксы
- `GET /books/category?category=audiobook` - Аудиокниги
- `GET /api/books` - Все книги
- `GET /api/books/{id}` - Книга по ID
- `GET /api/books/search?q=term` - Поиск книг

## 🐛 Отладка

### Проверка работы сервисов

```bash
# Проверить статус контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs -f auth-service
docker-compose logs -f books-service
docker-compose logs -f gateway
docker-compose logs -f frontend

# Проверить здоровье MySQL
docker-compose exec mysql-auth mysqladmin ping -h localhost -u root -proot
docker-compose exec mysql-books mysqladmin ping -h localhost -u root -proot
```

### Тестирование API

```bash
# Регистрация
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Вход
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Получить книги
curl http://localhost:8080/books/featured
curl http://localhost:8080/books/category?category=popular
```

### Проблемы и решения

1. **Порт уже используется**
   ```bash
   # Найти процесс использующий порт
   netstat -ano | findstr :3000
   # Завершить процесс
   taskkill /PID <PID> /F
   ```

2. **PostgreSQL не запускается**
   ```bash
   # Очистить volumes
   docker-compose down -v
   docker-compose up -d
   ```

3. **Frontend не может подключиться к API**
   - Проверить что gateway запущен: `curl http://localhost:8080`
   - Проверить CORS настройки в `gateway/.env`

## 🛠️ Технологии

### Backend
- Go 1.24
- Gorilla Mux (роутинг)
- JWT (аутентификация)
- PostgreSQL (база данных)
- bcrypt (хеширование паролей)

### Frontend
- React 19
- Vite (сборка)
- React Router v7 (роутинг)
- Axios (HTTP клиент)
- Chart.js (графики)
- React Icons (иконки)

### Инфраструктура
- Docker & Docker Compose
- Nginx (статические файлы)
- PostgreSQL

## 📝 Лицензия

© Copyright. All rights reserved.

## 🤝 Контрибуция

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
