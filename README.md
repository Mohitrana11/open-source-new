# NextStep — Node.js (ES Modules) Starter

This project is scaffolded to use Node.js with ES modules (the `import` keyword).

Quick start

1. Install dependencies

   npm install

2. Copy `.env.example` to `.env` and edit if needed

   cp .env.example .env

3. Run in development (auto-restarts with nodemon)

   npm run dev

4. Open http://localhost:3000/ and http://localhost:3000/api/ping

Project layout

- `package.json` — project manifest with `type: module` to enable `import` syntax
- `src/index.js` — application entry
- `src/routes/example.js` — example router
- `.env.example` — example env variables

Notes

- The project uses ES modules via `"type": "module"` in `package.json`. Use `import` / `export` in `.js` files.
- `.gitignore` contains `node_modules/` and `.env` entries.

If you'd like, I can:

- add ESLint + prettier configuration for consistent style
- add tests (Jest or vitest)
- wire up GitHub Actions CI
