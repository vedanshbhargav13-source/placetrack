# Day 1 - Setup, Terminal, Git/GitHub, Product Scope

## Learned

- Terminal basics
- Git and GitHub
- Project scope
- Entities
- User flows

## Confused me

- 

## Bugs fixed

- 

## Day 2

HTTP is the communication protocol between the client and server.
The client sends a request and the server processes it and sends a response.
The client in PlaceTrack is React and the server is Express.
A request contains method, URL, headers and sometimes a body, while the response contains status, headers and body.
An API endpoint like `/api/applications` is a specific address through which React communicates with the Express server.

-
## Day 2 — Backend Basics

### What I learned
- Learned how client and server communicate using HTTP.
- Learned JSON and how it is used to send data between frontend and backend.
- Learned Node.js, npm, Express, localhost and ports.
- Built my first Express server with `GET /api/health`.
- Learned how `.env` and `dotenv` are used for configuration.
- Tested the API in Chrome, Thunder Client and Chrome DevTools.
- Learned the difference between 200, 404 and connection errors.

### What confused me
- Understanding the difference between Node.js and Express.
- Understanding how `.env` values reach `process.env`.
- Understanding the difference between a wrong route and a wrong port.

### What I did today
Built and tested the first PlaceTrack backend API and pushed the Day 2 server setup to GitHub.

### Tomorrow
Continue building the PlaceTrack backend and learn the next concepts from the roadmap.
- 

## Day 6 — PostgreSQL Database Integration

### Learned
- Understood PostgreSQL, SQL, and database tables.
- Learned CRUD operations: Create, Read, Update, and Delete.
- Connected the Node.js/Express backend to Neon PostgreSQL using the `pg` package.
- Used parameterized SQL queries to interact with the database.
- Tested API endpoints using Postman.

### Implemented
- Created the companies table in PostgreSQL.
- Added company fields: name, website, location, notes, role, status, and created_at.
- Connected the companies controller to PostgreSQL.
- Implemented database-backed GET, POST, PUT, and DELETE operations.
- Verified API responses using Postman.

### Bugs Fixed
- Configured environment variables using `import "dotenv/config"` for ES modules.
- Resolved database connection and schema issues.

### Tomorrow
- Continue improving and testing the PlaceTrack backend.
