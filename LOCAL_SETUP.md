# MemoryMate Local Links

Use these while developing locally:

```text
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
Backend health check: http://localhost:5000/api/health
MongoDB Compass: mongodb://127.0.0.1:27017/memorymate
```

## Run Order

1. Start MongoDB Community Server.
2. Start backend:

```bash
cd backend
npm run dev
```

3. Start frontend:

```bash
cd frontend
npm run dev
```

The frontend uses this backend URL from `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

The backend uses this database URL from `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/memorymate
```

MongoDB Compass should connect with:

```text
mongodb://127.0.0.1:27017
```

After the backend writes data, Compass will show the `memorymate` database.

## MongoDB Compass Note

MongoDB Compass is only the database viewer. It does not start or host MongoDB by itself.

If Compass shows `ECONNREFUSED 127.0.0.1:27017`, it usually means MongoDB Community Server is not installed or not running.

Quick Windows checks:

```powershell
Get-Service | Where-Object { $_.Name -like '*mongo*' -or $_.DisplayName -like '*mongo*' }
Test-NetConnection 127.0.0.1 -Port 27017
Get-Command mongod -ErrorAction SilentlyContinue
```

Expected working result:

```text
TcpTestSucceeded : True
```

If `TcpTestSucceeded` is `False`, install/start MongoDB Community Server, then reconnect Compass to:

```text
mongodb://127.0.0.1:27017
```
