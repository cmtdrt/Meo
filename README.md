# MEO

MEO is a tool that sits as a reverse proxy in front of your HTTP API.  
It captures every request/response, stores it in SQLite, and exposes a web UI to inspect and replay traffic.

<table>
<tr>
<td width="50%">

**Track incoming requests in real time**

<img src="https://github.com/user-attachments/assets/52803c9f-f5be-4163-9cfc-25f2419fe12d" />

</td>
<td width="50%">

**Inspect full request and response details**

<img src="https://github.com/user-attachments/assets/12ac2b9d-085f-4a74-a1a9-887dcd0c7496" />


</td>
</tr>

<tr>
<td width="50%">

**Replay requests and compare responses**

<img src="https://github.com/user-attachments/assets/5db72866-986b-48df-8e35-eedf4a00e570" />

</td>
<td width="50%">

**Filter by HTTP method, timestamp, and sort results**

<img src="https://github.com/user-attachments/assets/6d569dcb-bab7-4483-a1b2-6fd055997ed0" />

</td>
</tr>
</table>

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
   npm run dev
   ```

   Open the URL printed by Vite (for example `http://localhost:5173`).
