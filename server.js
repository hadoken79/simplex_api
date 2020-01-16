const
    express = require('express'),
    expressHandlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    routing = require('./routes'),
    session = require('express-session');

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
server.use(express.static('public')); //bei dateiaufruf in html datei, darf der Public ordner nicht angegeben werden zb. /css/style.css obwohl die datei in public liegt
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.use('/', routing);
server.use(loggerMiddleware);
server.set('viewDir', 'views');
server.set('view engine', 'html');

server.engine('html', expressHandlebars({
    defaultLayout: false,
    extname: 'html',
    partialsDir: 'views/partials'
}));

server.listen(port, () => {
    console.log('Express listening at port ' + port);
});