const app = require("express")();
const db = require('./startups/db');
const middleware = require('./startups/middleware')
const prodMiddleware = require('./startups/prodMiddleware')
const routes = require('./startups/routes')
const server = require('./startups/server')

// Startups
db.connect();
middleware(app);
routes(app);
prodMiddleware(app)
server.start(app);
