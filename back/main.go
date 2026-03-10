package main

import (
	"fmt"
	"log"

	"meo/db"
)

func main() {
	database, err := db.Open(db.Config{Path: "./data/meo.db"})
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	fmt.Println("Hello Meo! DB SQLite connectée.")
}
