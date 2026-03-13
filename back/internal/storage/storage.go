package storage

import "time"

type Request struct {
	ID        string
	Method    string
	URL       string
	Headers   map[string][]string
	Body      string
	Timestamp time.Time
}

type Response struct {
	StatusCode int
	Headers    map[string][]string
	Body       string
	Duration   time.Duration
}

type Exchange struct {
	ID        string
	Request   Request
	Response  Response
	CreatedAt time.Time
}

type Store interface {
	SaveExchange(e *Exchange) error
	ListExchanges() ([]Exchange, error)
	GetExchange(id string) (*Exchange, error)
	DeleteExchange(id string) error
}

