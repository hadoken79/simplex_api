const express = require('express'),
    expressHandlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    routing = require('./routes'),
    session = require('express-session'),
    path = require('path'),
    webSocketServer = require('ws').Server,
    helmet = require('helmet'),
    rateLimit = require('express-rate-limit');

require('dotenv').config();

const port = process.env.PORT;
const server = express();

//Grundlegender http-Headerschutz
server.use(helmet());

//<--Beispiel einer Custom Middleware, die sich in den Request/Response Ablauf hängt.
const loggerMiddleware = (req, res, next) => {
    console.log(
        Date(Date.now()) +
            ' |  Requested ' +
            req.url +
            ' from ' +
            req.connection.remoteAddress
    );
    next();
};
//-->
/*
const sessionToLocalsCopy = (req, res, next) => {
    res.locals.isLoggedIn = req.session && req.session.isLoggedIn;
    next();
}
*/
//Bruteforce Schutz für Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuten
    max: 100,
});

server.use(
    session({
        secret: process.env.SESSION_SECRET || 'SSSSssssshhhhhhh!',
        saveUninitialized: true,
        resave: false,
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 0,
    })
);

//server.use(sessionToLocalsCopy);
server.use(express.static(path.join(__dirname, 'public'))); //für statische Dateien die zum browser ausgeliefert werden sollen, css/js/img prefix public im Pfad weg lassen
server.use(express.static(path.join(__dirname, 'node_modules'))); // für css/js in modules
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use('/login', loginLimiter);
server.use('/', routing);
server.use(loggerMiddleware);

//Definitionen für Template Engine. Auf diese Pfade greifen die Controller zu.
server.set('viewDir', path.join(__dirname, 'views'));
server.set('view engine', 'html');

//Template Engine
server.engine(
    'html',
    expressHandlebars({
        defaultLayout: false,
        extname: 'html',
        partialsDir: 'views/partials',
        helpers: require('./handlebars-helpers'), //damit Helpers auch mit express-handlebars funktionieren
    })
);

server.listen(port, () => {
    console.log('Server now listening at containerPort ' + port);
});

let wss = new webSocketServer({ port: 8080 });
//wss.setMaxListeners(1000);

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
    });

    module.exports.sendMsg = (msg) => {
        ws.send(msg);
    };
});
