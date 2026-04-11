package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var jwtKey []byte
var authServiceURL *url.URL
var booksServiceURL *url.URL
var statsServiceURL *url.URL
var frontendURL string
var corsAllowedOrigins []string

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func init() {
	// Загрузка .env файла
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// JWT Secret
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	if len(jwtSecret) < 32 {
		log.Fatal("JWT_SECRET must be at least 32 characters")
	}
	jwtKey = []byte(jwtSecret)

	// Service URLs
	authURL := getEnv("AUTH_SERVICE_URL", "http://localhost:3000")
	booksURL := getEnv("BOOKS_SERVICE_URL", "http://localhost:3001")
	statsURL := getEnv("STATS_SERVICE_URL", "http://localhost:3002")
	frontendURL = getEnv("FRONTEND_URL", "http://localhost:5173")

	var err error
	authServiceURL, err = url.Parse(authURL)
	if err != nil {
		log.Fatalf("Invalid AUTH_SERVICE_URL: %v", err)
	}
	booksServiceURL, err = url.Parse(booksURL)
	if err != nil {
		log.Fatalf("Invalid BOOKS_SERVICE_URL: %v", err)
	}
	statsServiceURL, err = url.Parse(statsURL)
	if err != nil {
		log.Fatalf("Invalid STATS_SERVICE_URL: %v", err)
	}

	// CORS
	corsOrigins := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
	corsAllowedOrigins = strings.Split(corsOrigins, ",")
}

func main() {
	// Прокси
	authProxy := httputil.NewSingleHostReverseProxy(authServiceURL)
	booksProxy := httputil.NewSingleHostReverseProxy(booksServiceURL)
	statsProxy := httputil.NewSingleHostReverseProxy(statsServiceURL)

	r := mux.NewRouter()

	// ========== Маршруты для auth-service ==========
	// Регистрация
	r.HandleFunc("/auth/register", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/register"
		authProxy.ServeHTTP(w, r)
	}).Methods("POST", "OPTIONS")

	// Логин
	r.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/login"
		authProxy.ServeHTTP(w, r)
	}).Methods("POST", "OPTIONS")

	// Выход
	r.HandleFunc("/auth/logout", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/logout"
		authProxy.ServeHTTP(w, r)
	}).Methods("POST", "OPTIONS")

	// Профиль (требует аутентификации)
	r.HandleFunc("/auth/profile", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/profile"
		authProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// Yandex OAuth — начало
	r.HandleFunc("/auth/yandex", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/auth/yandex"
		authProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// Yandex OAuth — callback
	r.HandleFunc("/auth/yandex/callback", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = "/auth/yandex/callback"
		authProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// ========== Маршруты для books-service ==========
	// Все маршруты /api/books...
	r.HandleFunc("/api/books", func(w http.ResponseWriter, r *http.Request) {
		booksProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	r.HandleFunc("/api/books/{id}", func(w http.ResponseWriter, r *http.Request) {
		booksProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	r.HandleFunc("/api/books/search", func(w http.ResponseWriter, r *http.Request) {
		booksProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	r.HandleFunc("/books/category", func(w http.ResponseWriter, r *http.Request) {
		booksProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	r.HandleFunc("/books/featured", func(w http.ResponseWriter, r *http.Request) {
		booksProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// ========== Статистика (требует токен) ==========
	r.PathPrefix("/api/stats/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !verifyToken(r) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}
		// Убираем префикс /api/stats при проксировании
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/stats")
		statsProxy.ServeHTTP(w, r)
	})

	// ========== Специальный маршрут для /profile с передачей токена через query ==========
	r.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		// Если токен передан в query параметре ?token=...
		if token := r.URL.Query().Get("token"); token != "" {
			if validateJWT(token) {
				// Устанавливаем cookie
				cookieSecure := os.Getenv("COOKIE_SECURE") == "true"
				cookieSameSite := http.SameSiteLaxMode
				if os.Getenv("COOKIE_SAMESITE") == "None" {
					cookieSameSite = http.SameSiteNoneMode
				}
				http.SetCookie(w, &http.Cookie{
					Name:     "token",
					Value:    token,
					Expires:  time.Now().Add(24 * time.Hour),
					HttpOnly: true,
					Secure:   cookieSecure,
					SameSite: cookieSameSite,
					Path:     "/",
				})
				http.Redirect(w, r, frontendURL+"/profile", http.StatusTemporaryRedirect)
				return
			}
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}
		// Иначе проксируем в auth-service /profile
		r.URL.Path = "/profile"
		authProxy.ServeHTTP(w, r)
	}).Methods("GET", "OPTIONS")

	// ========== Middleware CORS ==========
	handler := corsMiddleware(r)

	serverPort := getEnv("SERVER_PORT", "8080")
	log.Printf("API Gateway started on :%s", serverPort)

	srv := &http.Server{
		Addr:         ":" + serverPort,
		Handler:      handler,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down gateway...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Gateway exited")
}

// corsMiddleware обрабатывает CORS заголовки и preflight-запросы
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowed := false
		for _, allowedOrigin := range corsAllowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}
		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// verifyToken проверяет наличие и валидность JWT токена (из cookie или заголовка Authorization)
// Для публичных маршрутов возвращает true без проверки токена
func verifyToken(r *http.Request) bool {
	// Публичные маршруты, не требующие токена
	if r.Method == "GET" && (strings.HasPrefix(r.URL.Path, "/api/books") ||
		strings.HasPrefix(r.URL.Path, "/books/") ||
		r.URL.Path == "/books/featured" ||
		r.URL.Path == "/books/category") {
		return true
	}
	if r.Method == "POST" && (r.URL.Path == "/auth/register" ||
		r.URL.Path == "/auth/login" ||
		r.URL.Path == "/auth/yandex" ||
		r.URL.Path == "/auth/yandex/callback") {
		return true
	}
	if r.Method == "GET" && r.URL.Path == "/profile" {
		// /profile может быть публичным только если нет токена? нет, требует проверки
		// но здесь вызывается verifyToken только для /api/stats, а для /profile проверка внутри другого обработчика
		return false
	}

	// Проверка токена в cookie
	if cookie, err := r.Cookie("token"); err == nil && cookie != nil {
		return validateJWT(cookie.Value)
	}
	// Проверка токена в заголовке Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		return validateJWT(tokenString)
	}
	return false
}

// validateJWT проверяет подпись и валидность JWT
func validateJWT(tokenString string) bool {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		log.Printf("JWT validation error: %v", err)
		return false
	}
	return token.Valid
}
