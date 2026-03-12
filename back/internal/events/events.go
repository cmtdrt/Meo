package events

import (
	"sync"

	"meo/internal/storage"
)

type Subscriber chan storage.Exchange

type Hub struct {
	mu   sync.RWMutex
	subs map[Subscriber]struct{}
}

func NewHub() *Hub {
	return &Hub{
		subs: make(map[Subscriber]struct{}),
	}
}

func (h *Hub) Subscribe() Subscriber {
	ch := make(Subscriber, 16)
	h.mu.Lock()
	h.subs[ch] = struct{}{}
	h.mu.Unlock()
	return ch
}

func (h *Hub) Unsubscribe(ch Subscriber) {
	h.mu.Lock()
	delete(h.subs, ch)
	h.mu.Unlock()
	close(ch)
}

func (h *Hub) Publish(e *storage.Exchange) {
	h.mu.RLock()
	subs := make([]Subscriber, 0, len(h.subs))
	for ch := range h.subs {
		subs = append(subs, ch)
	}
	h.mu.RUnlock()

	for _, ch := range subs {
		select {
		case ch <- *e:
		default:
		}
	}
}

