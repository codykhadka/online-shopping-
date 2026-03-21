# Danphe Organic - Full Stack Project

This project has been separated into a **Frontend** (React + Vite) and a **Backend** (Node.js + Express).

## Project Structure

- `/frontend`: The user interface and client-side logic.
- `/backend`: The server-side API, handling authentication, products, and orders.

## How to Run the Project

### 1. Start the Backend
Open a new terminal and run:
```bash
cd backend
npm install (if not already done)
node index.js
```
The server will start on `http://localhost:5000`.

### 2. Start the Frontend
Open another terminal and run:
```bash
cd frontend
npm install (if not already done)
npm run dev
```
The app will be available at the URL shown in your terminal (usually `http://localhost:5173`).

## Key Changes
- **API Communication**: The frontend now uses `fetch` to talk to the backend instead of relying solely on `localStorage`.
- **Persistent Data (Simulated)**: The backend manages users and orders in memory. (Note: Restarting the backend will reset this data until a real database is added).
