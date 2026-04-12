package main

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"books-service/internal/db" // ← НОВЫЙ ИМПОРТ: общий слой подключения к БД
)

// ==================== MODELS ====================
type BookResponse struct {
	ID        int    `json:"book_id"`
	Title     string `json:"title"`
	Author    string `json:"author"`
	Genre     string `json:"genre"`
	CreatedAt string `json:"created_at"`
	Image     string `json:"book_img"`
	Type      string `json:"type"`
	Feature   string `json:"feature"`
}

// ==================== REPOSITORY LAYER ====================
type BookRepository struct {
	db *sql.DB
}

func NewBookRepository(db *sql.DB) *BookRepository {
	return &BookRepository{db: db}
}

func (r *BookRepository) processImage(imgData []byte) string {
	if len(imgData) > 0 {
		return "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(imgData)
	}
	return "/img/placeholder.jpg"
}

func (r *BookRepository) scanBooks(rows *sql.Rows) ([]BookResponse, error) {
	var books []BookResponse
	for rows.Next() {
		var b BookResponse
		var imgData []byte
		if err := rows.Scan(&b.ID, &b.Title, &b.Author, &b.Genre,
			&b.CreatedAt, &imgData, &b.Type, &b.Feature); err == nil {
			b.Image = r.processImage(imgData)
			books = append(books, b)
		}
	}
	return books, nil
}

func (r *BookRepository) GetBooks(ctx context.Context) ([]BookResponse, error) {
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		LIMIT 100`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scanBooks(rows)
}

func (r *BookRepository) GetBookByID(ctx context.Context, id string) (*BookResponse, error) {
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		WHERE b.book_id = $1`

	var b BookResponse
	var imgData []byte
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&b.ID, &b.Title, &b.Author, &b.Genre,
		&b.CreatedAt, &imgData, &b.Type, &b.Feature,
	)
	if err != nil {
		return nil, err
	}
	b.Image = r.processImage(imgData)
	return &b, nil
}

func (r *BookRepository) SearchBooks(ctx context.Context, q string) ([]BookResponse, error) {
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		WHERE b.title ILIKE '%' || $1 || '%' OR a.name ILIKE '%' || $1 || '%'
		LIMIT 50`

	rows, err := r.db.QueryContext(ctx, query, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scanBooks(rows)
}

func (r *BookRepository) GetFeaturedBooks(ctx context.Context) ([]BookResponse, error) {
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		WHERE b.feature IN ('новинка', 'бестселлер')
		LIMIT 12`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scanBooks(rows)
}

func (r *BookRepository) GetBooksByCategory(ctx context.Context, category string, params map[string]string) ([]BookResponse, error) {
	var query string
	var args []interface{}

	switch category {
	case "popular":
		bookType := params["type"]
		if bookType == "аудиокнига" {
			query = `
				SELECT b.book_id, b.title, a.name as author, g.name as genre,
					   b.created_at, b.book_img, b.type, b.feature
				FROM books b
				JOIN authors a ON b.author_id = a.author_id
				JOIN genres g ON b.genre_id = g.genre_id
				WHERE b.feature = $1 AND b.type = $2
				LIMIT 12`
			args = []interface{}{"бестселлер", "аудиокнига"}
		} else {
			query = `
				SELECT b.book_id, b.title, a.name as author, g.name as genre,
					   b.created_at, b.book_img, b.type, b.feature
				FROM books b
				JOIN authors a ON b.author_id = a.author_id
				JOIN genres g ON b.genre_id = g.genre_id
				WHERE b.feature = $1 AND b.type != 'аудиокнига'
				LIMIT 12`
			args = []interface{}{"бестселлер"}
		}

	case "new":
		offset := 0
		if offsetStr := params["offset"]; offsetStr != "" {
			parsedOffset, err := strconv.Atoi(offsetStr)
			if err != nil {
				return nil, fmt.Errorf("invalid offset parameter: %w", err)
			}
			offset = parsedOffset
		}
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE b.feature = $1 AND b.type != 'аудиокнига'
			ORDER BY b.created_at DESC
			LIMIT 12 OFFSET $2`
		args = []interface{}{"новинка", offset}

	case "fantasy":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE g.name = $1 AND b.type != 'аудиокнига'
			LIMIT 12`
		args = []interface{}{"Фантастика"}

	case "selfdev":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE g.name = $1 AND b.type != 'аудиокнига'
			LIMIT 12`
		args = []interface{}{"Саморазвитие"}

	case "comics":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE b.type = $1
			LIMIT 12`
		args = []interface{}{"Комикс"}

	case "audiobook":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE b.type = $1
			LIMIT 12`
		args = []interface{}{"Аудиокнига"}

	default:
		return nil, fmt.Errorf("invalid category: %s", category)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	books, err := r.scanBooks(rows)
	if err != nil {
		return nil, err
	}
	if len(books) == 0 {
		books = []BookResponse{}
	}
	return books, nil
}

// ==================== HANDLERS ====================
func (repo *BookRepository) getBooksHandler(w http.ResponseWriter, r *http.Request) {
	books, err := repo.GetBooks(r.Context())
	if err != nil {
		log.Printf("Database error in getBooksHandler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func (repo *BookRepository) getBookHandler(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	book, err := repo.GetBookByID(r.Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Book not found", http.StatusNotFound)
		} else {
			log.Printf("Database error in getBookHandler: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

func (repo *BookRepository) searchBooksHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		http.Error(w, "Search term is required", http.StatusBadRequest)
		return
	}
	books, err := repo.SearchBooks(r.Context(), q)
	if err != nil {
		log.Printf("Search query error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func (repo *BookRepository) getFeaturedBooksHandler(w http.ResponseWriter, r *http.Request) {
	books, err := repo.GetFeaturedBooks(r.Context())
	if err != nil {
		log.Printf("Database error in getFeaturedBooksHandler: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func (repo *BookRepository) getBooksByCategoryHandler(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	if category == "" {
		http.Error(w, "Category parameter is required", http.StatusBadRequest)
		return
	}

	params := make(map[string]string)
	for k, v := range r.URL.Query() {
		if len(v) > 0 {
			params[k] = v[0]
		}
	}

	books, err := repo.GetBooksByCategory(r.Context(), category, params)
	if err != nil {
		log.Printf("Database error in getBooksByCategoryHandler: %v", err)
		if err.Error() == fmt.Sprintf("invalid category: %s", category) {
			http.Error(w, "Invalid category", http.StatusBadRequest)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

// ==================== MAIN ====================
func main() {
	// Загрузка .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// ==================== НОВОЕ ПОДКЛЮЧЕНИЕ К БД ====================
	dbConn, err := db.NewConnection()
	if err != nil {
		log.Fatal(err)
	}
	defer dbConn.Close()

	// Создаём репозиторий
	repo := NewBookRepository(dbConn)

	// Маршруты
	r := mux.NewRouter()
	r.HandleFunc("/api/books", repo.getBooksHandler).Methods("GET")
	r.HandleFunc("/api/books/{id}", repo.getBookHandler).Methods("GET")
	r.HandleFunc("/api/books/search", repo.searchBooksHandler).Methods("GET")
	r.HandleFunc("/books/category", repo.getBooksByCategoryHandler).Methods("GET")
	r.HandleFunc("/books/featured", repo.getFeaturedBooksHandler).Methods("GET")

	port := getEnv("SERVER_PORT", "3001")
	log.Printf("🚀 Books service started on :%s", port)
	log.Println("Available endpoints:")
	log.Println("   GET /api/books")
	log.Println("   GET /api/books/{id}")
	log.Println("   GET /api/books/search?q=...")
	log.Println("   GET /books/category?category=...")
	log.Println("   GET /books/featured")

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
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

	log.Println("Shutting down books service...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Books service exited")
}

// getEnv — вспомогательная функция (для SERVER_PORT и совместимости)
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
