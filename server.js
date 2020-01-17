const
    express = require('express'),
    expressHandlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    routing = require('./routes'),
    session = require('express-session'),
    path = require('path');

require('dotenv').config();

const port = process.env.PORT;
const server = express();

//<--Beispiel einer Custom Middleware, die sich in den Request/Response Ablauf hängt.
const loggerMiddleware = (req, res, next) => {
    console.log(Date(Date.now()) + ' |  Requested ' + req.url + ' from ' + req.server);
    next();
}
//-->

server.use(session({
    secret: process.env.SESSION_SECRET || 'sEt_seSSI0n_SecRET_NoW!',
    saveUninitialized: true,
    resave: false
}));
server.use(express.static(path.join(__dirname, 'public'))); //für statische dateien die an die browser ausgeliefert werden sollen, css/js/img prefix public im Pfad weg lassen
server.use(express.static(path.join(__dirname, 'node_modules'))); // für css in modules
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.use('/', routing);
server.use(loggerMiddleware);
server.set('viewDir', path.join(__dirname,'views'));
server.set('view engine', 'html');

server.engine('html', expressHandlebars({
    defaultLayout: false,
    extname: 'html',
    partialsDir: 'views/partials'
}));

server.listen(port, () => {
    console.log('Express listening at port ' + port);
});