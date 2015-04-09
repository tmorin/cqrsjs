require('es6-shim');

require('./lib/domain/boards.handlers');
require('./lib/domain/boards.repo.local');
require('./lib/domain/cards.handlers');
require('./lib/domain/cards.repo.local');
require('./lib/domain/columns.handlers');
require('./lib/domain/columns.repo.local');
require('./lib/domain/members.handlers');
require('./lib/domain/members.repo.local');
require('./lib/domain/persons.handlers');
require('./lib/domain/persons.repo.local');
require('./lib/domain/rights.handlers');
require('./lib/domain/rights.repo.local');
require('./lib/domain/rooms.handlers');
require('./lib/domain/rooms.repo.local');
require('./lib/domain/teams.handlers');
require('./lib/domain/teams.repo.local');

var server = require('./lib/server');
require('./lib/api/persons');

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});