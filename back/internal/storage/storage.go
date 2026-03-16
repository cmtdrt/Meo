package storage

import "time"

type Request struct {
	ID        string              `json:"id"`
	Method    string              `json:"method"`
	URL       string              `json:"url"`
	Headers   map[string][]string `json:"headers"`
	Body      string              `json:"body"`
	Timestamp time.Time           `json:"timestamp"`
}

type Response struct {
	StatusCode int                 `json:"statusCode"`
	Headers    map[string][]string `json:"headers"`
	Body       string              `json:"body"`
	Duration   time.Duration       `json:"duration"`
}

type Exchange struct {
	ID        string    `json:"id"`
	Request   Request   `json:"request"`
	Response  Response  `json:"response"`
	CreatedAt time.Time `json:"createdAt"`
}

type Store interface {
	SaveExchange(e *Exchange) error
	ListExchanges() ([]Exchange, error)
	GetExchange(id string) (*Exchange, error)
	DeleteExchange(id string) error
}

