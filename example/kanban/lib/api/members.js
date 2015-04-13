var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/members', function(req, res, next) {
    c.send('add-member', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/members', function(req, res, next) {
    c.send('remove-member', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
