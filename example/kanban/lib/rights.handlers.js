var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var rightsAgg = c.aggregate('rights');
