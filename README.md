# MEO

MEO is a small developer tool that sits as a reverse proxy in front of your HTTP API.  
It captures every request/response, stores it in SQLite, and exposes a web UI to inspect and replay traffic.

---

## Features

- Reverse proxy in front of any HTTP API
- Capture of full HTTP exchanges (request + response, headers, body, timestamps, latency)
- Persistent storage in SQLite
- Web dashboard to:
  - browse a timeline of requests
  - inspect request and response details
  - replay captured requests
  - compare original vs replayed responses
- Real-time updates via Server-Sent Events (SSE)

---

## Quick start

1. **Run your target API**  
   Example: `http://localhost:3000`

2. **Run the MEO backend**

   ```bash
   cd back
   go run ./cmd/meo \
     --proxy-addr :8080 \
     --api-addr :8081 \
     --target-base-url http://localhost:3000 \
     --db-path ./data/meo.db
   ```

3. **Point your client to MEO**

   Instead of calling `http://localhost:3000`, call:

   ```text
   http://localhost:8080
   ```

4. **Run the frontend**

   ```bash
   cd front
   npm install
   VITE_MEO_API_URL=http://localhost:8081 npm run dev
   ```

   Open the URL printed by Vite (for example `http://localhost:5173`).

---

## Project structure

- `back/` – Go backend (proxy, storage, control API, SSE)
- `front/` – React frontend (Vite + TypeScript)
