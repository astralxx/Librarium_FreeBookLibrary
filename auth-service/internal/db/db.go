// internal/db/db.go
package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// NewConnection создаёт подключение к PostgreSQL с retry-логикой (важно для Docker)
func NewConnection() (*sql.DB, error) {
	dsn := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASS", "postgres"),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_NAME", "librarium"),
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open postgres connection: %w", err)
	}

	// Настройка пула соединений
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Retry-подключение (до 15 попыток)
	for i := 0; i < 15; i++ {
		if err = db.PingContext(context.Background()); err == nil {
			log.Println("✅ Connected to PostgreSQL successfully!")
			return db, nil
		}
		log.Printf("⏳ Waiting for PostgreSQL... attempt %d/15", i+1)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("failed to connect to PostgreSQL after retries: %w", err)
}

// getEnv — вспомогательная функция (дублируется, чтобы не зависеть от main)
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
