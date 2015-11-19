"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('./string.js');
var sliced = require('sliced');
var util = require('util');
var sprintf = require('sprintf-js').sprintf;

if (!String.prototype.sqlEscape) {
    (function () {
        'use strict';
        var sqlEscape = function sqlEscape(sqlQuery, level) {

            if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== "function") {
                sqlQuery = new SqlQuery();
            }
            return sqlQuery.sqlEscape(this, level);
        };
        String.prototype.sqlEscape = sqlEscape;
    })();
}

var SqlWhere = (function () {
    function SqlWhere(details) {
        _classCallCheck(this, SqlWhere);

        this.Wheres = [];
        if (details) {
            this.Column = details.Column;
            this.Op = details.Op;
            this.Value = details.Value;
        }
        this.add = function (whereClause) {
            var result = this;
            if (this.Column != null) {
                result = new SqlWhere();
                result.type = this.type;
                this.type = null;
                result.Wheres.push(this);
            }
            result.Wheres.push(whereClause);
            return result;
        };
    }

    _createClass(SqlWhere, [{
        key: 'or',
        value: function or(whereClause) {
            if (this.type && this.type !== 'or') {
                throw { location: 'SqlWhere::or', message: "cannot add 'or' to 'and' group" };
            }
            this.type = 'or';
            return this.add(whereClause);
        }
    }, {
        key: 'and',
        value: function and(whereClause) {
            if (this.type && this.type !== 'and') {
                throw { location: 'SqlWhere::and', message: "cannot add 'and' to 'or' group" };
            }
            this.type = 'and';
            return this.add(whereClause);
        }
    }, {
        key: 'Wheres',
        get: function get() {
            return this._Wheres;
        },
        set: function set(v) {
            this._Wheres = v;
        }
    }, {
        key: 'Column',
        get: function get() {
            return this._Column;
        },
        set: function set(v) {
            this._Column = v;
        }
    }, {
        key: 'Op',
        get: function get() {
            return this._Op;
        },
        set: function set(v) {
            this._Op = v;
        }
    }, {
        key: 'Value',
        get: function get() {
            return this._Value;
        },
        set: function set(v) {
            this._Value = v;
        }
    }, {
        key: 'type',
        get: function get() {
            return this._type;
        },
        set: function set(v) {
            this._type = v;
        }
    }]);

    return SqlWhere;
})();

exports.SqlWhere = SqlWhere;

var SqlOrder = (function () {
    function SqlOrder(sqlObject, dir) {
        _classCallCheck(this, SqlOrder);

        if (sqlObject instanceof SqlOrder) {
            this.Column = sqlObject.Column;
            this.Direction = dir || sqlObject.Direction || 'ASC';
        } else if (sqlObject instanceof SqlColumn) {
            this.Column = sqlObject;
            this.Direction = dir || 'ASC';
        } else {
            throw { location: "SqlOrder::constructor", message: "did not pass a SqlColumn object" };
        }
    }

    _createClass(SqlOrder, [{
        key: 'Column',
        get: function get() {
            return this._column;
        },
        set: function set(v) {
            this._column = v;
        }
    }, {
        key: 'Direction',
        get: function get() {
            return this._direction;
        },
        set: function set(v) {
            this._direction = v;
        }
    }]);

    return SqlOrder;
})();

exports.SqlOrder = SqlOrder;

var SqlColumn = (function () {
    function SqlColumn(sqlObject, columnName, literal) {
        _classCallCheck(this, SqlColumn);

        if (sqlObject instanceof SqlColumn) {
            this.Table = sqlObject.Table;
            this.ColumnName = sqlObject.ColumnName;
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
            this.Not = sqlObject.Not;
            this.Values = sqlObject.Values;
            this.groupBy = sqlObject.groupBy;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof SqlTable)) {
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
            return this.Literal || sprintf('%s.%s', this.Table.Alias.sqlEscape(sqlQuery, 'table-alias'), this.ColumnName);
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
            col.groupBy = true;
            return col;
        }
    }, {
        key: 'eq',
        value: function eq(val) {
            return new SqlWhere({ Column: this, Op: '=', Value: val });
        }
    }, {
        key: 'ne',
        value: function ne(val) {
            return new SqlWhere({ Column: this, Op: '<>', Value: val });
        }
    }, {
        key: 'gt',
        value: function gt(val) {
            return new SqlWhere({ Column: this, Op: '>', Value: val });
        }
    }, {
        key: 'gte',
        value: function gte(val) {
            return new SqlWhere({ Column: this, Op: '>=', Value: val });
        }
    }, {
        key: 'lt',
        value: function lt(val) {
            return new SqlWhere({ Column: this, Op: '<', Value: val });
        }
    }, {
        key: 'isNull',
        value: function isNull() {
            return new SqlWhere({ Column: this, Op: 'IS NULL' });
        }
    }, {
        key: 'isNotNull',
        value: function isNotNull() {
            return new SqlWhere({ Column: this, Op: 'IS NOT NULL' });
        }
    }, {
        key: 'lte',
        value: function lte(val) {
            return new SqlWhere({ Column: this, Op: '<=', Value: val });
        }
    }, {
        key: 'like',
        value: function like(val) {
            var value = val;
            if (typeof value === 'string') {
                value = '%' + value + '%';
            }
            return new SqlWhere({ Column: this, Op: 'like', Value: value });
        }
    }, {
        key: 'in',
        value: function _in() {
            var values = [];
            sliced(arguments).reduce(function (cur, next) {
                if (util.isArray(next)) {
                    next.forEach(function (c) {
                        cur.push(c);
                    });
                } else {
                    cur.push(next);
                }
                return cur;
            }, values);
            return new SqlWhere({ Column: this, Op: 'in', Value: values });
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
            return new SqlOrder(this, 'ASC');
        }
    }, {
        key: 'desc',
        value: function desc() {
            return new SqlOrder(this, 'DESC');
        }
    }, {
        key: 'direction',
        value: function direction(dir) {
            return new SqlOrder(this, dir);
        }
    }, {
        key: 'dir',
        value: function dir(_dir) {
            return new SqlOrder(this, _dir);
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
    }]);

    return SqlColumn;
})();

exports.SqlColumn = SqlColumn;

var SqlJoin = (function () {
    function SqlJoin(sqlColumn) {
        _classCallCheck(this, SqlJoin);

        if (!(sqlColumn instanceof SqlColumn)) {
            throw { location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn' };
        }
        this.From = sqlColumn;
    }

    /*
     * @param {options} - either another SqlQuery object to copy options from
     *                      or an object of options
     *                      sqlStartChar - character used to escape names (default is '[')
     *                      sqlEndChar - charater used to end escaped names (default is ']')
     *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
     *                                  - default is ['table-alias', 'column-alias']
     */

    _createClass(SqlJoin, [{
        key: 'using',
        value: function using(sqlColumn) {
            if (!(sqlColumn instanceof SqlColumn)) {
                throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' };
            }
            this.To = sqlColumn;
            return this;
        }
    }, {
        key: 'From',
        get: function get() {
            return this._from;
        },
        set: function set(v) {
            this._from = v;
        }
    }, {
        key: 'To',
        get: function get() {
            return this._to;
        },
        set: function set(v) {
            this._to = v;
        }
    }]);

    return SqlJoin;
})();

exports.SqlJoin = SqlJoin;

var SqlQuery = (function () {
    function SqlQuery(options) {
        _classCallCheck(this, SqlQuery);

        this.options = {
            sqlStartChar: '[',
            sqlEndChar: ']',
            escapeLevel: ['table-alias', 'column-alias']
        };

        if (options instanceof SqlQuery) {
            options = options.options;
        }

        if (options) for (var attr in options) {
            if (options.hasOwnProperty(attr)) {
                this.options[attr] = options[attr];
            }
        }

        this.Columns = [];
        this.From = [];
        this.Joins = [];
        this.Wheres = [];
        this.OrderBy = [];
        this.GroupBy = [];
        this.Having = [];
        this.variableCount = 0;

        this.BuildWherePart = function (whereArray, values, conjunction) {
            var sql = '';
            var data;
            whereArray.forEach(function (where, idx) {
                if (idx !== 0) {
                    sql += sprintf('\n%s ', conjunction.toUpperCase());
                }
                var piece = '';
                if (where.Column) {
                    if (where.Value && where.Value.Literal) {
                        piece = sprintf("%s %s (%s)", where.Column.qualifiedName(this), where.Op, where.Value.Literal);
                        if (where.Value.Values) {
                            for (var attr in where.Value.Values) {
                                if (where.Value.Values.hasOwnProperty(attr)) {
                                    data = {};
                                    data[attr] = where.Value.Values[attr];
                                    values.push(data);
                                }
                            }
                        }
                    } else if (where.Value && where.Value.Table) {
                        piece = sprintf("%s %s (%s)", where.Column.qualifiedName(this), where.Op, where.Value.qualifiedName(this));
                    } else {
                        if (!where.Value) {
                            piece = sprintf('%s %s', where.Column.qualifiedName(this), where.Op);
                        } else {
                            var varName = where.Column.ColumnName + this.variableCount++;
                            if (where.Op === "in") {
                                piece = sprintf('%s %s (:%s)', where.Column.qualifiedName(this), where.Op, varName);
                            } else {
                                piece = sprintf('%s %s :%s', where.Column.qualifiedName(this), where.Op, varName);
                            }
                            data = {};
                            data[varName] = where.Value;
                            values.push(data);
                        }
                    }
                    if (where.Column.Not) {
                        sql += sprintf('NOT (%s)', piece);
                    } else {
                        sql += piece;
                    }
                }
                if (where.Wheres && where.Wheres.length > 0) {
                    var sub = this.BuildWherePart(where.Wheres, values, where.type);
                    if (sub && sub.length > 1) {
                        sql += sprintf("(%s)", sub);
                    }
                }
            }, this);
            return sql;
        };
    }

    _createClass(SqlQuery, [{
        key: 'sqlEscape',
        value: function sqlEscape(str, level) {
            if (level && this.options.escapeLevel.indexOf(level) > -1 || !level) {
                return this.options.sqlStartChar + str + this.options.sqlEndChar;
            } else {
                return str;
            }
        }
    }, {
        key: 'page',
        value: function page(_page) {
            this.pageNo = _page;
            return this;
        }
    }, {
        key: 'pageSize',
        value: function pageSize(_pageSize) {
            this.itemsPerPage = _pageSize;
            return this;
        }
    }, {
        key: 'top',
        value: function top(val) {
            this.topCount = val;
            return this;
        }
    }, {
        key: 'addColumns',
        value: function addColumns() {
            sliced(arguments).reduce(function (cur, next) {
                if (util.isArray(next)) {
                    next.forEach(function (c) {
                        cur.push(new SqlColumn(c));
                    });
                } else {
                    cur.push(new SqlColumn(next));
                }
                return cur;
            }, this.Columns);
        }

        /*
         * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
         * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
         * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
         *                         or you are using a function but want to order by its parameters
         *                         example: you are selecting buildFullNameFunc(first, last, middle) and dont want to order by the function also, use
         *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
         */
    }, {
        key: 'applyOrder',
        value: function applyOrder(defaultSqlTable, orderString, overrides) {
            var self = this;
            if (orderString) {
                var col;
                var table;
                var parts;
                var dir;
                orderString.split(',').forEach(function (o) {
                    parts = o.trim().split(' ');
                    dir = parts.length > 1 ? parts[1] : "ASC";
                    parts = parts[0].split('.');
                    if (parts.length > 1) {
                        col = parts[1].toSnakeCase();
                        table = new SqlTable({ TableName: parts[0].toSnakeCase() });
                    } else {
                        col = parts[0];
                        table = defaultSqlTable;
                    }

                    if (overrides && overrides.hasOwnProperty(col)) {
                        overrides[col].forEach(function (overCol) {
                            self.orderBy(overCol.dir(dir));
                        });
                    } else {
                        if (!(defaultSqlTable instanceof SqlTable)) {
                            throw {
                                location: 'SqlQuery::applyOrder',
                                message: 'defaultSqlTable is not an instance of SqlTable'
                            };
                        }
                        self.orderBy(new SqlColumn(table, col).dir(dir));
                    }
                });
            }
            return this;
        }
    }, {
        key: 'select',
        value: function select(query) {
            var self = this;
            if (query.Columns) {
                query.Columns.forEach(function (c) {
                    //self.Columns.push({TableName: c.TableName, Alias: c.Alias, Name: c.Name});
                    self.Columns.push(new SqlColumn(c));
                });
            } else {
                this.addColumns.apply(this, arguments);
            }
            return this;
        }
    }, {
        key: 'from',
        value: function from(sqlTable) {
            if (!(sqlTable instanceof SqlTable)) {
                throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' };
            }
            this.From.push(sqlTable);
            return this;
        }
    }, {
        key: 'join',
        value: function join(joinClause) {
            if (!(joinClause instanceof SqlJoin)) {
                throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' };
            }
            this.Joins.push(joinClause);
            return this;
        }
    }, {
        key: 'left',
        value: function left(joinClause) {
            joinClause.Left = true;
            return this.join(joinClause);
        }
    }, {
        key: 'right',
        value: function right(joinClause) {
            joinClause.Right = true;
            return this.join(joinClause);
        }
    }, {
        key: 'where',
        value: function where(whereClause) {
            this.Wheres.push(whereClause);
            return this;
        }
    }, {
        key: 'having',
        value: function having(whereClause) {
            this.Having.push(whereClause);
            return this;
        }
    }, {
        key: 'orderBy',
        value: function orderBy() {
            sliced(arguments).reduce(function (cur, next) {
                if (util.isArray(next)) {
                    next.forEach(function (i) {
                        cur.push(new SqlOrder(i));
                    });
                } else {
                    cur.push(new SqlOrder(next));
                }
                return cur;
            }, this.OrderBy);
            return this;
        }
    }, {
        key: 'distinct',
        value: function distinct() {
            this.Distinct = true;
            return this;
        }
    }, {
        key: 'removeColumn',
        value: function removeColumn(sqlColumn) {
            var array = this.Columns;
            var i;
            for (i = 0; i < array.length; i++) {
                if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                    array.splice(i, 1);
                }
            }
            return this;
        }
    }, {
        key: 'updateAlias',
        value: function updateAlias(sqlColumn, newAlias) {
            var array = this.Columns;
            var i;
            for (i = 0; i < array.length; i++) {
                if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                    array[i].Alias = newAlias;
                    break;
                }
            }
            return this;
        }

        /*
         * Generates the SQL from the built up query
         * @param {decryptFunction} function that takes (SqlColumn, boolean - should this use the qualified name, usually true)
         *                           return null if not decrypted
         * @param {maskFunction} function that takes (SqlColumn, select term - this will include decryption from above)
         *                          return null if not replacement
         * @return { fetchSql, countSql, values, hasEncrypted }
         */
        // decryptFunction - table name, column name, boolean - should is use the qualified name (ie. table.column)
        // maskFunction - table name, column name, select term (this will include decryption if it needs to be decrypted)
    }, {
        key: 'genSql',
        value: function genSql(decryptFunction, maskFunction) {
            //var self = this;

            if (this.From && this.From.length < 1) {
                throw { location: 'toSql', message: 'No FROM in query' };
            }

            var sql = {};
            var values = [];
            var groupBy = [];
            var columns = '';
            var orderString;
            var data;
            var hasEncrypted = false;
            this.Columns.forEach(function (c, idx) {
                if (c.Literal) {
                    columns += (idx > 0 ? ',' : '') + sprintf('\n(%s) as %s', c.Literal, c.Alias.sqlEscape(this, 'column-alias'));
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
                    if (c.groupBy === true) {
                        groupBy.push(strintf('(%s)', c.Literal));
                    }
                } else {
                    var literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = literal !== null;
                    literal = literal || c.qualifiedName(this);
                    if (maskFunction) {
                        literal = maskFunction(c, literal) || literal;
                    }

                    columns += (idx > 0 ? ',' : '') + sprintf('\n%s as %s', literal, c.Alias.sqlEscape(this, 'column-alias'));

                    if (!orderString) {
                        orderString = c.Alias.sqlEscape(this, 'column-alias');
                    }

                    if (c.groupBy === true) {
                        groupBy.push(literal);
                    }
                }
            }, this);
            var from = '';
            this.From.forEach(function (f, idx) {
                from += (idx > 0 ? ',' : '') + sprintf('\n%s as %s', f.TableName, f.Alias.sqlEscape(this, 'table-alias'));
            }, this);
            var join = '';
            this.Joins.forEach(function (j, idx) {
                join += sprintf("\n%1$sJOIN %2$s as %3$s on %3$s.%4$s = %5$s.%6$s", j.Left ? 'LEFT ' : j.Right ? 'RIGHT ' : '', j.From.Table.TableName, j.From.Table.Alias.sqlEscape(this, 'table-alias'), j.From.ColumnName, j.To.Table.Alias.sqlEscape(this, 'table-alias'), j.To.ColumnName);
            }, this);

            var where = this.BuildWherePart(this.Wheres, values, 'and');

            var having = this.BuildWherePart(this.Having, values, 'and');

            var select = sprintf('SELECT%s%s', this.topCount ? ' TOP ' + this.topCount : '', this.Distinct ? ' DISTINCT' : '') + columns + '\nFROM' + from + join;

            if (groupBy.size > 0) {
                select += '\nGROUP BY ' + groupBy.join();
            }
            if (having && having !== '') {
                select += '\nHAVING ' + having;
            }
            if (where && where !== '') {
                select += '\nWHERE ' + where;
            }

            var page = this.pageNo;
            var pageSize = this.itemsPerPage;

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
                if (this.OrderBy && this.OrderBy.length > 0) {
                    this.OrderBy.forEach(function (o, idx) {
                        // since we know we are going to be ordering over a select, we don't need a table
                        // in this, just use the column alias
                        order += (idx > 0 ? ',' : '') + sprintf('%s %s', o.Column.Alias.sqlEscape(this, 'column-alias'), o.Direction);
                    }, this);
                    orderString = order;
                }
                countSql = sprintf('SELECT count(*) as RecordCount FROM (\n%s\n) count_tbl', select);
                var baseSql = sprintf('SELECT *, row_number() OVER (ORDER BY %s) as Paging_RowNumber FROM (\n%s\n) base_query', orderString, select);
                fetchSql = sprintf('SELECT * FROM (\n%s\n) as detail_query WHERE Paging_RowNumber BETWEEN %d AND %d', baseSql, (page - 1) * pageSize, page * pageSize);
            } else {
                this.OrderBy.forEach(function (o, idx) {
                    order += (idx > 0 ? ',' : '') + sprintf('%s %s', o.Column.qualifiedName(this), o.Direction);
                }, this);

                if (order && order !== '') {
                    fetchSql = select + '\nORDER BY ' + order;
                } else {
                    fetchSql = select;
                }
            }
            sql.fetchSql = fetchSql;
            sql.countSql = countSql;
            sql.hasEncrypted = hasEncrypted;
            sql.values = {};
            values.forEach(function (v) {
                for (var attr in v) {
                    if (v.hasOwnProperty(attr)) {
                        sql.values[attr] = v[attr];
                    }
                }
            });

            return sql;
        }
    }, {
        key: 'Columns',
        get: function get() {
            return this._columns;
        },
        set: function set(v) {
            this._columns = v;
        }
    }, {
        key: 'From',
        get: function get() {
            return this._from;
        },
        set: function set(v) {
            this._from = v;
        }
    }, {
        key: 'Joins',
        get: function get() {
            return this._joins;
        },
        set: function set(v) {
            this._joins = v;
        }
    }, {
        key: 'Wheres',
        get: function get() {
            return this._wheres;
        },
        set: function set(v) {
            this._wheres = v;
        }
    }, {
        key: 'OrderBy',
        get: function get() {
            return this._orderBy;
        },
        set: function set(v) {
            this._orderBy = v;
        }
    }, {
        key: 'Having',
        get: function get() {
            return this._having;
        },
        set: function set(v) {
            this._having = v;
        }
    }]);

    return SqlQuery;
})();

exports.SqlQuery = SqlQuery;

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
        _classCallCheck(this, SqlTable);

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
                var col = new SqlColumn(this, name, c.Literal);
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
            var query = new SqlQuery();
            query.join(joinClause);
            return query;
        }
    }, {
        key: 'left',
        value: function left(joinClause) {
            var query = new SqlQuery();
            query.left(joinClause);
            return query;
        }
    }, {
        key: 'right',
        value: function right(joinClause) {
            var query = new SqlQuery();
            query.right(joinClause);
            return query;
        }
    }, {
        key: 'on',
        value: function on(sqlColumn) {
            if (sqlColumn.Table !== this) {
                throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' };
            }
            return new SqlJoin(sqlColumn);
        }
    }, {
        key: 'where',
        value: function where(whereClause) {
            var query = new SqlQuery();
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
})();

exports.SqlTable = SqlTable;

var SqlBuilder = (function () {
    function SqlBuilder() {
        _classCallCheck(this, SqlBuilder);
    }

    /*
     * @param {sqlTable} - SqlTable instance for the table to build the update for
     * @param {details} - object with columns and values
     * @param {encryptFunction} - function(SqlColumn, variableName) - where SqlColumn is the instance of the column from the table
     *                              being updated, variableName is the sql replacement name (ie. businessName1)
     *                              should return null if not encrypted
     * @return { sql, values, hasEncrypted }
     */

    _createClass(SqlBuilder, [{
        key: 'update',
        value: function update(sqlTable, details, encryptFunction) {
            if (!(sqlTable instanceof SqlTable)) {
                throw { location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable' };
            }
            var item = 1;
            var data = { id: details.id };
            var update = '';
            var attr;
            var variable;
            var encrypted;
            var column;
            var hasEncryptedValues = false;
            for (attr in details) {
                if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                    column = sqlTable[attr];
                    variable = attr + item.toString();
                    data[variable] = details[attr];
                    encrypted = encryptFunction ? encryptFunction(column, variable) : null;
                    variable = encrypted || ':' + variable;
                    if (encrypted != null) {
                        hasEncryptedValues = true;
                    }
                    update += (item === 1 ? '' : ',') + sprintf("%s = %s", attr.toSnakeCase(), variable);
                    item += 1;
                }
            }
            return {
                sql: sprintf('UPDATE %s SET %s WHERE id = :id', sqlTable.getTable(), update),
                values: data,
                hasEncrypted: hasEncryptedValues
            };
        }
    }, {
        key: 'insert',
        value: function insert(sqlTable, details, newId, encryptFunction) {
            if (!(sqlTable instanceof SqlTable)) {
                throw { location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable' };
            }
            var item = 1;
            var data = {};
            var attr;
            var variable;
            var encrypted;
            var column;
            var columnList = '';
            var variableList = '';
            var hasEncryptedValues = false;
            for (attr in details) {
                if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                    column = sqlTable[attr];
                    variable = attr + item.toString();
                    data[variable] = details[attr];
                    columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
                    encrypted = encryptFunction ? encryptFunction(column, variable) : null;
                    variable = encrypted || ':' + variable;
                    if (encrypted != null) {
                        hasEncryptedValues = true;
                    }
                    variableList += (item === 1 ? '' : ',') + variable;
                    item += 1;
                }
            }
            if (newId) {
                columnList += ', id';
                variableList += ', :id';
                data.id = newId;
            }

            return {
                sql: sprintf('INSERT INTO %s (%s) VALUES (%s)', sqlTable.getTable(), columnList, variableList),
                values: data,
                hasEncrypted: hasEncryptedValues
            };
        }
    }]);

    return SqlBuilder;
})();

module.exports = {
    SqlWhere: SqlWhere,
    SqlOrder: SqlOrder,
    SqlColumn: SqlColumn,
    SqlJoin: SqlJoin,
    SqlQuery: SqlQuery,
    SqlTable: SqlTable,
    SqlBuilder: new SqlBuilder(),
    String: require('./string.js')
};
