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

var _sqlColumn = require('./sql-column');

var _sqlColumn2 = _interopRequireDefault(_sqlColumn);

var _sqlJoin = require('./sql-join');

var _sqlJoin2 = _interopRequireDefault(_sqlJoin);

var _sqlQuery = require('./sql-query');

var _sqlQuery2 = _interopRequireDefault(_sqlQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlTable = function () {
    /*
     * @param {} - either another SqlTable, alias
     *             or TableName, array of columns
     * example:
     *      var users = new SqlTable('users', [{ColumnName: 'id'}, {ColumnName: 'username'}, {ColumnName: 'password'}])
     *      var users = new SqlTable({
     *          TableName: 'users',
     *          columns: [{ColumnName: 'id'}, {ColumnName: 'username'}, {ColumnName: 'password'}]
     *      }, 'u');
     */

    function SqlTable() {
        _classCallCheck(this, SqlTable);

        if (!new.target) {
            return new (Function.prototype.bind.apply(SqlTable, [null].concat(Array.prototype.slice.call(arguments))))();
        }
        var columns;
        var alias;
        if (typeof arguments[0] === "string") {
            this.TableName = arguments[0];
            if (arguments.length > 1) {
                columns = arguments[1];
            }
        } else {
            alias = arguments[1];
            this.TableName = arguments[0].TableName || arguments[0].name;
            columns = arguments[0].Columns || arguments[0].columns;
        }
        this.Alias = alias || this.TableName;
        this.Columns = [];
        if (columns) {
            columns.forEach(function (c) {
                var name = c.ColumnName || c.name;
                var prop = name.toCamel();
                var col = new _sqlColumn2.default(this, name, c.Literal);
                this.Columns.push(col);
                this[prop] = col;
            }, this);
        }
    }

    _createClass(SqlTable, [{
        key: 'getTable',
        value: function getTable() {
            return this.TableName;
        }
    }, {
        key: 'getAlias',
        value: function getAlias() {
            return this.Alias || this.TableName;
        }
    }, {
        key: 'as',
        value: function as(alias) {
            var table = new SqlTable(this, alias);
            table.Alias = alias;
            return table;
        }
    }, {
        key: 'join',
        value: function join(joinClause) {
            var query = new _sqlQuery2.default();
            query.join(joinClause);
            return query;
        }
    }, {
        key: 'left',
        value: function left(joinClause) {
            var query = new _sqlQuery2.default();
            query.left(joinClause);
            return query;
        }
    }, {
        key: 'right',
        value: function right(joinClause) {
            var query = new _sqlQuery2.default();
            query.right(joinClause);
            return query;
        }
    }, {
        key: 'on',
        value: function on(sqlColumn) {
            if (sqlColumn.Table !== this) {
                throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' };
            }
            return new _sqlJoin2.default(sqlColumn);
        }
    }, {
        key: 'where',
        value: function where(whereClause) {
            var query = new _sqlQuery2.default();
            query.where(whereClause);
            return query;
        }
    }, {
        key: 'star',
        value: function star() {
            return this;
        }
    }, {
        key: 'TableName',
        get: function get() {
            return this._tableName;
        },
        set: function set(v) {
            this._tableName = v;
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
        key: 'Columns',
        get: function get() {
            return this._columns;
        },
        set: function set(v) {
            this._columns = v;
        }
    }]);

    return SqlTable;
}();

exports.default = SqlTable;