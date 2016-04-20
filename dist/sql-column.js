'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./string.js');

var _sliced = require('sliced');

var _sliced2 = _interopRequireDefault(_sliced);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _sprintfJs = require('sprintf-js');

var _sqlJoin = require('./sql-join');

var _sqlJoin2 = _interopRequireDefault(_sqlJoin);

var _sqlOrder = require('./sql-order');

var _sqlOrder2 = _interopRequireDefault(_sqlOrder);

var _sqlQuery = require('./sql-query');

var _sqlQuery2 = _interopRequireDefault(_sqlQuery);

var _sqlTable = require('./sql-table');

var _sqlTable2 = _interopRequireDefault(_sqlTable);

var _sqlWhere = require('./sql-where');

var _sqlWhere2 = _interopRequireDefault(_sqlWhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlColumn = function () {
    function SqlColumn(sqlObject, columnName, literal) {
        _classCallCheck(this, SqlColumn);

        if (!new.target) {
            return new SqlColumn(sqlObject, columnName, literal);
        }
        if (sqlObject instanceof SqlColumn) {
            this.Table = sqlObject.Table;
            this.ColumnName = sqlObject.ColumnName;
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
            this.Not = sqlObject.Not;
            this.Values = sqlObject.Values;
            this._grouped = sqlObject._grouped;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof _sqlTable2.default)) {
            throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' };
        } else {
            this.Table = sqlObject;
            this.ColumnName = columnName;
            this.Literal = literal;
            this.Alias = columnName ? columnName.toCamel() : undefined;
        }
    }

    _createClass(SqlColumn, [{
        key: 'qualifiedName',
        value: function qualifiedName(sqlQuery) {
            return this.Literal || (0, _sprintfJs.sprintf)('%s.%s', this.Table.Alias.sqlEscape(sqlQuery, 'table-alias'), this.ColumnName);
        }
    }, {
        key: 'as',
        value: function as(alias) {
            var col = new SqlColumn(this);
            col.Alias = alias;
            return col;
        }
    }, {
        key: 'using',
        value: function using(values) {
            var col = new SqlColumn(this);
            col.Values = values;
            return col;
        }
    }, {
        key: 'groupBy',
        value: function groupBy() {
            var col = new SqlColumn(this);
            col._grouped = true;
            return col;
        }
    }, {
        key: 'eq',
        value: function eq(val) {
            return new _sqlWhere2.default({ Column: this, Op: '=', Value: val });
        }
    }, {
        key: 'ne',
        value: function ne(val) {
            return new _sqlWhere2.default({ Column: this, Op: '<>', Value: val });
        }
    }, {
        key: 'gt',
        value: function gt(val) {
            return new _sqlWhere2.default({ Column: this, Op: '>', Value: val });
        }
    }, {
        key: 'gte',
        value: function gte(val) {
            return new _sqlWhere2.default({ Column: this, Op: '>=', Value: val });
        }
    }, {
        key: 'lt',
        value: function lt(val) {
            return new _sqlWhere2.default({ Column: this, Op: '<', Value: val });
        }
    }, {
        key: 'isNull',
        value: function isNull() {
            return new _sqlWhere2.default({ Column: this, Op: 'IS NULL' });
        }
    }, {
        key: 'isNotNull',
        value: function isNotNull() {
            return new _sqlWhere2.default({ Column: this, Op: 'IS NOT NULL' });
        }
    }, {
        key: 'lte',
        value: function lte(val) {
            return new _sqlWhere2.default({ Column: this, Op: '<=', Value: val });
        }
    }, {
        key: 'like',
        value: function like(val) {
            var value = val;
            if (typeof value === 'string') {
                value = '%' + value + '%';
            }
            return new _sqlWhere2.default({ Column: this, Op: 'like', Value: value });
        }
    }, {
        key: 'in',
        value: function _in() {
            var values = [];
            (0, _sliced2.default)(arguments).reduce(function (cur, next) {
                if (_util2.default.isArray(next)) {
                    next.forEach(function (c) {
                        cur.push(c);
                    });
                } else {
                    cur.push(next);
                }
                return cur;
            }, values);
            return new _sqlWhere2.default({ Column: this, Op: 'in', Value: values });
        }
    }, {
        key: 'between',
        value: function between(val1, val2) {
            return this.gte(val1).and(this.lte(val2));
        }
    }, {
        key: 'op',
        value: function op(_op, val1, val2) {
            if (!this[_op]) {
                _op = _op.toLowerCase();
            }
            return this[_op](val1, val2);
        }
    }, {
        key: 'asc',
        value: function asc() {
            return new _sqlOrder2.default(this, 'ASC');
        }
    }, {
        key: 'desc',
        value: function desc() {
            return new _sqlOrder2.default(this, 'DESC');
        }
    }, {
        key: 'direction',
        value: function direction(dir) {
            return new _sqlOrder2.default(this, dir);
        }
    }, {
        key: 'dir',
        value: function dir(_dir) {
            return new _sqlOrder2.default(this, _dir);
        }
    }, {
        key: 'not',
        value: function not() {
            var col = new SqlColumn(this);
            col.Not = true;
            return col;
        }
    }, {
        key: 'Table',
        get: function get() {
            return this._table;
        },
        set: function set(v) {
            this._table = v;
        }
    }, {
        key: 'ColumnName',
        get: function get() {
            return this._columnName;
        },
        set: function set(v) {
            this._columnName = v;
        }
    }, {
        key: 'Literal',
        get: function get() {
            return this._literal;
        },
        set: function set(v) {
            this._literal = v;
        }
    }, {
        key: 'Alias',
        get: function get() {
            return this._alias;
        },
        set: function set(v) {
            this._alias = v;
        }
    }, {
        key: 'Not',
        get: function get() {
            return this._not;
        },
        set: function set(v) {
            this._not = v;
        }
    }, {
        key: 'Values',
        get: function get() {
            return this._values;
        },
        set: function set(v) {
            this._values = v;
        }
    }, {
        key: 'Grouped',
        get: function get() {
            return this._grouped;
        },
        set: function set(v) {
            this._grouped = v;
        }
    }]);

    return SqlColumn;
}();

exports.default = SqlColumn;