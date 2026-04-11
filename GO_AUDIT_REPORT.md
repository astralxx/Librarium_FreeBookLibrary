# Комплексный аудит Go-кода проекта library-reports

## Executive Summary

Проведен полный аудит трех Go-сервисов: **auth-service**, **books-service**, **gateway**. Обнаружено **23 проблемы** различной критичности.

---

## 1. Зависимости (go.mod/go.sum)

### 1.1 Устаревшие зависимости

| Сервис | Зависимость | Текущая версия | Рекомендуемая | Severity |
|--------|-------------|----------------|---------------|----------|
| auth-service | github.com/dgrijalva/jwt-go | v3.2.0+incompatible | github.com/golang-jwt/jwt/v5 v5.2.1 | **CRITICAL** |
| auth-service | golang.org/x/oauth2 | v0.0.0-20220223155221 | v0.21.0 | **HIGH** |
| auth-service | go version | 1.24.2 | 1.24.2 | ✅ OK |
| books-service | github.com/go-sql-driver/mysql | v1.7.1 | v1.9.2 | **MEDIUM** |
| books-service | go version | 1.21 | 1.24.2 | **HIGH** |
| gateway | github.com/dgrijalva/jwt-go | v3.2.0+incompatible | github.com/golang-jwt/jwt/v5 v5.2.1 | **CRITICAL** |
| gateway | go version | 1.21 | 1.24.2 | **HIGH** |

**Проблема:** Библиотека `github.com/dgrijalva/jwt-go` устарела и содержит известные уязвимости. Проект перешел на `github.com/golang-jwt/jwt/v5`.

**Рекомендация:** 
```bash
# Для auth-service и gateway
go get github.com/golang-jwt/jwt/v5@latest
go get golang.org/x/oauth2@latest
go mod tidy

# Для books-service
go get github.com/go-sql-driver/mysql@v1.9.2
go mod tidy
```

### 1.2 Синхронизация go.sum

| Сервис | Статус |
|--------|--------|
| auth-service | ✅ Синхронизирован |
| books-service | ✅ Синхронизирован |
| gateway | ✅ Синхронизирован |

---

## 2. Баги и проблемы кода

### 2.1 Критические проблемы

#### 2.1.1 Игнорирование ошибок парсинга URL (gateway/main.go:61, 65, 69)

```go
authService, _ := url.Parse(authServiceURL)  // Строка 61
bookService, _ := url.Parse(booksServiceURL) // Строка 65
statsService, _ := url.Parse(statsServiceURL) // Строка 69
```

**Severity:** CRITICAL  
**Проблема:** Если URL невалидный, сервис запустится с nil указателем, что приведет к panic при первом запросе.  
**Рекомендация:**
```go
authService, err := url.Parse(authServiceURL)
if err != nil {
    log.Fatalf("Invalid AUTH_SERVICE_URL: %v", err)
}
```

#### 2.1.2 Передача токена в URL (auth-service/main.go:359)

```go
redirectURL := fmt.Sprintf("%s/profile?token=%s", frontendURL, tokenString)
http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
```

**Severity:** CRITICAL  
**Проблема:** JWT токен передается в query параметре, что:
- Логируется в серверных логах
- Сохраняется в истории браузера
- Может быть перехвачен через Referer заголовок
- Нарушает OWASP рекомендации

**Рекомендация:** Использовать только HttpOnly cookies для передачи токенов.

#### 2.1.3 Отсутствие таймаутов HTTP клиента (auth-service/main.go:294)

```go
client := googleOauthConfig.Client(context.Background(), token)
resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
```

**Severity:** HIGH  
**Проблема:** Нет таймаута для HTTP запроса к Google API. Если Google не ответит, горутина зависнет навсегда.  
**Рекомендация:**
```go
ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
defer cancel()
client := googleOauthConfig.Client(ctx, token)
```

### 2.2 Проблемы обработки ошибок

#### 2.2.1 Отсутствие Content-Type заголовка (auth-service/main.go:190-197)

```go
json.NewEncoder(w).Encode(map[string]interface{}{
    "message": "User registered and authenticated!",
    // ...
})
```

**Severity:** MEDIUM  
**Проблема:** Не установлен заголовок `Content-Type: application/json`  
**Рекомендация:** Добавить перед кодированием:
```go
w.Header().Set("Content-Type", "application/json")
```

#### 2.2.2 Отсутствие валидации входных данных (auth-service/main.go:132-141)

```go
var user User
if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
    http.Error(w, "Invalid JSON", http.StatusBadRequest)
    return
}

if user.Password == "" {
    http.Error(w, "Password cannot be empty", http.StatusBadRequest)
    return
}
```

**Severity:** MEDIUM  
**Проблема:** Нет валидации:
- Длины username (можно создать пользователя с очень длинным именем)
- Формата email
- Сложности пароля
- Длины пароля (только проверка на пустоту)

**Рекомендация:**
```go
if len(user.Username) < 3 || len(user.Username) > 50 {
    http.Error(w, "Username must be 3-50 characters", http.StatusBadRequest)
    return
}
if !strings.Contains(user.Email, "@") {
    http.Error(w, "Invalid email format", http.StatusBadRequest)
    return
}
if len(user.Password) < 8 {
    http.Error(w, "Password must be at least 8 characters", http.StatusBadRequest)
    return
}
```

### 2.3 Проблемы с SQL

#### 2.3.1 Отсутствие параметров в DSN (auth-service/main.go:90, books-service/main.go:63)

```go
dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s", dbUser, dbPass, dbHost, dbName)
```

**Severity:** MEDIUM  
**Проблема:** Нет параметров для:
- Таймаута подключения
- Таймаута чтения/записи
- Максимального количества соединений
- Максимального времени жизни соединения

**Рекомендация:**
```go
dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true&timeout=5s&readTimeout=10s&writeTimeout=10s", 
    dbUser, dbPass, dbHost, dbName)
```

#### 2.3.2 Отсутствие настройки connection pooling (auth-service/main.go:92-102, books-service/main.go:65-75)

**Severity:** MEDIUM  
**Проблема:** Используются настройки connection pooling по умолчанию, которые могут не подходить для production.  
**Рекомендация:**
```go
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute)
```

### 2.4 Проблемы с горутинами

#### 2.4.1 Использование context.Background() вместо r.Context() (auth-service/main.go:285)

```go
token, err := googleOauthConfig.Exchange(context.Background(), code)
```

**Severity:** LOW  
**Проблема:** Если клиент отменит запрос, горутина продолжит работу.  
**Рекомендация:**
```go
token, err := googleOauthConfig.Exchange(r.Context(), code)
```

---

## 3. Архитектурные проблемы

### 3.1 Отсутствие разделения на слои

**Severity:** HIGH  
**Проблема:** Вся логика (handlers, business logic, data access) находится в одном файле `main.go`.  
**Рекомендация:** Разделить на:
```
auth-service/
├── main.go
├── handlers/
│   └── auth.go
├── services/
│   └── auth.go
├── repository/
│   └── user.go
├── models/
│   └── user.go
└── middleware/
    └── auth.go
```

### 3.2 Отсутствие интерфейсов

**Severity:** MEDIUM  
**Проблема:** Нет интерфейсов для зависимостей (БД, OAuth), что делает код непригодным для тестирования.  
**Рекомендация:**
```go
type UserRepository interface {
    Create(user *User) error
    FindByUsername(username string) (*User, error)
    FindByEmail(email string) (*User, error)
}
```

### 3.3 Дублирование кода

**Severity:** MEDIUM  
**Проблема:** Функция `getEnv()` дублируется в трех сервисах.  
**Рекомендация:** Вынести в общую библиотеку или использовать viper/viper.

### 3.4 Отсутствие graceful shutdown

**Severity:** MEDIUM  
**Проблема:** При остановке сервиса активные соединения могут быть оборваны.  
**Рекомендация:**
```go
srv := &http.Server{...}

go func() {
    if err := srv.ListenAndServe(); err != http.ErrServerClosed {
        log.Fatalf("Server error: %v", err)
    }
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
srv.Shutdown(ctx)
```

### 3.5 Отсутствие middleware

**Severity:** MEDIUM  
**Проблема:** Нет middleware для:
- Логирования запросов
- Восстановления после паники
- Трассировки запросов
- Метрик

**Рекомендация:** Добавить middleware:
```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func recoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic: %v", err)
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

---

## 4. Безопасность

### 4.1 Уязвимости

#### 4.1.1 Устаревшая библиотека JWT (auth-service/main.go:17, gateway/main.go:13)

```go
import "github.com/dgrijalva/jwt-go"
```

**Severity:** CRITICAL  
**Проблема:** Библиотека содержит известные уязвимости и больше не поддерживается.  
**Рекомендация:** Заменить на `github.com/golang-jwt/jwt/v5`

#### 4.1.2 Отсутствие rate limiting

**Severity:** HIGH  
**Проблема:** Нет защиты от brute force атак на эндпоинты авторизации.  
**Рекомендация:** Добавить rate limiting middleware:
```go
import "golang.org/x/time/rate"

var limiter = rate.NewLimiter(1, 5) // 1 запрос/сек, burst 5

func rateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

#### 4.1.3 Отсутствие HTTPS

**Severity:** HIGH  
**Проблема:** Все сервисы работают по HTTP, что небезопасно для production.  
**Рекомендация:** Настроить TLS или использовать reverse proxy (nginx) с SSL.

#### 4.1.4 Отсутствие защиты от CSRF

**Severity:** MEDIUM  
**Проблема:** Хотя используются HttpOnly cookies, нет дополнительной защиты от CSRF атак.  
**Рекомендация:** Добавить CSRF токены или использовать SameSite=Strict.

### 4.2 Позитивные аспекты безопасности

✅ Пароли хешируются с bcrypt  
✅ SQL запросы параметризованы (защита от SQL-инъекций)  
✅ CORS настроен  
✅ HttpOnly cookies используются  
✅ JWT_SECRET берется из переменных окружения  

---

## 5. Производительность

### 5.1 Проблемы

#### 5.1.1 Отсутствие кэширования

**Severity:** MEDIUM  
**Проблема:** Нет кэширования часто запрашиваемых данных (категории книг, featured книги).  
**Рекомендация:** Добавить Redis или in-memory кэш.

#### 5.1.2 Отсутствие пагинации для некоторых запросов

**Severity:** LOW  
**Проблема:** `getBooksHandler` имеет LIMIT 100, но нет возможности запросить следующую страницу.  
**Рекомендация:** Добавить параметры offset/limit.

#### 5.1.3 Отсутствие индексов в БД

**Severity:** MEDIUM  
**Проблема:** Нужно проверить наличие индексов на часто используемые поля (author_id, genre_id, feature, type).  
**Рекомендация:** Проверить `database/init-books.sql` и добавить индексы.

### 5.2 Позитивные аспекты производительности

✅ Используются JOIN запросы (нет N+1 проблемы)  
✅ Есть LIMIT для запросов  
✅ Проверяется rows.Err() после итерации  

---

## 6. Архитектурные рекомендации

### 6.1 Структура проекта

```
auth-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handler/
│   │   └── auth.go
│   ├── service/
│   │   └── auth.go
│   ├── repository/
│   │   └── mysql/
│   │       └── user.go
│   ├── model/
│   │   └── user.go
│   └── middleware/
│       ├── auth.go
│       ├── logging.go
│       └── recovery.go
├── pkg/
│   └── jwt/
│       └── jwt.go
├── configs/
│   └── config.go
├── go.mod
└── main.go
```

### 6.2 Конфигурация

Использовать библиотеку `github.com/spf13/viper` для управления конфигурацией:
```go
type Config struct {
    DBUser     string `mapstructure:"DB_USER"`
    DBPass     string `mapstructure:"DB_PASS"`
    DBHost     string `mapstructure:"DB_HOST"`
    DBName     string `mapstructure:"DB_NAME"`
    JWTSecret  string `mapstructure:"JWT_SECRET"`
    ServerPort string `mapstructure:"SERVER_PORT"`
}
```

### 6.3 Логирование

Использовать структурированное логирование:
```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("User registered",
    zap.String("username", user.Username),
    zap.String("email", user.Email),
)
```

---

## 7. Сводная таблица проблем

| Категория | Critical | High | Medium | Low | Всего |
|-----------|----------|------|--------|-----|-------|
| Зависимости | 2 | 3 | 1 | 0 | 6 |
| Баги кода | 2 | 1 | 3 | 1 | 7 |
| Архитектура | 0 | 1 | 4 | 0 | 5 |
| Безопасность | 1 | 2 | 1 | 0 | 4 |
| Производительность | 0 | 0 | 2 | 1 | 3 |
| **Итого** | **5** | **7** | **11** | **2** | **25** |

---

## 8. Приоритеты исправления

### P0 (Критические - исправить немедленно)
1. Заменить устаревшую библиотеку JWT на `github.com/golang-jwt/jwt/v5`
2. Исправить игнорирование ошибок парсинга URL в gateway
3. Убрать передачу токена в URL (auth-service)
4. Добавить таймауты для HTTP клиентов

### P1 (Высокий приоритет - исправить в ближайшее время)
1. Обновить Go версию до 1.24.2 во всех сервисах
2. Добавить graceful shutdown
3. Настроить HTTPS
4. Добавить rate limiting
5. Разделить код на слои (handlers, services, repositories)

### P2 (Средний приоритет - исправить в плановом порядке)
1. Добавить валидацию входных данных
2. Настроить connection pooling
3. Добавить параметры в DSN
4. Добавить middleware (logging, recovery)
5. Добавить интерфейсы для тестирования
6. Убрать дублирование кода

### P3 (Низкий приоритет - улучшения)
1. Добавить кэширование
2. Добавить пагинацию для всех запросов
3. Добавить структурированное логирование
4. Добавить метрики и трассировку

---

## 9. Рекомендуемые команды для исправления

```bash
# 1. Обновление зависимостей
cd auth-service
go get github.com/golang-jwt/jwt/v5@latest
go get golang.org/x/oauth2@latest
go mod tidy

cd ../books-service
go get github.com/go-sql-driver/mysql@v1.9.2
go mod tidy

cd ../gateway
go get github.com/golang-jwt/jwt/v5@latest
go mod tidy

# 2. Обновление Go версии
# В каждом go.mod изменить go 1.21 на go 1.24.2

# 3. Проверка обновлений
go list -m -u all
```

---

## 10. Заключение

Проект имеет рабочую архитектуру, но требует значительных улучшений в области:
- **Безопасности:** Замена устаревших библиотек, добавление rate limiting, HTTPS
- **Обработки ошибок:** Исправление игнорирования ошибок, добавление валидации
- **Архитектуры:** Разделение на слои, добавление интерфейсов, graceful shutdown
- **Производительности:** Настройка connection pooling, кэширование

**Общая оценка:** 6/10 - Код работает, но требует рефакторинга для production-ready состояния.

---

*Отчет составлен: 2026-03-28*  
*Проанализировано файлов: 9 (3 main.go, 3 go.mod, 3 go.sum)*  
*Найдено проблем: 25*
