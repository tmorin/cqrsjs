var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/members', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-member', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/members', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-member', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
