'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sqlServerOptions = exports.postgresOptions = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
// import SqlWhere from './sql-where';


exports.setDefaultOptions = setDefaultOptions;
exports.getDefaultOptions = getDefaultOptions;
exports.setPostgres = setPostgres;
exports.setSqlServer = setSqlServer;

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

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var postgresOptions = exports.postgresOptions = {
    sqlStartChar: '"',
    sqlEndChar: '"',
    namedValues: true,
    namedValueMarker: '$',
    markerType: 'number',
    dialect: 'pg'
};
var sqlServerOptions = exports.sqlServerOptions = {
    sqlStartChar: '[',
    sqlEndChar: ']',
    escapeLevel: ['table-alias', 'column-alias'],
    namedValues: true,
    namedValueMarker: ':',
    markerType: 'name',
    dialect: 'MS'
};

var defaultOptions = _extends({}, sqlServerOptions);

function setDefaultOptions(options) {
    var display = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (display) console.log('options', options);
    defaultOptions = _extends({}, defaultOptions, options);
    if (display) console.log('new defaults', defaultOptions);
}
function getDefaultOptions() {
    return defaultOptions;
}
function setPostgres() {
    setDefaultOptions(postgresOptions);
}
function setSqlServer() {
    setDefaultOptions(sqlServerOptions);
}
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

var SqlQuery = function () {
    function SqlQuery(options) {
        var _this = this;

        _classCallCheck(this, SqlQuery);

        if (!new.target) {
            return new SqlQuery(options);
        }

        if (options instanceof SqlQuery) {
            this.options = options.options;
        } else {
            this.options = Object.assign({}, defaultOptions, options);
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
                        piece = where.Column.qualifiedName(_this) + ' ' + where.Op + ' (' + where.Value.Literal + ')';
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
                        piece = where.Column.qualifiedName(_this) + ' ' + where.Op + ' (' + where.Value.qualifiedName(_this) + ')';
                    } else {
                        if (!where.Value && where.Value !== 0 && where.Value !== false) {
                            piece = where.Column.qualifiedName(_this) + ' ' + where.Op;
                        } else {
                            var _data = void 0;
                            piece = where.Column.qualifiedName(_this) + ' ' + where.Op;
                            if (!_this.options.namedValues || _this.options.markerType === 'number') {
                                _data = where.Value;
                                if (_this.options.markerType === 'number') {
                                    piece += ' (' + _this.options.namedValueMarker + (values.length + 1) + ')';
                                } else {
                                    piece += ' ? ';
                                }
                            } else {
                                var varName = where.Column.ColumnName + _this.variableCount++;
                                piece += ' (' + _this.options.namedValueMarker + varName + ')';
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
                    var sub = _this.BuildWherePart(where.Wheres, values, where.type);
                    if (sub && sub.length > 1) {
                        sql += '(' + sub + ')';
                    }
                }
            }, _this);
            return sql;
        };
    }
    /* eslint-disable brace-style */


    _createClass(SqlQuery, [{
        key: 'sqlEscape',


        /* eslint-enable brace-style */
        value: function sqlEscape(str, level) {
            if (level && this.options.escapeLevel.indexOf(level) > -1 || !level) {
                return this.options.sqlStartChar + str + this.options.sqlEndChar;
            }
            return str;
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
            var _this2 = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _helpers.processArgs.apply(undefined, [function (v) {
                _this2.Columns.push(v);
            }].concat(args)); // eslint-disable-line brace-style
            return this;
        }
    }, {
        key: 'applyOrder',

        /*
         * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
         * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
         * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
         *                         or you are using a function but want to order by its parameters
         *                         example: you are selecting buildFullNameFunc(first, last, middle) and dont want to order by the function also, use
         *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
         */
        value: function applyOrder(defaultSqlTable, orderString, overrides) {
            var _this3 = this;

            if (orderString) {
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
                            _this3.orderBy(overCol.dir(dir));
                        });
                    } else {
                        if (!(defaultSqlTable instanceof _sqlTable2.default)) {
                            throw { // eslint-disable-line
                                location: 'SqlQuery::applyOrder',
                                message: 'defaultSqlTable is not an instance of SqlTable'
                            };
                        }
                        _this3.orderBy(new _sqlColumn2.default(table, col).dir(dir));
                    }
                });
            }
            return this;
        }
    }, {
        key: 'select',
        value: function select() {
            var _this4 = this;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var query = args[0];
            if (query.Columns) {
                query.Columns.forEach(function (c) {
                    _this4.Columns.push(new _sqlColumn2.default(c));
                });
            } else {
                _helpers.processArgs.apply(undefined, [function (a) {
                    _this4.Columns.push(new _sqlColumn2.default(a));
                }].concat(args)); // eslint-disable-line brace-style
            }
            return this;
        }
    }, {
        key: 'from',
        value: function from(sqlTable) {
            if (!(sqlTable instanceof _sqlTable2.default)) {
                throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' }; //eslint-disable-line
            }
            this.From.push(sqlTable);
            return this;
        }
    }, {
        key: 'join',
        value: function join(joinClause) {
            if (!(joinClause instanceof _sqlJoin2.default)) {
                throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' }; // eslint-disable-line
            }
            this.Joins.push(joinClause);
            return this;
        }
    }, {
        key: 'left',
        value: function left(joinClause) {
            joinClause.Left = true; // eslint-disable-line no-param-reassign
            return this.join(joinClause);
        }
    }, {
        key: 'right',
        value: function right(joinClause) {
            joinClause.Right = true; // eslint-disable-line no-param-reassign
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
            var _this5 = this;

            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            _helpers.processArgs.apply(undefined, [function (v) {
                _this5.OrderBy.push(new _sqlOrder2.default(v));
            }].concat(args)); // eslint-disable-line brace-style
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
            for (var i = 0; i < array.length; i++) {
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
            for (var i = 0; i < array.length; i++) {
                if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                    array[i].Alias = newAlias;
                    break;
                }
            }
            return this;
        }
    }, {
        key: 'genSql',

        /*
         * Generates the SQL from the built up query
         * @param {decryptFunction} function that takes (SqlColumn, boolean - should this use the qualified name, usually true)
         *                           return null if not decrypted
         * @param {maskFunction} function that takes (SqlColumn, select term - this will include decryption from above)
         *                          return null if not replacement
         * @return { fetchSql, countSql, values, hasEncrypted }
         */
        value: function genSql(decryptFunction, maskFunction) {
            var _this6 = this;

            if (this.From && this.From.length < 1) {
                throw { location: 'toSql', message: 'No FROM in query' }; // eslint-disable-line
            }

            var sql = {};
            var values = [];
            var groupBy = [];
            var columns = '';
            var orderString = void 0;
            var data = void 0;
            var hasEncrypted = false;
            this.Columns.forEach(function (c, idx) {
                if (c.Literal) {
                    columns += (idx > 0 ? ',' : '') + '\n(' + c.Literal + ') as ' + c.Alias.sqlEscape(_this6, 'column-alias');
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
                    literal = literal || c.qualifiedName(_this6);
                    columns += (idx > 0 ? ',' : '') + '\n' + c.Aggregate.operation + '(' + literal + ') as ' + c.Alias.sqlEscape(_this6, 'column-alias');
                    if (c.Aggregate.groupBy) {
                        groupBy.push(c.Aggregate.groupBy.qualifiedName(_this6));
                    }
                } else {
                    var _literal = decryptFunction ? decryptFunction(c, true) : null;
                    hasEncrypted = _literal !== null;
                    _literal = _literal || c.qualifiedName(_this6);
                    if (maskFunction) {
                        _literal = maskFunction(c, _literal) || _literal;
                    }

                    columns += (idx > 0 ? ',' : '') + '\n' + _literal + ' as ' + c.Alias.sqlEscape(_this6, 'column-alias');

                    if (!orderString) {
                        orderString = c.Alias.sqlEscape(_this6, 'column-alias');
                    }

                    if (c.Grouped) {
                        groupBy.push(_literal);
                    }
                }
            }, this);
            var from = '';
            this.From.forEach(function (f, idx) {
                from += (idx > 0 ? ',' : '') + '\n' + f.getTable() + ' as ' + f.Alias.sqlEscape(_this6, 'table-alias');
            }, this);
            var join = '';
            this.Joins.forEach(function (j) {
                var type = j.Left ? 'LEFT ' : j.Right ? 'RIGHT ' : ''; // eslint-disable-line no-nested-ternary
                var from = j.From.Table.getTable();
                var alias = j.From.Table.Alias.sqlEscape(_this6, 'table-alias');
                var fromCol = j.From.ColumnName;
                var to = j.To.Table.Alias.sqlEscape(_this6, 'table-alias');
                var toCol = j.To.ColumnName;
                join += '\n' + type + 'JOIN ' + from + ' as ' + alias + ' on ' + alias + '.' + fromCol + ' = ' + to + '.' + toCol;
            }, this);

            var where = this.BuildWherePart(this.Wheres, values, 'and');

            var having = this.BuildWherePart(this.Having, values, 'and');

            var top = this.topCount ? ' TOP ' + this.topCount : '';
            var select = void 0;
            if (this.options.dialect !== 'MS') {
                select = 'SELECT' + (this.Distinct ? ' DISTINCT' : '') + columns + '\nFROM' + from + join;
            } else {
                select = 'SELECT' + top + (this.Distinct ? ' DISTINCT' : '') + columns + '\nFROM' + from + join;
            }

            if (where && where !== '') {
                select += '\nWHERE ' + where;
            }
            if (groupBy.length > 0) {
                select += '\nGROUP BY ' + groupBy.join();
            }
            if (having && having !== '') {
                select += '\nHAVING ' + having;
            }

            var page = this.pageNo;
            var pageSize = this.itemsPerPage;

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
                if (this.OrderBy && this.OrderBy.length > 0) {
                    this.OrderBy.forEach(function (o, idx) {
                        // since we know we are going to be ordering over a select, we don't need a table
                        // in this, just use the column alias
                        order += '' + (idx > 0 ? ',' : '') + o.Column.Alias.sqlEscape(_this6, 'column-alias') + ' ' + o.Direction;
                    }, this);
                    orderString = order;
                }
                countSql = 'SELECT count(*) as RecordCount FROM (\n' + select + '\n) count_tbl';
                var baseSql = 'SELECT *, row_number() OVER (ORDER BY ' + orderString + ') as Paging_RowNumber FROM (\n' + select + '\n) base_query';
                fetchSql = 'SELECT * FROM (\n' + baseSql + '\n) as detail_query WHERE Paging_RowNumber BETWEEN ' + (page - 1) * pageSize + ' AND ' + page * pageSize;
            } else {
                this.OrderBy.forEach(function (o, idx) {
                    order += '' + (idx > 0 ? ',' : '') + o.Column.qualifiedName(_this6) + ' ' + o.Direction;
                }, this);
                if (order && order !== '') {
                    fetchSql = select + '\nORDER BY ' + order;
                } else {
                    fetchSql = select;
                }
                if (this.options.dialect !== 'MS' && this.topCount) {
                    fetchSql += '\nLIMIT ' + this.topCount;
                }
            }
            sql.fetchSql = fetchSql;
            sql.countSql = countSql;
            sql.hasEncrypted = hasEncrypted;
            if (!this.options.namedValues || this.options.markerType === 'number') {
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