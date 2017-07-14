"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var sql_column_1 = require("./sql-column");
var sql_join_1 = require("./sql-join");
var sql_query_1 = require("./sql-query");
var SqlTable = (function () {
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
        var _newTarget = this.constructor;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!_newTarget) {
            return new (SqlTable.bind.apply(SqlTable, [void 0].concat(args)))();
        }
        var columns;
        var alias;
        if (typeof args[0] === 'string') {
            this.TableName = args[0];
            if (args.length > 1) {
                columns = args[1];
            }
        }
        else {
            alias = args[1];
            this.TableName = args[0].TableName || args[0].name;
            columns = args[0].Columns || args[0].columns;
        }
        this.Alias = alias || this.TableName;
        this.Columns = [];
        if (columns) {
            columns.forEach(function (c) {
                var name = c.ColumnName || c.name;
                var prop = name.toCamel();
                var col = new sql_column_1.default(this, name, c.Literal);
                this.Columns.push(col);
                this[prop] = col;
            }, this);
        }
    }
    Object.defineProperty(SqlTable.prototype, "Schema", {
        /* eslint-disable brace-style */
        get: function () { return this._Schema; },
        set: function (v) { this._Schema = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlTable.prototype, "TableName", {
        get: function () { return this._TableName; },
        set: function (v) { this._TableName = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlTable.prototype, "Alias", {
        get: function () { return this._Alias; },
        set: function (v) { this._Alias = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlTable.prototype, "Columns", {
        get: function () { return this._Columns; },
        set: function (v) { this._Columns = v; },
        enumerable: true,
        configurable: true
    });
    /* eslint-enable */
    SqlTable.prototype.getTable = function () {
        if (this.Schema) {
            return this.Schema + "." + this.TableName;
        }
        return this.TableName;
    };
    SqlTable.prototype.getAlias = function () {
        return this.Alias || this.TableName;
    };
    SqlTable.prototype.as = function (alias) {
        var table = new SqlTable(this, alias);
        table.Alias = alias;
        return table;
    };
    SqlTable.prototype.join = function (joinClause) {
        var query = new sql_query_1.default(null);
        query.join(joinClause);
        return query;
    };
    SqlTable.prototype.left = function (joinClause) {
        var query = new sql_query_1.default(null);
        query.left(joinClause);
        return query;
    };
    SqlTable.prototype.right = function (joinClause) {
        var query = new sql_query_1.default(null);
        query.right(joinClause);
        return query;
    };
    SqlTable.prototype.on = function (sqlColumn) {
        if (sqlColumn.Table !== this) {
            throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' }; //eslint-disable-line
        }
        return new sql_join_1.default(sqlColumn);
    };
    SqlTable.prototype.where = function (whereClause) {
        var query = new sql_query_1.default(null);
        query.where(whereClause);
        return query;
    };
    SqlTable.prototype.star = function () {
        return this;
    };
    return SqlTable;
}());
exports.default = SqlTable;
//# sourceMappingURL=sql-table.js.map