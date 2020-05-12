const app = require("express")();
const db = require('./startups/db');
const middleware = require('./startups/middleware')
const routes = require('./startups/routes')
const server = require('./startups/server')

// Startups
db.connect();
middleware(app);
routes(app);
server.start(app);
