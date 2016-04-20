"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SqlQuery = exports.SqlWhere = exports.SqlTable = exports.SqlOrder = exports.SqlJoin = exports.SqlColumn = exports.SqlBuilder = undefined;

var _sqlBuilder = require('./sql-builder');

Object.defineProperty(exports, 'SqlBuilder', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlBuilder).default;
    }
});

var _sqlColumn = require('./sql-column');

Object.defineProperty(exports, 'SqlColumn', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlColumn).default;
    }
});

var _sqlJoin = require('./sql-join');

Object.defineProperty(exports, 'SqlJoin', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlJoin).default;
    }
});

var _sqlOrder = require('./sql-order');

Object.defineProperty(exports, 'SqlOrder', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlOrder).default;
    }
});

var _sqlTable = require('./sql-table');

Object.defineProperty(exports, 'SqlTable', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlTable).default;
    }
});

var _sqlWhere = require('./sql-where');

Object.defineProperty(exports, 'SqlWhere', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlWhere).default;
    }
});

var _sqlQuery = require('./sql-query');

Object.defineProperty(exports, 'SqlQuery', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_sqlQuery).default;
    }
});

require('./string.js');

var _sliced = require('sliced');

var _sliced2 = _interopRequireDefault(_sliced);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _sprintfJs = require('sprintf-js');

var _sqlQuery2 = _interopRequireDefault(_sqlQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!String.prototype.sqlEscape) {
    (function () {
        'use strict';

        var sqlEscape = function sqlEscape(sqlQuery, level) {

            if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== "function") {
                sqlQuery = new _sqlQuery2.default();
            }
            return sqlQuery.sqlEscape(this, level);
        };
        String.prototype.sqlEscape = sqlEscape;
    })();
}