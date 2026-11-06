# FinTech

FinTech is a personal finance application organized as a frontend/backend
monorepo.

## Project structure

```text
backend/    Spring Boot REST API and Maven build
frontend/   React application built with Vite
```

## Prerequisites

- Java 21
- Node.js and npm
- PostgreSQL

## Run locally

### Backend

Create a PostgreSQL database named `moneyos_db`, then configure the connection
in `backend/src/main/resources/application.properties` for your local
environment. Provide a strong JWT signing secret using `MONEYOS_JWT_SECRET`.

From the repository root in PowerShell:

```powershell
Set-Location backend
$env:MONEYOS_JWT_SECRET = "replace-with-a-local-secret"
.\mvnw.cmd spring-boot:run
```

The API listens on `http://localhost:8080`.

### Frontend

In a separate terminal, from the repository root:

```powershell
Set-Location frontend
npm install
npm run dev
```

The Vite development server listens on `http://localhost:5173` and proxies
`/api` requests to the backend.

## Tests and production build

Run backend tests:

```powershell
Set-Location backend
.\mvnw.cmd test
```

Build the frontend:

```powershell
Set-Location frontend
npm run build
```
