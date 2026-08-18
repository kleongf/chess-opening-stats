# Chess Opening Stats

A full-stack opening explorer for Chess.com games. Enter a username and date range to group games by ECO code, compare results as White and Black, estimate average-opponent and performance ratings, and replay individual games on an interactive board.

## How it works

- The Express backend downloads monthly archives from the public Chess.com API and maps ECO codes with `backend/eco.json`.
- The React frontend displays per-opening wins, draws, losses, score percentage, opponent rating, and performance rating.
- Selecting a game opens a move-by-move board powered by `chess.js` and `chessboardjsx`.

## Run locally

Node.js 18 or newer is required because the backend uses the built-in `fetch` API.

1. Start the API:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open the Vite URL, normally [http://localhost:5173](http://localhost:5173). The API listens on port `5000`.

The frontend sends dates as `YYYY-MM-DD`; the backend uses the year and month portions to request Chess.com monthly archives. The current API route is `GET /:username/:startDate/:endDate`.

## Status

This is an experimental local application. The frontend is hard-coded to `http://localhost:5000`, and the repository currently tracks installed backend dependencies, so a fresh `npm install` is still recommended.
