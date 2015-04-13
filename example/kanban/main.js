require('es6-shim');

require('./lib/domain');

var server = require('./lib/server');

require('./lib/api');

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});