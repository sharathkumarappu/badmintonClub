# Badminton Club - Express Sample App

Simple Express.js sample application for managing a badminton club — members, club info and simple views rendered with EJS.

**Status:** Example / learning project

**Tech stack:** Node.js, Express, EJS

**Quick Summary**
- **Purpose:** Demonstrates a minimal Express app using EJS templates to list and view club members and club information stored in JSON.

**Prerequisites**
- **Node.js:** v16+ recommended (install from https://nodejs.org/)
- **npm:** bundled with Node.js

**Install**
Open a terminal in the project root (`README.md` is in the repository root) and run:

```bat
npm install
```

**Run**
Start the app with:

```bat
npm start
# or explicitly: node ./bin/www
```

The app uses the default port configured by the generated `bin/www` script (commonly `3000`). Open `http://localhost:3000/` in your browser.

**Project Structure**
- **`app.js`**: Express app configuration and middleware.
- **`bin/www`**: Server bootstrap script used by the `start` script.
- **`routes/index.js`**: Route handlers (home page, member pages).
- **`views/`**: EJS templates used to render pages (`index.ejs`, `member-registration.ejs`, `single-member.ejs`, etc.).
- **`public/`**: Static assets (stylesheets, client JS, images).
- **`data/clubinfo.json`**: Sample data (club info and members) used by the app.

**How It Works (quick)**
- The app reads club/member data from `data/clubinfo.json` and renders pages with EJS templates found in `views/`.
- The home route (`/`) serves the main listing. A registration view is available at the route that renders `member-registration.ejs` (see `routes/index.js`).

**Notes & Tips**
- If you change port configuration, check `bin/www` for how the port is set.
- To add members, update `data/clubinfo.json` or wire a persistence layer (database) and update the routing logic.
- This project uses `helmet` and `morgan` for basic security and logging; adjust or extend middleware in `app.js` as needed.

**Troubleshooting**
- If `npm start` fails with an error about missing modules, run `npm install` again.
- If the server starts but you see a blank page, check the console for template rendering errors and inspect `data/clubinfo.json` for valid JSON.

**Contributing**
- This is intended as a small sample; feel free to open PRs to improve docs, add tests, or add features (search, persistent storage).
