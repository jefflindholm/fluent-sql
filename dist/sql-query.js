"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var sql_column_1 = require("./sql-column");
var sql_join_1 = require("./sql-join");
var sql_order_1 = require("./sql-order");
var sql_table_1 = require("./sql-table");
var helpers_1 = require("./helpers");
var SqlObject = (function () {
    function SqlObject() {
    }
    return SqlObject;
}());
var defaultOptions = {
    sqlStartChar: '[',
    sqlEndChar: ']',
    escapeLevel: ['table-alias', 'column-alias'],
    namedValues: true,
    namedValueMarker: ':',
};
function setDefaultOptions(options) {
    defaultOptions = __assign({}, defaultOptions, options);
}
exports.setDefaultOptions = setDefaultOptions;
function getDefaultOptions() {
    return defaultOptions;
}
exports.getDefaultOptions = getDefaultOptions;
/*
 * @param {options} - either another SqlQuery object to copy options from
 *                      or an object of options
 *                      sqlStartChar - character used to escape names (default is '[')
 *                      sqlEndChar - character used to end escaped names (default is ']')
 *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
 *                                  - default is ['table-alias', 'column-alias']
 *                      namedValues - boolean, if false will use ? for the values and just
 *                                      return an array of values
 *                                  - default true
 *                      namedValueMarker - character, will use this with named values in the
 *                                      generated SQL (example: where foo = (:value0))
 *                                  - default is ':'
 */
var SqlQuery = (function () {
    function SqlQuery(options) {
        var _newTarget = this.constructor;
        if (options === void 0) { options = null; }
        var _this = this;
        /* eslint-enable brace-style */
        this.sqlEscape = function (str, level) {
            if ((level && _this.Options.escapeLevel.indexOf(level) > -1) || !level) {
                return _this.Options.sqlStartChar + str + _this.Options.sqlEndChar;
            }
            return str;
        };
        this.page = function (page) {
            _this._PageNo = page;
            return _this;
        };
        this.pageSize = function (pageSize) {
            _this._PageSize = pageSize;
            return _this;
        };
        this.top = function (val) {
            _this._Top = val;
            return _this;
        };
        this.addColumns = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            helpers_1.processArgs.apply(void 0, [function (v) {
                    _this.Columns.push(v);
                }].concat(args)); // eslint-disable-line brace-style
            return _this;
        };
        /*
         * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
         * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
         * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
         *                         or you are using a function but want to order by its parameters
         *                         example: you are selecting buildFullNameFunc(first, last, middle) and dont want to order by the function also, use
         *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
         */
        this.applyOrder = function (defaultSqlTable, orderString, overrides) {
            if (orderString) {
                var col_1;
                var table_1;
                var parts_1;
                var dir_1;
                orderString.split(',').forEach(function (o) {
                    parts_1 = o.trim().split(' ');
                    dir_1 = parts_1.length > 1 ? parts_1[1] : 'ASC';
                    parts_1 = parts_1[0].split('.');
                    if (parts_1.length > 1) {
                        col_1 = parts_1[1].toSnakeCase();
                        table_1 = new sql_table_1.default({ TableName: parts_1[0].toSnakeCase() });
                    }
                    else {
                        col_1 = parts_1[0];
                        table_1 = defaultSqlTable;
                    }
                    if (overrides && overrides.hasOwnProperty(col_1)) {
                        overrides[col_1].forEach(function (overCol) {
                            _this.orderBy(overCol.dir(dir_1));
                        });
                    }
                    else {
                        if (!(defaultSqlTable instanceof sql_table_1.default)) {
                            throw {
                                location: 'SqlQuery::applyOrder',
                                message: 'defaultSqlTable is not an instance of SqlTable',
                            };
                        }
                        _this.orderBy((new sql_column_1.default(table_1, col_1, null)).dir(dir_1));
                    }
                });
            }
            return _this;
        };
        this.select = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var query = args[0];
            if (query.Columns) {
                query.Columns.forEach(function (c) {
                    _this.Columns.push(new sql_column_1.default(c, null, null));
                });
            }
            else {
                helpers_1.processArgs.apply(void 0, [function (a) { _this.Columns.push(new sql_column_1.default(a, null, null)); }].concat(args)); // eslint-disable-line brace-style
            }
            return _this;
        };
        this.from = function (sqlTable) {
            if (!(sqlTable instanceof sql_table_1.default)) {
                throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' }; //eslint-disable-line
            }
            _this.From.push(sqlTable);
            return _this;
        };
        this.join = function (joinClause) {
            if (!(joinClause instanceof sql_join_1.default)) {
                throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' }; // eslint-disable-line
            }
            _this.Joins.push(joinClause);
            return _this;
        };
        this.left = function (joinClause) {
            joinClause.Left = true; // eslint-disable-line no-param-reassign
            return _this.join(joinClause);
        };
        this.right = function (joinClause) {
            joinClause.Right = true; // eslint-disable-line no-param-reassign
            return _this.join(joinClause);
        };
        this.where = function (whereClause) {
            _this.Wheres.push(whereClause);
            return _this;
        };
        this.having = function (whereClause) {
            _this.Having.push(whereClause);
            return _this;
        };
        this.orderBy = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            helpers_1.processArgs.apply(void 0, [function (v) { _this.OrderBy.push(new sql_order_1.default(v, null)); }].concat(args)); // eslint-disable-line brace-style
            return _this;
        };
        this.distinct = function () {
            _this._Distinct = true;
            return _this;
        };
        this.removeColumn = function (sqlColumn) {
            var array = _this.Columns;
            for (var i = 0; i < array.length; i++) {
                if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                    array.splice(i, 1);
                }
            }
            return _this;
        };
        this.updateAlias = function (sqlColumn, newAlias) {
            var array = _this.Columns;
            for (var i = 0; i < array.length; i++) {
                if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                    array[i].Alias = newAlias;
                    break;
                }
            }
            return _this;
        };
        /*
         * Generates the SQL from the built up query
         * @param {decryptFunction} function that takes (SqlColumn, boolean - should this use the qualified name, usually true)
         *                           return null if not decrypted
         * @param {maskFunction} function that takes (SqlColumn, select term - this will include decryption from above)
         *                          return null if not replacement
         * @return { fetchSql, countSql, values, hasEncrypted }
         */
        this.genSql = function (decryptFunction, maskFunction) {
            if (_this.From && _this.From.length < 1) {
                throw { location: 'toSql', message: 'No FROM in query' }; // eslint-disable-line
            }
            var sql = new SqlObject();
            var values = [];
            var groupBy = [];
            var columns = '';
            var orderString;
            var data;
            var hasEncrypted = false;
            _this.Columns.forEach(function (c, idx) {
                if (c.Literal) {
                    columns += (idx > 0 ? ',' : '') + "\n(" + c.Literal + ") as " + c.Alias.sqlEscape(_this, 'column-alias');
                    // handle any columns that might have values
                    if (c.Values) {
                        for (var attr in c.Values) {
                            if (c.Values.hasOwnProperty(attr)) {
                                data = {};
                                data[attr] = c.Values[attr];
                                values.push(data);
                            }
                        }
                    }
                    if (c.Grouped) {
                        groupBy.push("(" + c.Literal + ")");
                    }
                }
                else if (c.Aggregate) {
                    var literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = literal !== null;
                    literal = literal || c.qualifiedName(_this);
                    columns += (idx > 0 ? ',' : '') + "\n" + c.Aggregate.Operation + "(" + literal + ") as " + c.Alias.sqlEscape(_this, 'column-alias');
                    if (c.Aggregate.GroupBy) {
                        groupBy.push(c.Aggregate.GroupBy.qualifiedName(_this));
                    }
                }
                else {
                    var literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = literal !== null;
                    literal = literal || c.qualifiedName(_this);
                    if (maskFunction) {
                        literal = maskFunction(c, literal) || literal;
                    }
                    columns += (idx > 0 ? ',' : '') + "\n" + literal + " as " + c.Alias.sqlEscape(_this, 'column-alias');
                    if (!orderString) {
                        orderString = c.Alias.sqlEscape(_this, 'column-alias');
                    }
                    if (c.Grouped) {
                        groupBy.push(literal);
                    }
                }
            }, _this);
            var from = '';
            _this.From.forEach(function (f, idx) {
                from += (idx > 0 ? ',' : '') + "\n" + f.getTable() + " as " + f.Alias.sqlEscape(_this, 'table-alias');
            }, _this);
            var join = '';
            _this.Joins.forEach(function (j) {
                var type = j.Left ? 'LEFT ' : (j.Right ? 'RIGHT ' : ''); // eslint-disable-line no-nested-ternary
                var from = j.From.Table.getTable();
                var alias = j.From.Table.Alias.sqlEscape(_this, 'table-alias');
                var fromCol = j.From.ColumnName;
                var to = j.To.Table.Alias.sqlEscape(_this, 'table-alias');
                var toCol = j.To.ColumnName;
                join += "\n" + type + "JOIN " + from + " as " + alias + " on " + alias + "." + fromCol + " = " + to + "." + toCol;
            }, _this);
            var where = _this.BuildWherePart(_this.Wheres, values, 'and');
            var having = _this.BuildWherePart(_this.Having, values, 'and');
            var top = (_this._Top ? " TOP " + _this._Top : '');
            var select = "SELECT" + top + (_this.Distinct ? ' DISTINCT' : '') + columns + "\nFROM" + from + join;
            if (where && where !== '') {
                select += "\nWHERE " + where;
            }
            if (groupBy.length > 0) {
                select += "\nGROUP BY " + groupBy.join();
            }
            if (having && having !== '') {
                select += "\nHAVING " + having;
            }
            var page = _this._PageNo;
            var pageSize = _this._PageSize;
            if (page && !pageSize) {
                pageSize = 50;
            }
            if (pageSize && !page) {
                page = 1;
            }
            var countSql;
            var fetchSql;
            var order = '';
            if (page) {
                if (_this.OrderBy && _this.OrderBy.length > 0) {
                    _this.OrderBy.forEach(function (o, idx) {
                        // since we know we are going to be ordering over a select, we don't need a table
                        // in this, just use the column alias
                        order += "" + (idx > 0 ? ',' : '') + o.Column.Alias.sqlEscape(_this, 'column-alias') + " " + o.Direction;
                    }, _this);
                    orderString = order;
                }
                countSql = "SELECT count(*) as RecordCount FROM (\n" + select + "\n) count_tbl";
                var baseSql = "SELECT *, row_number() OVER (ORDER BY " + orderString + ") as Paging_RowNumber FROM (\n" + select + "\n) base_query";
                fetchSql = "SELECT * FROM (\n" + baseSql + "\n) as detail_query WHERE Paging_RowNumber BETWEEN " + (page - 1) * pageSize + " AND " + page * pageSize;
            }
            else {
                _this.OrderBy.forEach(function (o, idx) {
                    order += "" + (idx > 0 ? ',' : '') + o.Column.qualifiedName(_this) + " " + o.Direction;
                }, _this);
                if (order && order !== '') {
                    fetchSql = select + "\nORDER BY " + order;
                }
                else {
                    fetchSql = select;
                }
            }
            sql.fetchSql = fetchSql;
            sql.countSql = countSql;
            sql.hasEncrypted = hasEncrypted;
            if (!_this.Options.namedValues) {
                sql.values = values;
            }
            else {
                sql.values = {};
                values.forEach(function (v) {
                    for (var attr in v) {
                        if (v.hasOwnProperty(attr)) {
                            sql.values[attr] = v[attr];
                        }
                    }
                });
            }
            return sql;
        };
        if (!_newTarget) {
            return new SqlQuery(options);
        }
        if (options instanceof SqlQuery) {
            this.Options = options.Options;
        }
        else {
            this.Options = __assign({}, defaultOptions, options);
        }
        this.Columns = [];
        this.From = [];
        this.Joins = [];
        this.Wheres = [];
        this.OrderBy = [];
        this.GroupBy = [];
        this.Having = [];
        this.VariableCount = 0;
        /**
         * @return {string}
         */
        this.BuildWherePart = function (whereArray, values, conjunction) {
            var sql = '';
            var data;
            whereArray.forEach(function (where, idx) {
                if (idx !== 0) {
                    sql += "\n" + conjunction.toUpperCase() + " ";
                }
                var piece = '';
                if (where.Column) {
                    if (where.Value && where.Value.Literal) {
                        piece = where.Column.qualifiedName(_this) + " " + where.Op + " (" + where.Value.Literal + ")";
                        if (where.Value.Values) {
                            for (var attr in where.Value.Values) {
                                if (where.Value.Values.hasOwnProperty(attr)) {
                                    data = {};
                                    data[attr] = where.Value.Values[attr];
                                    values.push(data);
                                }
                            }
                        }
                    }
                    else if (where.Value && where.Value.Table) {
                        piece = where.Column.qualifiedName(_this) + " " + where.Op + " (" + where.Value.qualifiedName(_this) + ")";
                    }
                    else {
                        if ((!where.Value) && where.Value !== 0 && where.Value !== false) {
                            piece = where.Column.qualifiedName(_this) + " " + where.Op;
                        }
                        else {
                            var data_1;
                            piece = where.Column.qualifiedName(_this) + " " + where.Op;
                            if (!_this.Options.namedValues) {
                                data_1 = where.Value;
                                piece += ' ? ';
                            }
                            else {
                                var varName = where.Column.ColumnName + (_this.VariableCount += 1);
                                piece += " (" + _this.Options.namedValueMarker + varName + ")";
                                data_1 = {};
                                data_1[varName] = where.Value;
                            }
                            values.push(data_1);
                        }
                    }
                    if (where.Column.Not) {
                        sql += "NOT (" + piece + ")";
                    }
                    else {
                        sql += piece;
                    }
                }
                if (where.Wheres && where.Wheres.length > 0) {
                    var sub = _this.BuildWherePart(where.Wheres, values, where.type);
                    if (sub && sub.length > 1) {
                        sql += "(" + sub + ")";
                    }
                }
            }, _this);
            return sql;
        };
    }
    Object.defineProperty(SqlQuery.prototype, "Columns", {
        /* eslint-disable brace-style */
        get: function () { return this._Columns; },
        set: function (v) { this._Columns = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "From", {
        get: function () { return this._From; },
        set: function (v) { this._From = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "Joins", {
        get: function () { return this._Joins; },
        set: function (v) { this._Joins = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "Wheres", {
        get: function () { return this._Wheres; },
        set: function (v) { this._Wheres = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "OrderBy", {
        get: function () { return this._OrderBy; },
        set: function (v) { this._OrderBy = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "Having", {
        get: function () { return this._Having; },
        set: function (v) { this._Having = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "GroupBy", {
        get: function () { return this._GroupBy; },
        set: function (v) { this._GroupBy = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "VariableCount", {
        get: function () { return this._VariableCount; },
        set: function (v) { this._VariableCount = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "Options", {
        get: function () { return this._Options; },
        set: function (v) { this._Options = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlQuery.prototype, "Distinct", {
        get: function () { return this._Distinct; },
        enumerable: true,
        configurable: true
    });
    return SqlQuery;
}());
exports.default = SqlQuery;
//# sourceMappingURL=sql-query.js.map