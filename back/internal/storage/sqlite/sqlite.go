package sqlite

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"meo/db"
	"meo/internal/storage"
)

type Store struct {
	db *sql.DB
}

func New(path string) (*Store, error) {
	d, err := db.Open(db.Config{Path: path})
	if err != nil {
		return nil, err
	}
	s := &Store{db: d.DB}
	if err := s.migrate(context.Background()); err != nil {
		_ = d.Close()
		return nil, err
	}
	return s, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) migrate(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, `
create table if not exists exchanges (
	id text primary key,
	method text not null,
	url text not null,
	request_headers text not null,
	request_body blob,
	response_status integer not null,
	response_headers text not null,
	response_body blob,
	started_at timestamp not null,
	duration_ms integer not null,
	created_at timestamp not null
);
`)
	return err
}

func (s *Store) SaveExchange(e *storage.Exchange) error {
	reqHeaders, err := json.Marshal(e.Request.Headers)
	if err != nil {
		return err
	}
	respHeaders, err := json.Marshal(e.Response.Headers)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`
insert into exchanges (
	id, method, url,
	request_headers, request_body,
	response_status, response_headers, response_body,
	started_at, duration_ms, created_at
) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, e.ID, e.Request.Method, e.Request.URL,
		string(reqHeaders), e.Request.Body,
		e.Response.StatusCode, string(respHeaders), e.Response.Body,
		e.Request.Timestamp, e.Response.Duration.Milliseconds(), e.CreatedAt,
	)
	return err
}

func (s *Store) ListExchanges() ([]storage.Exchange, error) {
	rows, err := s.db.Query(`
select id, method, url, request_headers, response_status, started_at, duration_ms, created_at
from exchanges
order by started_at desc
`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []storage.Exchange
	for rows.Next() {
		var (
			id        string
			method    string
			u         string
			reqHdrStr string
			status    int
			started   time.Time
			durMs     int64
			created   time.Time
		)
		if err := rows.Scan(&id, &method, &u, &reqHdrStr, &status, &started, &durMs, &created); err != nil {
			return nil, err
		}
		var reqHeaders map[string][]string
		if err := json.Unmarshal([]byte(reqHdrStr), &reqHeaders); err != nil {
			return nil, err
		}
		e := storage.Exchange{
			ID: id,
			Request: storage.Request{
				ID:        id,
				Method:    method,
				URL:       u,
				Headers:   reqHeaders,
				Timestamp: started,
			},
			Response: storage.Response{
				StatusCode: status,
				Duration:   time.Duration(durMs) * time.Millisecond,
			},
			CreatedAt: created,
		}
		out = append(out, e)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Store) GetExchange(id string) (*storage.Exchange, error) {
	row := s.db.QueryRow(`
select id, method, url,
	request_headers, request_body,
	response_status, response_headers, response_body,
	started_at, duration_ms, created_at
from exchanges
where id = ?
`, id)

	var (
		e           storage.Exchange
		reqHdrStr   string
		respHdrStr  string
		reqBody     []byte
		respBody    []byte
		started     time.Time
		durMs       int64
		created     time.Time
		method      string
		u           string
		status      int
		exchangeID  string
	)

	if err := row.Scan(
		&exchangeID, &method, &u,
		&reqHdrStr, &reqBody,
		&status, &respHdrStr, &respBody,
		&started, &durMs, &created,
	); err != nil {
		return nil, err
	}

	var reqHeaders map[string][]string
	if err := json.Unmarshal([]byte(reqHdrStr), &reqHeaders); err != nil {
		return nil, err
	}
	var respHeaders map[string][]string
	if err := json.Unmarshal([]byte(respHdrStr), &respHeaders); err != nil {
		return nil, err
	}

	e.ID = exchangeID
	e.Request = storage.Request{
		ID:        exchangeID,
		Method:    method,
		URL:       u,
		Headers:   reqHeaders,
		Body:      string(reqBody),
		Timestamp: started,
	}
	e.Response = storage.Response{
		StatusCode: status,
		Headers:    respHeaders,
		Body:       string(respBody),
		Duration:   time.Duration(durMs) * time.Millisecond,
	}
	e.CreatedAt = created

	return &e, nil
}

func (s *Store) DeleteExchange(id string) error {
	_, err := s.db.Exec(`delete from exchanges where id = ?`, id)
	return err
}

