package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"

	"golang.org/x/oauth2"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// Константы для валидации
const (
	MinUsernameLength = 3
	MaxUsernameLength = 50
	MinPasswordLength = 8
	MaxPasswordLength = 128
	MaxEmailLength    = 255
)

// Константы для rate limiting
const (
	RateLimitWindow     = 15 * time.Minute
	MaxLoginAttempts    = 5
	MaxRegisterAttempts = 3
)

// Глобальные переменные
var (
	yandexOauthConfig *oauth2.Config
	db                *sql.DB
	jwtKey            []byte
	frontendURL       string

	loginAttempts    = make(map[string][]time.Time)
	registerAttempts = make(map[string][]time.Time)
	attemptsMutex    sync.RWMutex
)

// User структура для данных пользователя
type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Claims структура для JWT claims
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

// ValidationError структура для ошибок валидации
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidateResponse структура для ответа с ошибками валидации
type ValidateResponse struct {
	Errors []ValidationError `json:"errors"`
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
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
		log.Fatalf("JWT_SECRET must be at least 32 characters (current length: %d)", len(jwtSecret))
	}
	jwtKey = []byte(jwtSecret)

	// Frontend URL
	frontendURL = getEnv("FRONTEND_URL", "http://localhost:5173")

	// Yandex OAuth Config
	yandexOauthConfig = &oauth2.Config{
		RedirectURL:  getEnv("YANDEX_REDIRECT_URL", "http://localhost:3000/auth/yandex/callback"),
		ClientID:     os.Getenv("YANDEX_CLIENT_ID"),
		ClientSecret: os.Getenv("YANDEX_CLIENT_SECRET"),
		Scopes:       []string{"login:email", "login:info"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://oauth.yandex.ru/authorize",
			TokenURL: "https://oauth.yandex.ru/token",
		},
	}

	// PostgreSQL DSN
	dsn := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASS", "postgres"),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_NAME", "librariumdb"),
	)

	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err = db.Ping(); err != nil {
		log.Fatal("PostgreSQL connection failed:", err)
	}
	log.Println("✅ Connected to PostgreSQL (auth service)!")

	// Настройка маршрутов
	r := mux.NewRouter()
	r.Use(loggingMiddleware)
	r.Use(rateLimitMiddleware)

	// Публичные маршруты
	r.HandleFunc("/register", registerHandler).Methods("POST")
	r.HandleFunc("/login", loginHandler).Methods("POST")
	r.HandleFunc("/auth/yandex", yandexLoginHandler).Methods("GET")
	r.HandleFunc("/auth/yandex/callback", yandexCallbackHandler).Methods("GET")

	// Защищённые маршруты
	r.HandleFunc("/profile", authMiddleware(profileHandler)).Methods("GET")
	r.HandleFunc("/logout", authMiddleware(logoutHandler)).Methods("POST")

	// Запуск сервера
	serverHost := getEnv("SERVER_HOST", "127.0.0.1")
	serverPort := getEnv("SERVER_PORT", "3000")
	addr := fmt.Sprintf("%s:%s", serverHost, serverPort)

	srv := &http.Server{
		Handler:      r,
		Addr:         addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	go func() {
		log.Printf("Auth service listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down auth service...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Auth service exited")
}

// ==================== MIDDLEWARE ====================
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(wrapped, r)
		log.Printf("method=%s path=%s status=%d duration=%s ip=%s",
			r.Method, r.URL.Path, wrapped.statusCode, time.Since(start), r.RemoteAddr)
	})
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		if r.URL.Path == "/login" && r.Method == "POST" && isRateLimited(ip, "login") {
			http.Error(w, "Too many login attempts. Please try again later.", http.StatusTooManyRequests)
			return
		}
		if r.URL.Path == "/register" && r.Method == "POST" && isRateLimited(ip, "register") {
			http.Error(w, "Too many registration attempts. Please try again later.", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isRateLimited(ip, action string) bool {
	attemptsMutex.RLock()
	defer attemptsMutex.RUnlock()

	var attempts map[string][]time.Time
	var maxAttempts int
	switch action {
	case "login":
		attempts = loginAttempts
		maxAttempts = MaxLoginAttempts
	case "register":
		attempts = registerAttempts
		maxAttempts = MaxRegisterAttempts
	default:
		return false
	}

	now := time.Now()
	windowStart := now.Add(-RateLimitWindow)
	validAttempts := make([]time.Time, 0, len(attempts[ip]))
	for _, t := range attempts[ip] {
		if t.After(windowStart) {
			validAttempts = append(validAttempts, t)
		}
	}
	attempts[ip] = validAttempts
	return len(validAttempts) >= maxAttempts
}

func addAttempt(ip, action string) {
	attemptsMutex.Lock()
	defer attemptsMutex.Unlock()
	now := time.Now()
	switch action {
	case "login":
		loginAttempts[ip] = append(loginAttempts[ip], now)
	case "register":
		registerAttempts[ip] = append(registerAttempts[ip], now)
	}
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie("token")
		if err != nil {
			if err == http.ErrNoCookie {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		tokenStr := c.Value
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtKey, nil
		})

		if err != nil || !token.Valid || claims.RegisteredClaims.Issuer != "library-reports" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// ==================== VALIDATION ====================
func validateUser(user User) []ValidationError {
	var errs []ValidationError

	if user.Username == "" {
		errs = append(errs, ValidationError{Field: "username", Message: "Username is required"})
	} else if len(user.Username) < MinUsernameLength {
		errs = append(errs, ValidationError{Field: "username", Message: fmt.Sprintf("Username must be at least %d characters", MinUsernameLength)})
	} else if len(user.Username) > MaxUsernameLength {
		errs = append(errs, ValidationError{Field: "username", Message: fmt.Sprintf("Username must be at most %d characters", MaxUsernameLength)})
	} else if !isValidUsername(user.Username) {
		errs = append(errs, ValidationError{Field: "username", Message: "Username can only contain letters, numbers, and underscores"})
	}

	if user.Email == "" {
		errs = append(errs, ValidationError{Field: "email", Message: "Email is required"})
	} else if len(user.Email) > MaxEmailLength {
		errs = append(errs, ValidationError{Field: "email", Message: fmt.Sprintf("Email must be at most %d characters", MaxEmailLength)})
	} else if !isValidEmail(user.Email) {
		errs = append(errs, ValidationError{Field: "email", Message: "Invalid email format"})
	}

	if user.Password == "" {
		errs = append(errs, ValidationError{Field: "password", Message: "Password is required"})
	} else if len(user.Password) < MinPasswordLength {
		errs = append(errs, ValidationError{Field: "password", Message: fmt.Sprintf("Password must be at least %d characters", MinPasswordLength)})
	} else if len(user.Password) > MaxPasswordLength {
		errs = append(errs, ValidationError{Field: "password", Message: fmt.Sprintf("Password must be at most %d characters", MaxPasswordLength)})
	} else if !isStrongPassword(user.Password) {
		errs = append(errs, ValidationError{Field: "password", Message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"})
	}

	return errs
}

func isValidUsername(username string) bool {
	pattern := `^[a-zA-Z0-9_]+$`
	matched, _ := regexp.MatchString(pattern, username)
	return matched
}

func isValidEmail(email string) bool {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	matched, _ := regexp.MatchString(pattern, email)
	return matched
}

func isStrongPassword(password string) bool {
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
	return hasUpper && hasLower && hasNumber && hasSpecial
}

func sanitizeInput(input string) string {
	input = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(input, "")
	return strings.TrimSpace(input)
}

// ==================== HANDLERS ====================
func registerHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	user.Username = sanitizeInput(user.Username)
	user.Email = sanitizeInput(user.Email)

	if validationErrors := validateUser(user); len(validationErrors) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ValidateResponse{Errors: validationErrors})
		return
	}

	var exists bool
	err := db.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2)`,
		user.Username, user.Email).Scan(&exists)
	if err != nil {
		log.Printf("Database error in registerHandler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Username or email already taken", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Password hashing error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	result, err := db.Exec(`INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
		user.Username, user.Email, string(hashedPassword))
	if err != nil {
		log.Printf("SQL error in registerHandler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	userID64, _ := result.LastInsertId()
	userID := int(userID64)

	tokenString, err := generateToken(userID, user.Username, user.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	setAuthCookie(w, tokenString)
	log.Printf("User registered: id=%d", userID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered and authenticated!",
		"token":   tokenString,
		"user": map[string]string{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	user.Username = sanitizeInput(user.Username)

	if user.Username == "" || user.Password == "" {
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	var dbUser User
	var hashedPassword string
	var userID int
	err := db.QueryRow("SELECT id, username, email, password FROM users WHERE username = $1 AND is_active = TRUE", user.Username).
		Scan(&userID, &dbUser.Username, &dbUser.Email, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			addAttempt(r.RemoteAddr, "login")
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		} else {
			log.Printf("Database error in loginHandler: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password)); err != nil {
		addAttempt(r.RemoteAddr, "login")
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	tokenString, err := generateToken(userID, dbUser.Username, dbUser.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	setAuthCookie(w, tokenString)
	log.Printf("User logged in: id=%d", userID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login successful!",
		"token":   tokenString,
		"user": map[string]string{
			"username": dbUser.Username,
			"email":    dbUser.Email,
		},
	})
}

func yandexLoginHandler(w http.ResponseWriter, r *http.Request) {
	url := yandexOauthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	log.Println("Redirecting to Yandex OAuth")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   os.Getenv("COOKIE_SECURE") == "true",
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func yandexCallbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Authorization code is required", http.StatusBadRequest)
		return
	}

	token, err := yandexOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Failed to exchange token: %v", err)
		http.Error(w, "Authentication failed", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	userInfoURL := "https://login.yandex.ru/info?format=json"
	req, err := http.NewRequestWithContext(ctx, "GET", userInfoURL, nil)
	if err != nil {
		log.Printf("Failed to create user info request: %v", err)
		http.Error(w, "Authentication failed", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", "OAuth "+token.AccessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to get user info: %v", err)
		http.Error(w, "Authentication failed", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var userInfo struct {
		ID    string `json:"id"`
		Email string `json:"default_email"`
		Login string `json:"login"`
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read user info response: %v", err)
		http.Error(w, "Authentication failed", http.StatusInternalServerError)
		return
	}

	if err := json.Unmarshal(body, &userInfo); err != nil {
		log.Printf("Failed to decode user info: %v", err)
		http.Error(w, "Authentication failed", http.StatusInternalServerError)
		return
	}

	if userInfo.Email == "" {
		userInfo.Email = fmt.Sprintf("yandex_user_%s@yandex-temp.com", userInfo.ID)
	}

	if !isValidEmail(userInfo.Email) {
		http.Error(w, "Invalid email from Yandex", http.StatusBadRequest)
		return
	}

	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", userInfo.Email).Scan(&exists)
	if err != nil {
		log.Printf("Database error in yandexCallbackHandler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	var user User
	var userID int

	if !exists {
		username := sanitizeInput(userInfo.Login)
		if username == "" {
			username = sanitizeInput(strings.Split(userInfo.Email, "@")[0])
		}

		var usernameExists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", username).Scan(&usernameExists)
		if err != nil {
			log.Printf("Database error in yandexCallbackHandler: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if usernameExists {
			username = fmt.Sprintf("%s_%d", username, time.Now().UnixNano()%10000)
		}

		// Генерируем случайный пароль и хэшируем его
		randomPassword := "yandex_auth_" + generateRandomString(32)
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		result, err := db.Exec("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
			username, userInfo.Email, string(hashedPassword))
		if err != nil {
			log.Printf("Failed to create user: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		userID64, _ := result.LastInsertId()
		userID = int(userID64)
		user = User{Username: username, Email: userInfo.Email}
	} else {
		err = db.QueryRow("SELECT id, username, email FROM users WHERE email = $1", userInfo.Email).
			Scan(&userID, &user.Username, &user.Email)
		if err != nil {
			log.Printf("Database error in yandexCallbackHandler: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}

	tokenString, err := generateToken(userID, user.Username, user.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	setAuthCookie(w, tokenString)
	http.Redirect(w, r, frontendURL+"/profile", http.StatusTemporaryRedirect)
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("claims").(*Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username": claims.Username,
		"email":    claims.Email,
		"message":  "Welcome to your profile!",
	})
}

// ==================== JWT HELPERS ====================
func generateToken(userID int, username, email string) (string, error) {
	expirationTime := time.Now().Add(1 * time.Hour)
	claims := &Claims{
		UserID:   userID,
		Username: username,
		Email:    email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "library-reports",
			Subject:   fmt.Sprintf("%d", userID),
			ID:        generateRandomString(16),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func setAuthCookie(w http.ResponseWriter, tokenString string) {
	cookieSecure := os.Getenv("COOKIE_SECURE") == "true"
	cookieSameSite := http.SameSiteLaxMode
	if os.Getenv("COOKIE_SAMESITE") == "None" {
		cookieSameSite = http.SameSiteNoneMode
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  time.Now().Add(1 * time.Hour),
		HttpOnly: true,
		Secure:   cookieSecure,
		SameSite: cookieSameSite,
		Path:     "/",
	})
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		// fallback на time-based (не криптостойкий, но для временного пароля OAuth подойдёт)
		for i := range b {
			b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
			time.Sleep(1 * time.Nanosecond)
		}
		return string(b)
	}
	for i := range b {
		b[i] = charset[int(b[i])%len(charset)]
	}
	return string(b)
}
