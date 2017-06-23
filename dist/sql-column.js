'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./string.js');

var _sqlOrder = require('./sql-order');

var _sqlOrder2 = _interopRequireDefault(_sqlOrder);

var _sqlTable = require('./sql-table');

var _sqlTable2 = _interopRequireDefault(_sqlTable);

var _sqlWhere = require('./sql-where');

var _sqlWhere2 = _interopRequireDefault(_sqlWhere);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlAggregate = function () {
    function SqlAggregate(table, column, operation) {
        _classCallCheck(this, SqlAggregate);

        this.table = table;
        this.column = column;
        this.operation = operation;
        this.column.Alias = (this.column.Alias || this.column.ColumnName) + '_' + operation.toLowerCase();
    }

    _createClass(SqlAggregate, [{
        key: 'on',
        value: function on(sqlColumn) {
            this.groupBy = sqlColumn;
            return this.column;
        }
    }, {
        key: 'by',
        value: function by(sqlColumn) {
            return this.on(sqlColumn);
        }
    }]);

    return SqlAggregate;
}();

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
            this.Aggregate = sqlObject.Aggregate;
            this._grouped = sqlObject._grouped;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof _sqlTable2.default)) {
            throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' }; // eslint-disable-line no-throw-literal
        } else {
            this.Table = sqlObject;
            this.ColumnName = columnName;
            this.Literal = literal;
            this.Alias = columnName ? columnName.toCamel() : undefined; // eslint-disable-line no-undefined
        }
    }
    // aggregate functions


    _createClass(SqlColumn, [{
        key: 'aggregate',
        value: function aggregate(op) {
            var column = new SqlColumn(this);
            column.Aggregate = new SqlAggregate(column.table, column, op);
            return column.Aggregate;
        }
    }, {
        key: 'avg',
        value: function avg() {
            return this.aggregate('AVG');
        }
    }, {
        key: 'checksum',
        value: function checksum() {
            return this.aggregate('CHECKSUM_AGG');
        }
    }, {
        key: 'count',
        value: function count() {
            return this.aggregate('COUNT');
        }
    }, {
        key: 'countBig',
        value: function countBig() {
            return this.aggregate('COUNT_BIG');
        }
    }, {
        key: 'grouping',
        value: function grouping() {
            return this.aggregate('GROUPING');
        }
    }, {
        key: 'groupingId',
        value: function groupingId() {
            return this.aggregate('GROUPING_ID');
        }
    }, {
        key: 'max',
        value: function max() {
            return this.aggregate('MAX');
        }
    }, {
        key: 'min',
        value: function min() {
            return this.aggregate('MIN');
        }
    }, {
        key: 'sum',
        value: function sum() {
            return this.aggregate('SUM');
        }
    }, {
        key: 'stdev',
        value: function stdev() {
            return this.aggregate('STDEV');
        }
    }, {
        key: 'stdevp',
        value: function stdevp() {
            return this.aggregate('STDEVP');
        }
        // VAR

    }, {
        key: 'varp',
        value: function varp() {
            return this.aggregate('VARP');
        }
    }, {
        key: 'qualifiedName',
        value: function qualifiedName(sqlQuery) {
            return this.Literal || this.Table.Alias.sqlEscape(sqlQuery, 'table-alias') + '.' + this.ColumnName;
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
        key: 'starts',
        value: function starts(val) {
            var value = val;
            if (typeof value === 'string') {
                value = value + '%';
            }
            return new _sqlWhere2.default({ Column: this, Op: 'like', Value: value });
        }
    }, {
        key: 'ends',
        value: function ends(val) {
            var value = val;
            if (typeof value === 'string') {
                value = '%' + value;
            }
            return new _sqlWhere2.default({ Column: this, Op: 'like', Value: value });
        }
    }, {
        key: 'in',
        value: function _in() {
            var values = [];

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _helpers.processArgs.apply(undefined, [function (v) {
                values.push(v);
            }].concat(args)); // eslint-disable-line brace-style
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
            var o = _op;
            if (!this[o]) {
                o = o.toLowerCase();
            }
            return this[o](val1, val2);
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