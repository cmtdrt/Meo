package db

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
}

type Config struct {
	Path string
}

func Open(cfg Config) (*DB, error) {
	if cfg.Path == "" {
		cfg.Path = "./meo.db"
	}
	db, err := sql.Open("sqlite", cfg.Path)
	if err != nil {
		return nil, fmt.Errorf("db open: %w", err)
	}
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("db ping: %w", err)
	}
	db.SetMaxOpenConns(1)
	return &DB{DB: db}, nil
}

func (db *DB) Close() error {
	return db.DB.Close()
}
