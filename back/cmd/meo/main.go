package main

import (
	"flag"
	"log"
	"net/http"
	"net/url"

	"meo/internal/api"
	"meo/internal/config"
	"meo/internal/proxy"
	"meo/internal/storage/sqlite"
)

func main() {
	proxyAddr := flag.String("proxy-addr", ":8080", "proxy listen address")
	apiAddr := flag.String("api-addr", ":8081", "API listen address")
	targetBaseURL := flag.String("target-base-url", "", "target API base URL")
	dbPath := flag.String("db-path", "./data/meo.db", "database path")
	logLevel := flag.String("log-level", "info", "log level")
	configFile := flag.String("config", "", "config file path")

	flag.Parse()

	cfg := config.Config{
		ProxyAddr:     *proxyAddr,
		APIAddr:       *apiAddr,
		TargetBaseURL: *targetBaseURL,
		DBPath:        *dbPath,
		LogLevel:      *logLevel,
		ConfigFile:    *configFile,
	}

	if err := config.Load(&cfg); err != nil {
		log.Fatal(err)
	}

	if cfg.TargetBaseURL == "" {
		log.Fatal("target-base-url is required")
	}

	u, err := url.Parse(cfg.TargetBaseURL)
	if err != nil {
		log.Fatal(err)
	}

	store, err := sqlite.New(cfg.DBPath)
	if err != nil {
		log.Fatal(err)
	}
	defer store.Close()

	p := proxy.New(u, store)
	apiServer := api.New(store, p)

	go func() {
		log.Printf("proxy listening on %s", cfg.ProxyAddr)
		if err := http.ListenAndServe(cfg.ProxyAddr, p); err != nil {
			log.Fatal(err)
		}
	}()

	log.Printf("api listening on %s", cfg.APIAddr)
	if err := http.ListenAndServe(cfg.APIAddr, apiServer.Handler()); err != nil {
		log.Fatal(err)
	}
}

