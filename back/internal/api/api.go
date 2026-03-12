package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"meo/internal/storage"
	"meo/internal/proxy"
)

type Server struct {
	store storage.Store
	p     *proxy.Proxy
}

func New(store storage.Store, p *proxy.Proxy) *Server {
	return &Server{store: store, p: p}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/exchanges", s.handleListExchanges)
	mux.HandleFunc("/exchanges/", s.handleExchange)
	return mux
}

func (s *Server) handleListExchanges(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	list, err := s.store.ListExchanges()
	if err != nil {
		http.Error(w, "failed to list exchanges", http.StatusInternalServerError)
		return
	}
	writeJSON(w, list)
}

func (s *Server) handleExchange(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/exchanges/")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}
	switch r.Method {
	case http.MethodGet:
		s.getExchange(w, r, id)
	case http.MethodDelete:
		s.deleteExchange(w, r, id)
	case http.MethodPost:
		if strings.HasSuffix(r.URL.Path, "/replay") {
			s.replayExchange(w, r, strings.TrimSuffix(id, "/replay"))
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) getExchange(w http.ResponseWriter, r *http.Request, id string) {
	e, err := s.store.GetExchange(id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	writeJSON(w, e)
}

func (s *Server) deleteExchange(w http.ResponseWriter, r *http.Request, id string) {
	if err := s.store.DeleteExchange(id); err != nil {
		http.Error(w, "failed to delete", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) replayExchange(w http.ResponseWriter, r *http.Request, id string) {
	e, err := s.store.GetExchange(id)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	req, err := http.NewRequestWithContext(r.Context(), e.Request.Method, e.Request.URL, bytesReader(e.Request.Body))
	if err != nil {
		http.Error(w, "failed to rebuild request", http.StatusInternalServerError)
		return
	}
	for k, vs := range e.Request.Headers {
		for _, v := range vs {
			req.Header.Add(k, v)
		}
	}

	s.p.ServeHTTP(w, req)
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

func bytesReader(b []byte) *strings.Reader {
	return strings.NewReader(string(b))
}

