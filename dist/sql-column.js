"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var sql_order_1 = require("./sql-order");
var sql_table_1 = require("./sql-table");
var sql_where_1 = require("./sql-where");
var helpers_1 = require("./helpers");
var SqlAggregate = (function () {
    function SqlAggregate(table, column, operation) {
        this.Table = table;
        this.Column = column;
        this.Operation = operation;
        this.Column.Alias = (this.Column.Alias || this.Column.ColumnName) + "_" + operation.toLowerCase();
    }
    SqlAggregate.prototype.on = function (sqlColumn) {
        this.GroupBy = sqlColumn;
        return this.Column;
    };
    SqlAggregate.prototype.by = function (sqlColumn) {
        return this.on(sqlColumn);
    };
    Object.defineProperty(SqlAggregate.prototype, "Table", {
        /* eslint-disable brace-style */
        get: function () { return this._Table; },
        set: function (v) { this._Table = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlAggregate.prototype, "Column", {
        get: function () { return this._Column; },
        set: function (v) { this._Column = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlAggregate.prototype, "Operation", {
        get: function () { return this._Operation; },
        set: function (v) { this._Operation = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlAggregate.prototype, "GroupBy", {
        get: function () { return this._GroupBy; },
        set: function (v) { this._GroupBy = v; },
        enumerable: true,
        configurable: true
    });
    return SqlAggregate;
}());
var SqlColumn = (function () {
    function SqlColumn(sqlObject, columnName, literal) {
        var _newTarget = this.constructor;
        if (columnName === void 0) { columnName = null; }
        if (literal === void 0) { literal = null; }
        if (!_newTarget) {
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
            this.Grouped = sqlObject.Grouped;
        }
        else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        }
        else if (sqlObject != null && !(sqlObject instanceof sql_table_1.default)) {
            throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' }; // eslint-disable-line no-throw-literal
        }
        else {
            this.Table = sqlObject;
            this.ColumnName = columnName;
            this.Literal = literal;
            this.Alias = columnName ? columnName.toCamel() : undefined; // eslint-disable-line no-undefined
        }
    }
    // aggregate functions
    SqlColumn.prototype.aggregate = function (op) {
        var column = new SqlColumn(this, null, null);
        column.Aggregate = new SqlAggregate(column.Table, column, op);
        return column.Aggregate;
    };
    SqlColumn.prototype.avg = function () {
        return this.aggregate('AVG');
    };
    SqlColumn.prototype.checksum = function () {
        return this.aggregate('CHECKSUM_AGG');
    };
    SqlColumn.prototype.count = function () {
        return this.aggregate('COUNT');
    };
    SqlColumn.prototype.countBig = function () {
        return this.aggregate('COUNT_BIG');
    };
    SqlColumn.prototype.grouping = function () {
        return this.aggregate('GROUPING');
    };
    SqlColumn.prototype.groupingId = function () {
        return this.aggregate('GROUPING_ID');
    };
    SqlColumn.prototype.max = function () {
        return this.aggregate('MAX');
    };
    SqlColumn.prototype.min = function () {
        return this.aggregate('MIN');
    };
    SqlColumn.prototype.sum = function () {
        return this.aggregate('SUM');
    };
    SqlColumn.prototype.stdev = function () {
        return this.aggregate('STDEV');
    };
    SqlColumn.prototype.stdevp = function () {
        return this.aggregate('STDEVP');
    };
    // VAR
    SqlColumn.prototype.varp = function () {
        return this.aggregate('VARP');
    };
    SqlColumn.prototype.qualifiedName = function (sqlQuery) {
        return this.Literal || this.Table.Alias.sqlEscape(sqlQuery, 'table-alias') + "." + this.ColumnName;
    };
    SqlColumn.prototype.as = function (alias) {
        var col = new SqlColumn(this);
        col.Alias = alias;
        return col;
    };
    SqlColumn.prototype.using = function (values) {
        var col = new SqlColumn(this);
        col.Values = values;
        return col;
    };
    SqlColumn.prototype.groupBy = function () {
        var col = new SqlColumn(this);
        col.Grouped = true;
        return col;
    };
    Object.defineProperty(SqlColumn.prototype, "Aggregate", {
        /* eslint-disable brace-style */
        get: function () { return this._Aggregate; },
        set: function (v) { this._Aggregate = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "Table", {
        get: function () { return this._Table; },
        set: function (v) { this._Table = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "TableName", {
        get: function () { return this._Table.TableName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "ColumnName", {
        get: function () { return this._ColumnName; },
        set: function (v) { this._ColumnName = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "Literal", {
        get: function () { return this._Literal; },
        set: function (v) { this._Literal = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "Alias", {
        get: function () { return this._Alias; },
        set: function (v) { this._Alias = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "Not", {
        get: function () { return this._Not; },
        set: function (v) { this._Not = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "Values", {
        get: function () { return this._Values; },
        set: function (v) { this._Values = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlColumn.prototype, "Grouped", {
        get: function () { return this._Grouped; },
        set: function (v) { this._Grouped = v; },
        enumerable: true,
        configurable: true
    });
    /* eslint-disable brace-style */
    SqlColumn.prototype.eq = function (val) {
        return new sql_where_1.default({ Column: this, Op: '=', Value: val });
    };
    SqlColumn.prototype.ne = function (val) {
        return new sql_where_1.default({ Column: this, Op: '<>', Value: val });
    };
    SqlColumn.prototype.gt = function (val) {
        return new sql_where_1.default({ Column: this, Op: '>', Value: val });
    };
    SqlColumn.prototype.gte = function (val) {
        return new sql_where_1.default({ Column: this, Op: '>=', Value: val });
    };
    SqlColumn.prototype.lt = function (val) {
        return new sql_where_1.default({ Column: this, Op: '<', Value: val });
    };
    SqlColumn.prototype.isNull = function () {
        return new sql_where_1.default({ Column: this, Op: 'IS NULL' });
    };
    SqlColumn.prototype.isNotNull = function () {
        return new sql_where_1.default({ Column: this, Op: 'IS NOT NULL' });
    };
    SqlColumn.prototype.lte = function (val) {
        return new sql_where_1.default({ Column: this, Op: '<=', Value: val });
    };
    SqlColumn.prototype.like = function (val) {
        var value = val;
        if (typeof value === 'string') {
            value = "%" + value + "%";
        }
        return new sql_where_1.default({ Column: this, Op: 'like', Value: value });
    };
    SqlColumn.prototype.starts = function (val) {
        var value = val;
        if (typeof value === 'string') {
            value = value + "%";
        }
        return new sql_where_1.default({ Column: this, Op: 'like', Value: value });
    };
    SqlColumn.prototype.ends = function (val) {
        var value = val;
        if (typeof value === 'string') {
            value = "%" + value;
        }
        return new sql_where_1.default({ Column: this, Op: 'like', Value: value });
    };
    SqlColumn.prototype.in = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var values = [];
        helpers_1.processArgs.apply(void 0, [function (v) { values.push(v); }].concat(args)); // eslint-disable-line brace-style
        return new sql_where_1.default({ Column: this, Op: 'in', Value: values });
    };
    SqlColumn.prototype.between = function (val1, val2) {
        return this.gte(val1).and(this.lte(val2));
    };
    SqlColumn.prototype.op = function (op, val1, val2) {
        var o = op;
        if (!this[o]) {
            o = o.toLowerCase();
        }
        return this[o](val1, val2);
    };
    SqlColumn.prototype.asc = function () {
        return new sql_order_1.default(this, 'ASC');
    };
    SqlColumn.prototype.desc = function () {
        return new sql_order_1.default(this, 'DESC');
    };
    SqlColumn.prototype.direction = function (dir) {
        return new sql_order_1.default(this, dir);
    };
    SqlColumn.prototype.dir = function (dir) {
        return new sql_order_1.default(this, dir);
    };
    SqlColumn.prototype.not = function () {
        var col = new SqlColumn(this, null, null);
        col.Not = true;
        return col;
    };
    return SqlColumn;
}());
exports.default = SqlColumn;
//# sourceMappingURL=sql-column.js.map