var restify = require('restify');

require('../../../lib/cqrs').debug = true;

var server = restify.createServer();

server.use(restify.CORS());
server.use(restify.queryParser({
    mapParams: false
}));
server.use(restify.bodyParser());

module.exports = server;
