var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

var cqrs = require('../../../lib/cqrs');
var c = cqrs();

passport.use(new BasicStrategy(function(username, password, done) {
    return c.call('get-person', username).then(function(person) {
        done(null, person);
    }, function() {
        done(null, false);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.personId);
});

passport.deserializeUser(function(id, done) {
    return c.call('get-person', id).then(function(person) {
        done(null, person);
    }, function(error) {
        done(error);
    });
});