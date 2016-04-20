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

var _sqlOrder = require('./sql-order');

var _sqlOrder2 = _interopRequireDefault(_sqlOrder);

var _sqlTable = require('./sql-table');

var _sqlTable2 = _interopRequireDefault(_sqlTable);

var _sqlWhere = require('./sql-where');

var _sqlWhere2 = _interopRequireDefault(_sqlWhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @param {options} - either another SqlQuery object to copy options from
 *                      or an object of options
 *                      sqlStartChar - character used to escape names (default is '[')
 *                      sqlEndChar - charater used to end escaped names (default is ']')
 *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
 *                                  - default is ['table-alias', 'column-alias']
 */

var SqlQuery = function () {
    function SqlQuery(options) {
        _classCallCheck(this, SqlQuery);

        if (!new.target) {
            return new SqlQuery(options);
        }

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
                    sql += (0, _sprintfJs.sprintf)('\n%s ', conjunction.toUpperCase());
                }
                var piece = '';
                if (where.Column) {
                    if (where.Value && where.Value.Literal) {
                        piece = (0, _sprintfJs.sprintf)("%s %s (%s)", where.Column.qualifiedName(this), where.Op, where.Value.Literal);
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
                        piece = (0, _sprintfJs.sprintf)("%s %s (%s)", where.Column.qualifiedName(this), where.Op, where.Value.qualifiedName(this));
                    } else {
                        if (!where.Value) {
                            piece = (0, _sprintfJs.sprintf)('%s %s', where.Column.qualifiedName(this), where.Op);
                        } else {
                            var varName = where.Column.ColumnName + this.variableCount++;
                            if (where.Op === "in") {
                                piece = (0, _sprintfJs.sprintf)('%s %s (:%s)', where.Column.qualifiedName(this), where.Op, varName);
                            } else {
                                piece = (0, _sprintfJs.sprintf)('%s %s :%s', where.Column.qualifiedName(this), where.Op, varName);
                            }
                            data = {};
                            data[varName] = where.Value;
                            values.push(data);
                        }
                    }
                    if (where.Column.Not) {
                        sql += (0, _sprintfJs.sprintf)('NOT (%s)', piece);
                    } else {
                        sql += piece;
                    }
                }
                if (where.Wheres && where.Wheres.length > 0) {
                    var sub = this.BuildWherePart(where.Wheres, values, where.type);
                    if (sub && sub.length > 1) {
                        sql += (0, _sprintfJs.sprintf)("(%s)", sub);
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
            (0, _sliced2.default)(arguments).reduce(function (cur, next) {
                if (_util2.default.isArray(next)) {
                    next.forEach(function (c) {
                        cur.push(new _sqlColumn2.default(c));
                    });
                } else {
                    cur.push(new _sqlColumn2.default(next));
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
                        table = new _sqlTable2.default({ TableName: parts[0].toSnakeCase() });
                    } else {
                        col = parts[0];
                        table = defaultSqlTable;
                    }

                    if (overrides && overrides.hasOwnProperty(col)) {
                        overrides[col].forEach(function (overCol) {
                            self.orderBy(overCol.dir(dir));
                        });
                    } else {
                        if (!(defaultSqlTable instanceof _sqlTable2.default)) {
                            throw {
                                location: 'SqlQuery::applyOrder',
                                message: 'defaultSqlTable is not an instance of SqlTable'
                            };
                        }
                        self.orderBy(new _sqlColumn2.default(table, col).dir(dir));
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
                    self.Columns.push(new _sqlColumn2.default(c));
                });
            } else {
                this.addColumns.apply(this, arguments);
            }
            return this;
        }
    }, {
        key: 'from',
        value: function from(sqlTable) {
            if (!(sqlTable instanceof _sqlTable2.default)) {
                throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' };
            }
            this.From.push(sqlTable);
            return this;
        }
    }, {
        key: 'join',
        value: function join(joinClause) {
            if (!(joinClause instanceof _sqlJoin2.default)) {
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
            (0, _sliced2.default)(arguments).reduce(function (cur, next) {
                if (_util2.default.isArray(next)) {
                    next.forEach(function (i) {
                        cur.push(new _sqlOrder2.default(i));
                    });
                } else {
                    cur.push(new _sqlOrder2.default(next));
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
                    columns += (idx > 0 ? ',' : '') + (0, _sprintfJs.sprintf)('\n(%s) as %s', c.Literal, c.Alias.sqlEscape(this, 'column-alias'));
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
                        groupBy.push((0, _sprintfJs.sprintf)('(%s)', c.Literal));
                    }
                } else {
                    var literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = literal !== null;
                    literal = literal || c.qualifiedName(this);
                    if (maskFunction) {
                        literal = maskFunction(c, literal) || literal;
                    }

                    columns += (idx > 0 ? ',' : '') + (0, _sprintfJs.sprintf)('\n%s as %s', literal, c.Alias.sqlEscape(this, 'column-alias'));

                    if (!orderString) {
                        orderString = c.Alias.sqlEscape(this, 'column-alias');
                    }

                    if (c.Grouped) {
                        groupBy.push(literal);
                    }
                }
            }, this);
            var from = '';
            this.From.forEach(function (f, idx) {
                from += (idx > 0 ? ',' : '') + (0, _sprintfJs.sprintf)('\n%s as %s', f.TableName, f.Alias.sqlEscape(this, 'table-alias'));
            }, this);
            var join = '';
            this.Joins.forEach(function (j, idx) {
                join += (0, _sprintfJs.sprintf)("\n%1$sJOIN %2$s as %3$s on %3$s.%4$s = %5$s.%6$s", j.Left ? 'LEFT ' : j.Right ? 'RIGHT ' : '', j.From.Table.TableName, j.From.Table.Alias.sqlEscape(this, 'table-alias'), j.From.ColumnName, j.To.Table.Alias.sqlEscape(this, 'table-alias'), j.To.ColumnName);
            }, this);

            var where = this.BuildWherePart(this.Wheres, values, 'and');

            var having = this.BuildWherePart(this.Having, values, 'and');

            var select = (0, _sprintfJs.sprintf)('SELECT%s%s', this.topCount ? ' TOP ' + this.topCount : '', this.Distinct ? ' DISTINCT' : '') + columns + '\nFROM' + from + join;

            if (groupBy.length > 0) {
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
                        order += (idx > 0 ? ',' : '') + (0, _sprintfJs.sprintf)('%s %s', o.Column.Alias.sqlEscape(this, 'column-alias'), o.Direction);
                    }, this);
                    orderString = order;
                }
                countSql = (0, _sprintfJs.sprintf)('SELECT count(*) as RecordCount FROM (\n%s\n) count_tbl', select);
                var baseSql = (0, _sprintfJs.sprintf)('SELECT *, row_number() OVER (ORDER BY %s) as Paging_RowNumber FROM (\n%s\n) base_query', orderString, select);
                fetchSql = (0, _sprintfJs.sprintf)('SELECT * FROM (\n%s\n) as detail_query WHERE Paging_RowNumber BETWEEN %d AND %d', baseSql, (page - 1) * pageSize, page * pageSize);
            } else {
                this.OrderBy.forEach(function (o, idx) {
                    order += (idx > 0 ? ',' : '') + (0, _sprintfJs.sprintf)('%s %s', o.Column.qualifiedName(this), o.Direction);
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
}();

exports.default = SqlQuery;