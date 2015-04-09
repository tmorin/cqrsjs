var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('columns')) || {};
}

function persistData(columns) {
    storage.setItem('columns', JSON.stringify(columns));
}

var columnsAgg = c.aggregate('columns');

columnsAgg.on('column-added').invoke(function(payload) {
    var columns = loadData();
    columns[payload.columnId] = payload;
    persistData(columns);
});

columnsAgg.on('column-details-updated').invoke(function(payload) {
    var columns = loadData();
    columns[payload.columnId].name = payload.name;
    columns[payload.columnId].maxCards = payload.maxCards;
    persistData(columns);
});

columnsAgg.on('column-removed').invoke(function(payload) {
    var columns = loadData();
    delete columns[payload.columnId];
    persistData(columns);
});

columnsAgg.on('columns-order-updated').invoke(function(payload) {
    var columns = loadData();
    payload.columns.forEach(function (column) {
        columns[column.columnId].order = column.order;
    });
    persistData(columns);
});

/* QUERIES */

c.calling('get-column').invoke(function(roomId, boardId, columnId) {
    return Promise.resolve().then(function() {
        var columns = loadData();
        var column = columns[columnId];
        if (!column) {
            throw new Error('unable to find the column: ' + columnId);
        }
        return column;
    });
});

c.calling('list-columns-from-board').invoke(function(roomId, boardId) {
    return Promise.resolve().then(function() {
        var columns = loadData();
        return Object.keys(columns).map(function(key) {
            return columns[key];
        }).filter(function(column) {
            return column.roomId === roomId && column.boardId === boardId;
        }).sort(function (a, b) {
            return a.order - b.order;
        });
    });
});
