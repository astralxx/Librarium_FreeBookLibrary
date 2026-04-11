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
)

// Структуры данных
type Book struct {
	ID        int    `json:"book_id"`
	Title     string `json:"title"`
	AuthorID  int    `json:"author_id"`
	GenreID   int    `json:"genre_id"`
	CreatedAt string `json:"created_at"`
	Image     string `json:"book_img"`
	Type      string `json:"type"`
	Feature   string `json:"feature"`
}

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

var db *sql.DB

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	// Загрузка .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// PostgreSQL DSN
	dsn := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASS", "postgres"),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_NAME", "books-db"),
	)

	var err error
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Проверка соединения
	if err = db.Ping(); err != nil {
		log.Fatal("PostgreSQL connection failed:", err)
	}
	log.Println("✅ Connected to PostgreSQL (books service)!")

	// Маршруты
	r := mux.NewRouter()
	r.HandleFunc("/api/books", getBooksHandler).Methods("GET")
	r.HandleFunc("/api/books/{id}", getBookHandler).Methods("GET")
	r.HandleFunc("/api/books/search", searchBooksHandler).Methods("GET")
	r.HandleFunc("/books/category", getBooksByCategoryHandler).Methods("GET")
	r.HandleFunc("/books/featured", getFeaturedBooksHandler).Methods("GET")

	port := getEnv("SERVER_PORT", "3001")
	log.Printf("🚀 Books service started on :%s", port)
	log.Println("Available endpoints:")
	log.Println("GET /api/books")
	log.Println("GET /api/books/{id}")
	log.Println("GET /api/books/search")
	log.Println("GET /books/category")
	log.Println("GET /books/featured")

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
	srv.Shutdown(ctx)
}

// ====================== HELPERS ======================
func processImage(imgData []byte) string {
	if len(imgData) > 0 {
		return "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(imgData)
	}
	return "/img/placeholder.jpg"
}

func scanBook(rows *sql.Rows) (*BookResponse, error) {
	var b BookResponse
	var imgData []byte
	err := rows.Scan(&b.ID, &b.Title, &b.Author, &b.Genre,
		&b.CreatedAt, &imgData, &b.Type, &b.Feature)
	if err != nil {
		return nil, err
	}
	b.Image = processImage(imgData)
	return &b, nil
}

// ====================== HANDLERS ======================
func getBooksHandler(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		LIMIT 100`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []BookResponse
	for rows.Next() {
		book, err := scanBook(rows)
		if err != nil {
			continue
		}
		books = append(books, *book)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func getBookHandler(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		WHERE b.book_id = $1`

	var book BookResponse
	var imgData []byte
	err := db.QueryRow(query, id).Scan(
		&book.ID, &book.Title, &book.Author, &book.Genre,
		&book.CreatedAt, &imgData, &book.Type, &book.Feature,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Book not found", http.StatusNotFound)
		} else {
			log.Printf("Database error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	book.Image = processImage(imgData)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

func searchBooksHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		http.Error(w, "Search term is required", http.StatusBadRequest)
		return
	}

	sqlQuery := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		WHERE b.title ILIKE '%' || $1 || '%' OR a.name ILIKE '%' || $1 || '%'
		LIMIT 50`

	rows, err := db.Query(sqlQuery, q)
	if err != nil {
		log.Printf("Search query error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []BookResponse
	for rows.Next() {
		book, err := scanBook(rows)
		if err != nil {
			continue
		}
		books = append(books, *book)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func getFeaturedBooksHandler(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT b.book_id, b.title, a.name as author, g.name as genre,
		       b.created_at, b.book_img, b.type, b.feature
		FROM books b
		JOIN authors a ON b.author_id = a.author_id
		JOIN genres g ON b.genre_id = g.genre_id
		WHERE b.feature IN ('новинка', 'бестселлер')
		LIMIT 12`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []BookResponse
	for rows.Next() {
		book, err := scanBook(rows)
		if err != nil {
			continue
		}
		books = append(books, *book)
	}

	if len(books) == 0 {
		books = []BookResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

// ====================== ПОЛНЫЙ getBooksByCategoryHandler ======================
func getBooksByCategoryHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Received request: %s %s", r.Method, r.URL.String())
	log.Printf("Query params: %v", r.URL.Query())

	category := r.URL.Query().Get("category")
	log.Println("Category parameter:", category)

	if category == "" {
		http.Error(w, "Category parameter is required", http.StatusBadRequest)
		return
	}

	var query string
	var args []interface{}

	switch category {
	case "popular":
		bookType := r.URL.Query().Get("type")
		if bookType == "аудиокнига" {
			query = `
				SELECT b.book_id, b.title, a.name as author, g.name as genre,
					   b.created_at, b.book_img, b.type, b.feature
				FROM books b
				JOIN authors a ON b.author_id = a.author_id
				JOIN genres g ON b.genre_id = g.genre_id
				WHERE b.feature = $1 AND b.type = $2
				LIMIT 12`
			args = append(args, "бестселлер", "аудиокнига")
		} else {
			query = `
				SELECT b.book_id, b.title, a.name as author, g.name as genre,
					   b.created_at, b.book_img, b.type, b.feature
				FROM books b
				JOIN authors a ON b.author_id = a.author_id
				JOIN genres g ON b.genre_id = g.genre_id
				WHERE b.feature = $1 AND b.type != 'аудиокнига'
				LIMIT 12`
			args = append(args, "бестселлер")
		}

	case "new":
		offset := 0
		if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
			parsedOffset, err := strconv.Atoi(offsetStr)
			if err != nil {
				log.Printf("Invalid offset parameter: %v", err)
				http.Error(w, "Invalid offset parameter", http.StatusBadRequest)
				return
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
		args = append(args, "новинка", offset)

	case "fantasy":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE g.name = $1 AND b.type != 'аудиокнига'
			LIMIT 12`
		args = append(args, "Фантастика")

	case "selfdev":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE g.name = $1 AND b.type != 'аудиокнига'
			LIMIT 12`
		args = append(args, "Саморазвитие")

	case "comics":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE b.type = $1
			LIMIT 12`
		args = append(args, "Комикс")

	case "audiobook":
		query = `
			SELECT b.book_id, b.title, a.name as author, g.name as genre,
				   b.created_at, b.book_img, b.type, b.feature
			FROM books b
			JOIN authors a ON b.author_id = a.author_id
			JOIN genres g ON b.genre_id = g.genre_id
			WHERE b.type = $1
			LIMIT 12`
		args = append(args, "Аудиокнига")

	default:
		http.Error(w, "Invalid category", http.StatusBadRequest)
		return
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var books []BookResponse
	for rows.Next() {
		book, err := scanBook(rows)
		if err != nil {
			continue
		}
		books = append(books, *book)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Rows iteration error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if len(books) == 0 {
		books = []BookResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}
