require('es6-shim');

require('./lib/domain');

var http = require('../server').http;

require('./lib/api');

http.listen(8080, function() {
    console.log('%s listening at %s', http.name, http.url);
});