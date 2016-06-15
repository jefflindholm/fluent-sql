'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//import SqlWhere from './sql-where';


require('./string.js');

var _sqlColumn = require('./sql-column');

var _sqlColumn2 = _interopRequireDefault(_sqlColumn);

var _sqlJoin = require('./sql-join');

var _sqlJoin2 = _interopRequireDefault(_sqlJoin);

var _sqlOrder = require('./sql-order');

var _sqlOrder2 = _interopRequireDefault(_sqlOrder);

var _sqlTable = require('./sql-table');

var _sqlTable2 = _interopRequireDefault(_sqlTable);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @param {options} - either another SqlQuery object to copy options from
 *                      or an object of options
 *                      sqlStartChar - character used to escape names (default is '[')
 *                      sqlEndChar - charater used to end escaped names (default is ']')
 *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
 *                                  - default is ['table-alias', 'column-alias']
 *                      namedValues - boolean, if false will use ? for the values and just
 *                                      return an array of values
 *                                  - default true
 *                      namedValueMarker - character, will use this with named values in the
 *                                      generated SQL (example: where foo = (:value0))
 *                                  - default is ':'
 */

var SqlQuery = function () {
    function SqlQuery(options) {
        var _this = this;

        _classCallCheck(this, SqlQuery);

        this.sqlEscape = function (str, level) {
            if (level && _this.options.escapeLevel.indexOf(level) > -1 || !level) {
                return _this.options.sqlStartChar + str + _this.options.sqlEndChar;
            } else {
                return str;
            }
        };

        this.page = function (page) {
            _this.pageNo = page;
            return _this;
        };

        this.pageSize = function (pageSize) {
            _this.itemsPerPage = pageSize;
            return _this;
        };

        this.top = function (val) {
            _this.topCount = val;
            return _this;
        };

        this.addColumns = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _helpers.processArgs.apply(undefined, [function (v) {
                _this.Columns.push(v);
            }].concat(args)); // eslint-disable-line brace-style
            return _this;
        };

        this.applyOrder = function (defaultSqlTable, orderString, overrides) {
            if (orderString) {
                (function () {
                    var col = void 0;
                    var table = void 0;
                    var parts = void 0;
                    var dir = void 0;
                    orderString.split(',').forEach(function (o) {
                        parts = o.trim().split(' ');
                        dir = parts.length > 1 ? parts[1] : 'ASC';
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
                                _this.orderBy(overCol.dir(dir));
                            });
                        } else {
                            if (!(defaultSqlTable instanceof _sqlTable2.default)) {
                                throw {
                                    location: 'SqlQuery::applyOrder',
                                    message: 'defaultSqlTable is not an instance of SqlTable'
                                };
                            }
                            _this.orderBy(new _sqlColumn2.default(table, col).dir(dir));
                        }
                    });
                })();
            }
            return _this;
        };

        this.select = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var query = args[0];
            if (query.Columns) {
                query.Columns.forEach(function (c) {
                    _this.Columns.push(new _sqlColumn2.default(c));
                });
            } else {
                _helpers.processArgs.apply(undefined, [function (a) {
                    _this.Columns.push(new _sqlColumn2.default(a));
                }].concat(args)); // eslint-disable-line brace-style
            }
            return _this;
        };

        this.from = function (sqlTable) {
            if (!(sqlTable instanceof _sqlTable2.default)) {
                throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' };
            }
            _this.From.push(sqlTable);
            return _this;
        };

        this.join = function (joinClause) {
            if (!(joinClause instanceof _sqlJoin2.default)) {
                throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' };
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
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            _helpers.processArgs.apply(undefined, [function (v) {
                _this.OrderBy.push(new _sqlOrder2.default(v));
            }].concat(args)); // eslint-disable-line brace-style
            return _this;
        };

        this.distinct = function () {
            _this.Distinct = true;
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

        this.genSql = function (decryptFunction, maskFunction) {

            if (_this.From && _this.From.length < 1) {
                throw { location: 'toSql', message: 'No FROM in query' };
            }

            var sql = {};
            var values = [];
            var groupBy = [];
            var columns = '';
            var orderString = void 0;
            var data = void 0;
            var hasEncrypted = false;
            _this.Columns.forEach(function (c, idx) {
                if (c.Literal) {
                    columns += (idx > 0 ? ',' : '') + '\n(' + c.Literal + ') as ' + c.Alias.sqlEscape(_this, 'column-alias');
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
                        groupBy.push('(' + c.Literal + ')');
                    }
                } else if (c.Aggregate) {
                    var literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = literal !== null;
                    literal = literal || c.qualifiedName(_this);
                    columns += (idx > 0 ? ',' : '') + '\n' + c.Aggregate.operation + '(' + literal + ') as ' + c.Alias.sqlEscape(_this, 'column-alias');
                    groupBy.push(c.Aggregate.groupBy.qualifiedName(_this));
                } else {
                    var _literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = _literal !== null;
                    _literal = _literal || c.qualifiedName(_this);
                    if (maskFunction) {
                        _literal = maskFunction(c, _literal) || _literal;
                    }

                    columns += (idx > 0 ? ',' : '') + '\n' + _literal + ' as ' + c.Alias.sqlEscape(_this, 'column-alias');

                    if (!orderString) {
                        orderString = c.Alias.sqlEscape(_this, 'column-alias');
                    }

                    if (c.Grouped) {
                        groupBy.push(_literal);
                    }
                }
            }, _this);
            var from = '';
            _this.From.forEach(function (f, idx) {
                from += (idx > 0 ? ',' : '') + '\n' + f.TableName + ' as ' + f.Alias.sqlEscape(_this, 'table-alias');
            }, _this);
            var join = '';
            _this.Joins.forEach(function (j) {
                var type = j.Left ? 'LEFT ' : j.Right ? 'RIGHT ' : ''; // eslint-disable-line no-nested-ternary
                var from = j.From.Table.TableName;
                var alias = j.From.Table.Alias.sqlEscape(_this, 'table-alias');
                var fromCol = j.From.ColumnName;
                var to = j.To.Table.Alias.sqlEscape(_this, 'table-alias');
                var toCol = j.To.ColumnName;
                join += '\n' + type + 'JOIN ' + from + ' as ' + alias + ' on ' + alias + '.' + fromCol + ' = ' + to + '.' + toCol;
            }, _this);

            var where = _this.BuildWherePart(_this.Wheres, values, 'and');

            var having = _this.BuildWherePart(_this.Having, values, 'and');

            var top = _this.topCount ? ' TOP ' + _this.topCount : '';
            var select = 'SELECT' + top + (_this.Distinct ? ' DISTINCT' : '') + columns + '\nFROM' + from + join;

            if (groupBy.length > 0) {
                select += '\nGROUP BY ' + groupBy.join();
            }
            if (having && having !== '') {
                select += '\nHAVING ' + having;
            }
            if (where && where !== '') {
                select += '\nWHERE ' + where;
            }

            var page = _this.pageNo;
            var pageSize = _this.itemsPerPage;

            if (page && !pageSize) {
                pageSize = 50;
            }
            if (pageSize && !page) {
                page = 1;
            }

            var countSql = void 0;
            var fetchSql = void 0;
            var order = '';
            if (page) {
                if (_this.OrderBy && _this.OrderBy.length > 0) {
                    _this.OrderBy.forEach(function (o, idx) {
                        // since we know we are going to be ordering over a select, we don't need a table
                        // in this, just use the column alias
                        order += '' + (idx > 0 ? ',' : '') + o.Column.Alias.sqlEscape(_this, 'column-alias') + ' ' + o.Direction;
                    }, _this);
                    orderString = order;
                }
                countSql = 'SELECT count(*) as RecordCount FROM (\n' + select + '\n) count_tbl';
                var baseSql = 'SELECT *, row_number() OVER (ORDER BY ' + orderString + ') as Paging_RowNumber FROM (\n' + select + '\n) base_query';
                fetchSql = 'SELECT * FROM (\n' + baseSql + '\n) as detail_query WHERE Paging_RowNumber BETWEEN ' + (page - 1) * pageSize + ' AND ' + page * pageSize;
            } else {
                _this.OrderBy.forEach(function (o, idx) {
                    order += '' + (idx > 0 ? ',' : '') + o.Column.qualifiedName(_this) + ' ' + o.Direction;
                }, _this);
                if (order && order !== '') {
                    fetchSql = select + '\nORDER BY ' + order;
                } else {
                    fetchSql = select;
                }
            }
            sql.fetchSql = fetchSql;
            sql.countSql = countSql;
            sql.hasEncrypted = hasEncrypted;
            if (!_this.options.namedValues) {
                sql.values = values;
            } else {
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

        if (!new.target) {
            return new SqlQuery(options);
        }

        this.options = {
            sqlStartChar: '[',
            sqlEndChar: ']',
            escapeLevel: ['table-alias', 'column-alias'],
            namedValues: true,
            namedValueMarker: ':'
        };

        if (options instanceof SqlQuery) {
            this.options = options.options;
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

        /**
         * @return {string}
         */
        this.BuildWherePart = function (whereArray, values, conjunction) {
            var sql = '';
            var data = void 0;
            whereArray.forEach(function (where, idx) {
                if (idx !== 0) {
                    sql += '\n' + conjunction.toUpperCase() + ' ';
                }
                var piece = '';
                if (where.Column) {
                    if (where.Value && where.Value.Literal) {
                        piece = where.Column.qualifiedName(this) + ' ' + where.Op + ' (' + where.Value.Literal + ')';
                        if (where.Value.Values) {
                            for (var _attr in where.Value.Values) {
                                if (where.Value.Values.hasOwnProperty(_attr)) {
                                    data = {};
                                    data[_attr] = where.Value.Values[_attr];
                                    values.push(data);
                                }
                            }
                        }
                    } else if (where.Value && where.Value.Table) {
                        piece = where.Column.qualifiedName(this) + ' ' + where.Op + ' (' + where.Value.qualifiedName(this) + ')';
                    } else {
                        if (!where.Value) {
                            piece = where.Column.qualifiedName(this) + ' ' + where.Op;
                        } else {
                            var _data = void 0;
                            piece = where.Column.qualifiedName(this) + ' ' + where.Op;
                            if (!this.options.namedValues) {
                                _data = where.Value;
                                piece += ' ? ';
                            } else {
                                var varName = where.Column.ColumnName + this.variableCount++;
                                piece += ' (' + this.options.namedValueMarker + varName + ')';
                                _data = {};
                                _data[varName] = where.Value;
                            }
                            values.push(_data);
                        }
                    }
                    if (where.Column.Not) {
                        sql += 'NOT (' + piece + ')';
                    } else {
                        sql += piece;
                    }
                }
                if (where.Wheres && where.Wheres.length > 0) {
                    var sub = this.BuildWherePart(where.Wheres, values, where.type);
                    if (sub && sub.length > 1) {
                        sql += '(' + sub + ')';
                    }
                }
            }, _this);
            return sql;
        };
    }

    _createClass(SqlQuery, [{
        key: 'Columns',

        /* eslint-disable brace-style */
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
        /* eslint-enable brace-style */

        /*
         * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
         * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
         * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
         *                         or you are using a function but want to order by its parameters
         *                         example: you are selecting buildFullNameFunc(first, last, middle) and dont want to order by the function also, use
         *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
         */

        /*
         * Generates the SQL from the built up query
         * @param {decryptFunction} function that takes (SqlColumn, boolean - should this use the qualified name, usually true)
         *                           return null if not decrypted
         * @param {maskFunction} function that takes (SqlColumn, select term - this will include decryption from above)
         *                          return null if not replacement
         * @return { fetchSql, countSql, values, hasEncrypted }
         */

    }]);

    return SqlQuery;
}();

exports.default = SqlQuery;