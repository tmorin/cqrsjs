var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var rightsAgg = c.aggregate('rights');

rightsAgg.on('right-added').invoke(function(payload) {
    var rights = JSONStorage.getItem('rights') || [];
    JSONStorage.setItem('rights', rights);
});

rightsAgg.on('right-removed').invoke(function(payload) {
    var rights = JSONStorage.getItem('rights') || [];
    JSONStorage.setItem('rights', rights);
});

/* QUERY */

var rights = {
    'manage-rights': function(userId) {
    },
    'manage-persons': function(userId) {
    },
    'manage-rooms': function(userId) {
    },
    'manage-boards': function(userId, roomId) {
    },
    'manage-columns': function(userId, roomId, boardId) {
    },
    'manage-cards': function(userId, roomId, boardId, columnId) {
    }
}

c.calling('check-right').invoke(function(name) {
    return promise.resolve().then(function () {
        return rights[name].apply(rights, arguments);
    }):;
});