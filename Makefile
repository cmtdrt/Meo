run-back:
	cd back && go run ./cmd/meo \
  --proxy-addr :8082 \
  --api-addr :8083 \
  --target-base-url http://localhost:8080 \
  --db-path ./meo.db

run-front:
	cd front && VITE_MEO_API_URL=http://localhost:8083 npm run dev

del-db:
	cd back && sqlite3 meo.db 'DELETE FROM exchanges;'