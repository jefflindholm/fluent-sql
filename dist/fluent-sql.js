'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDefaultOptions = exports.setDefaultOptions = exports.SqlQuery = exports.SqlWhere = exports.SqlTable = exports.SqlOrder = exports.SqlJoin = exports.SqlColumn = exports.SqlBuilder = undefined;

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
Object.defineProperty(exports, 'setDefaultOptions', {
    enumerable: true,
    get: function get() {
        return _sqlQuery.setDefaultOptions;
    }
});
Object.defineProperty(exports, 'getDefaultOptions', {
    enumerable: true,
    get: function get() {
        return _sqlQuery.getDefaultOptions;
    }
});

require('./string.js');

var _sqlQuery2 = _interopRequireDefault(_sqlQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
    if (!String.prototype.sqlEscape) {
        var sqlEscape = function escape(sqlQuery, level) {
            var query = null;
            if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== 'function') {
                query = new _sqlQuery2.default();
            } else {
                query = sqlQuery;
            }
            return query.sqlEscape(this, level);
        };
        String.prototype.sqlEscape = sqlEscape; // eslint-disable-line no-extend-native
    }
})();