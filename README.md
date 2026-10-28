# CUNY-Connect

CUNY-Connect is one place to find events and clubs across all CUNY campuses.

Students can browse events by campus, date, and category. They can save events and follow clubs. Club officers manage their club and its events. Admins approve new clubs.

The app uses the MERN stack: MongoDB, Express, React with Vite, and Node.

## Team

- Abinash Baruwal
- Kenneth Gonzalez
- Francisco Rodriguez
- Saba Chechelashvilli

Roles are not assigned yet. Add each name to the ownership list below once they are.

## Who owns what

Every file starts with a comment that says what it is for, who owns it, and what is left to build. Work on your own files. Talk to the owner before changing someone else's.

- Person 1: auth and setup (Francisco Rodriguez): register, login, and me routes, PATCH /api/users/me, auth and error middleware, AuthContext, Login, Signup, Profile, and 404 pages, validation, deployment
- Person 2: events and clubs API (Kenneth Gonzalez): Club and Event models, event, club, and admin routes, feed filters, ClubProfile and AdminClubs pages
- Person 3: feed UI (Saba Chechelashvili): layout, Navbar, styles, EventCard, Feed and EventDetail pages, loading and empty states
- Person 4: dashboards and officer tools (Abinash Baruwal): save and follow routes, dashboard route, Dashboard, OfficerDashboard, and ClubEditor pages, seed script, README

## Setup

You need Node.js 20 or newer and npm.

1. Clone the repo and move into it.

   ```bash
   git clone <repo-url>
   cd CUNY-Connect
   ```

2. Install everything for the root, server, and client.

   ```bash
   npm run install-all
   ```

3. Create your env files from the examples.

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. Fill in server/.env. Get the real MONGO_URI from the team privately. Never commit .env files or paste the URI in issues or PRs.

   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cuny-connect
   JWT_SECRET=change-me-to-a-long-random-string
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

   client/.env only needs one line, and the example already has it.

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the server and client together.

   ```bash
   npm run dev
   ```

The client runs at http://localhost:5173. The API runs at http://localhost:5000/api. To check that the API is up, open http://localhost:5000/api/health.

The server still starts without a real MONGO_URI. It logs a warning and skips the database.

## Troubleshooting

- Port 5000 is already in use: On macOS, AirPlay Receiver often uses port 5000. Turn it off in System Settings, under General, then AirDrop and Handoff. Or set PORT=5001 in server/.env and change VITE_API_URL in client/.env to http://localhost:5001/api.
- npm warns about bcrypt install scripts: npm 11 and newer may say it skipped bcrypt's install script. You can ignore it. bcrypt ships prebuilt binaries for macOS, Windows, and Linux.

## Project layout

- server/index.js starts Express, connects to MongoDB, and mounts the routes.
- server/config has the database connection.
- server/models has the User, Club, and Event models.
- server/middleware has the auth checks and the error handler.
- server/routes has one file each for auth, users, events, clubs, and admin.
- server/seed has the demo data script. Run it with npm run seed from server/.
- server/utils has the placeholder handler that returns 501.
- client/src/main.jsx starts React with the router and AuthProvider.
- client/src/App.jsx lists every page route.
- client/src/api has the shared axios client.
- client/src/context has AuthContext.
- client/src/components has Navbar, EventCard, and ProtectedRoute.
- client/src/pages has one file per page.
- client/src/styles has variables.css, where the style guide lives, and global.css.

## API routes

All routes start with /api. Routes that are not built yet return 501 Not Implemented.

## Health (Person 1)

- GET /api/health returns { status: "ok" }.

## Auth (Person 1)

- POST /api/auth/register creates an account.
- POST /api/auth/login logs in and returns a token.
- GET /api/auth/me returns the logged-in user. Needs a login.

## Users (Person 1 and Person 4)

Every user route needs a login.

- PATCH /api/users/me updates your profile. Person 1.
- POST /api/users/me/saved/:eventId saves an event. Person 4.
- DELETE /api/users/me/saved/:eventId unsaves an event. Person 4.
- POST /api/users/me/following/:clubId follows a club. Person 4.
- DELETE /api/users/me/following/:clubId unfollows a club. Person 4.
- GET /api/users/me/dashboard returns your saved events and events from clubs you follow. Person 4.

## Events (Person 2)

- GET /api/events lists events. It accepts campus, date, and category in the query string.
- GET /api/events/:id returns one event.
- POST /api/events creates an event. Only officers of the host club.
- PATCH /api/events/:id updates an event. Only officers of the host club.
- DELETE /api/events/:id deletes an event. Only officers of the host club.

## Clubs (Person 2)

- GET /api/clubs lists approved clubs.
- GET /api/clubs/:id returns one club.
- POST /api/clubs requests a new club. Needs a login.
- PATCH /api/clubs/:id updates a club. Only that club's officers.

## Admin (Person 2)

Every admin route needs an admin account.

- GET /api/admin/clubs/pending lists clubs waiting for approval.
- PATCH /api/admin/clubs/:id/approve approves a club.

## Pages

- / is the Feed page. Person 3.
- /events/:id is the EventDetail page. Person 3.
- /clubs/:id is the ClubProfile page. Person 2.
- /admin is the AdminClubs page. Person 2.
- /login is the Login page. Person 1.
- /signup is the Signup page. Person 1.
- /profile is the Profile page. Person 1.
- /dashboard is the Dashboard page. Person 4.
- /officer is the OfficerDashboard page. Person 4.
- /officer/club is the ClubEditor page. Person 4.
- Any other URL shows the NotFound page. Person 1.

## Workflow rules

Grading is based on individual commits, so follow these every time.

- Never push to main.
- Make one branch per task, named like p2-event-routes.
- Open a PR that references its issue, for example Closes #12. The PR template walks you through it.
- Someone else reviews your PR before it is merged. Do not merge your own.
- Commit small and often, with clear messages.
- Pull main into your branch before opening a PR, so you fix conflicts on your side.
