package proxy

import (
	"bytes"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/google/uuid"

	"meo/internal/storage"
)

type Proxy struct {
	target *url.URL
	store  storage.Store
	client *http.Client
}

func New(target *url.URL, store storage.Store) *Proxy {
	return &Proxy{
		target: target,
		store:  store,
		client: &http.Client{},
	}
}

func (p *Proxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	id := uuid.NewString()

	var bodyCopy []byte
	if r.Body != nil {
		b, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "failed to read request body", http.StatusBadRequest)
			return
		}
		bodyCopy = b
		r.Body = io.NopCloser(bytes.NewReader(b))
	}

	outReq, err := http.NewRequestWithContext(r.Context(), r.Method, p.buildTargetURL(r), bytes.NewReader(bodyCopy))
	if err != nil {
		http.Error(w, "failed to build upstream request", http.StatusBadGateway)
		return
	}
	outReq.Header = cloneHeader(r.Header)

	start := time.Now()
	resp, err := p.client.Do(outReq)
	if err != nil {
		http.Error(w, "upstream error", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "failed to read upstream response", http.StatusBadGateway)
		return
	}

	for k, vs := range resp.Header {
		for _, v := range vs {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)

	exchange := &storage.Exchange{
		ID: id,
		Request: storage.Request{
			ID:        id,
			Method:    r.Method,
			URL:       outReq.URL.String(),
			Headers:   cloneHeader(r.Header),
			Body:      bodyCopy,
			Timestamp: start,
		},
		Response: storage.Response{
			StatusCode: resp.StatusCode,
			Headers:    cloneHeader(resp.Header),
			Body:       respBody,
			Duration:   time.Since(start),
		},
		CreatedAt: time.Now(),
	}
	_ = p.store.SaveExchange(exchange)
}

func (p *Proxy) buildTargetURL(r *http.Request) string {
	u := *p.target
	u.Path = singleJoin(u.Path, r.URL.Path)
	u.RawQuery = r.URL.RawQuery
	return u.String()
}

func cloneHeader(h http.Header) map[string][]string {
	out := make(map[string][]string, len(h))
	for k, v := range h {
		cp := make([]string, len(v))
		copy(cp, v)
		out[k] = cp
	}
	return out
}

func singleJoin(a, b string) string {
	switch {
	case a == "":
		return b
	case b == "":
		return a
	case a[len(a)-1] == '/' && b[0] == '/':
		return a + b[1:]
	case a[len(a)-1] != '/' && b[0] != '/':
		return a + "/" + b
	default:
		return a + b
	}
}

