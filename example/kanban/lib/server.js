var passport = require('passport');
var restify = require('restify');
var http = restify.createServer();
var io = require('socket.io')(http);
require('./auth');

http.use(restify.CORS());
http.use(restify.queryParser());
http.use(restify.bodyParser());
http.use(passport.initialize());
http.use(passport.session());

http.post('/login', passport.authenticate('basic'), function (req, res) {
    res.send(200);
});

http.get('/logout', function(req, res){
    req.logout();
    res.send(200);
  });

module.exports.http = http;
module.exports.io = io;
