"use strict";

require('./string.js');
var sliced = require('sliced');
var util = require('util');
var sprintf = require('sprintf-js').sprintf;

if (!String.prototype.sqlEscape) {
    (function () {
        'use strict';
        var sqlEscape = function (sqlQuery, level) {
            if (!(sqlQuery instanceof SqlQuery)) {
                sqlQuery = new SqlQuery();
            }
            return sqlQuery.sqlEscape(this, level);
        }
        String.prototype.sqlEscape = sqlEscape;
    })();
}

export class SqlWhere {
    constructor(details) {
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

    get Wheres() {
        return this._Wheres;
    }

    get Column() {
        return this._Column;
    }

    get Op() {
        return this._Op;
    }

    get Value() {
        return this._Value;
    }

    get type() {
        return this._type;
    }

    set Wheres(v) {
        this._Wheres = v;
    }

    set Column(v) {
        this._Column = v;
    }

    set Op(v) {
        this._Op = v;
    }

    set Value(v) {
        this._Value = v;
    }

    set type(v) {
        this._type = v;
    }

    or(whereClause) {
        if (this.type && this.type !== 'or') {
            throw {location: 'SqlWhere::or', message: "cannot add 'or' to 'and' group"};
        }
        this.type = 'or';
        return this.add(whereClause);
    }

    and(whereClause) {
        if (this.type && this.type !== 'and') {
            throw {location: 'SqlWhere::and', message: "cannot add 'and' to 'or' group"};
        }
        this.type = 'and';
        return this.add(whereClause);
    }
}

export class SqlOrder {
    constructor(sqlObject, dir) {
        if (sqlObject instanceof SqlOrder) {
            this.Column = sqlObject.Column;
            this.Direction = dir || sqlObject.Direction || 'ASC';
        } else if (sqlObject instanceof SqlColumn) {
            this.Column = sqlObject;
            this.Direction = dir || 'ASC';
        } else {
            throw {location: "SqlOrder::constructor", message: "did not pass a SqlColumn object"};
        }
    }

    get Column() {
        return this._column;
    }

    set Column(v) {
        this._column = v;
    }

    get Direction() {
        return this._direction;
    }

    set Direction(v) {
        this._direction = v;
    }
}

export class SqlColumn {
    constructor(sqlObject, columnName, literal) {
        if (sqlObject instanceof SqlColumn) {
            this.Table = sqlObject.Table;
            this.ColumnName = sqlObject.ColumnName;
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
            this.Not = sqlObject.Not;
            this.Values = sqlObject.Values;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof SqlTable)) {
            throw {location: 'SqlColumn::constructor', message: 'must construct using a SqlTable'};
        } else {
            this.Table = sqlObject;
            this.ColumnName = columnName;
            this.Literal = literal;
            this.Alias = columnName ? columnName.toCamel() : undefined;
        }
    }

    qualifiedName(sqlQuery) {
        return this.Literal || sprintf('%s.%s', this.Table.Alias.sqlEscape(sqlQuery, 'table-alias'), this.ColumnName);
    }

    as(alias) {
        var col = new SqlColumn(this);
        col.Alias = alias;
        return col;
    }

    using(values) {
        var col = new SqlColumn(this);
        col.Values = values;
        return col;
    }

    get Table() {
        return this._table;
    }

    set Table(v) {
        this._table = v;
    }

    get ColumnName() {
        return this._columnName;
    }

    set ColumnName(v) {
        this._columnName = v;
    }

    get Literal() {
        return this._literal;
    }

    set Literal(v) {
        this._literal = v;
    }

    get Alias() {
        return this._alias;
    }

    set Alias(v) {
        this._alias = v;
    }

    get Not() {
        return this._not;
    }

    set Not(v) {
        this._not = v;
    }

    get Values() {
        return this._values;
    }

    set Values(v) {
        this._values = v;
    }
    eq (val) {
        return new SqlWhere({Column: this, Op: '=', Value: val});
    };
    ne (val) {
        return new SqlWhere({Column: this, Op: '<>', Value: val});
    }
    gt (val) {
        return new SqlWhere({Column: this, Op: '>', Value: val});
    }
    gte (val) {
        return new SqlWhere({Column: this, Op: '>=', Value: val});
    }
    lt (val) {
        return new SqlWhere({Column: this, Op: '<', Value: val});
    }
    isNull () {
        return new SqlWhere({Column: this, Op: 'IS NULL'});
    }
    isNotNull () {
        return new SqlWhere({Column: this, Op: 'IS NOT NULL'});
    }
    lte (val) {
        return new SqlWhere({Column: this, Op: '<=', Value: val});
    }
    like (val) {
        var value = val;
        if (typeof value === 'string') {
            value = '%' + value + '%';
        }
        return new SqlWhere({Column: this, Op: 'like', Value: value});
    }
    in () {
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
        return new SqlWhere({Column: this, Op: 'in', Value: values});
    }
    between (val1, val2) {
        return this.gte(val1).and(this.lte(val2));
    }
    op (op, val1, val2) {
        if (!this[op]) {
            op = op.toLowerCase();
        }
        return this[op](val1, val2);
    }
    asc () {
        return new SqlOrder(this, 'ASC');
    }
    desc () {
        return new SqlOrder(this, 'DESC');
    }
    direction (dir) {
        return new SqlOrder(this, dir);
    }
    dir (dir) {
        return new SqlOrder(this, dir);
    }
    not () {
        var col = new SqlColumn(this);
        col.Not = true;
        return col;
    }
}

export class SqlJoin {
    constructor(sqlColumn) {
        if (!(sqlColumn instanceof SqlColumn)) {
            throw {location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn'};
        }
        this.From = sqlColumn;
    }
    get From() { return this._from; }
    set From(v) { this._from = v; }
    get To() { return this._to; }
    set To(v) { this._to = v; }
    using (sqlColumn) {
        if (!(sqlColumn instanceof SqlColumn)) {
            throw {location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn'};
        }
        this.To = sqlColumn;
        return this;
    }
}

/*
 * @param {options} - either another SqlQuery object to copy options from
 *                      or an object of options
 *                      sqlStartChar - character used to escape names (default is '[')
 *                      sqlEndChar - charater used to end escaped names (default is ']')
 *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
 *                                  - default is ['table-alias', 'column-alias']
 */
export class SqlQuery {
    constructor (options) {
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
    };
    get Columns() { return this._columns; }
    set Columns(v) { this._columns = v; }
    get From() { return this._from; }
    set From(v) { this._from = v; }
    get Joins() { return this._joins; }
    set Joins(v) { this._joins = v; }
    get Wheres() { return this._wheres; }
    set Wheres(v) { this._wheres = v; }
    get OrderBy() { return this._orderBy; }
    set OrderBy(v) { this._orderBy = v; }
    get GroupBy() { return this._groupBy; }
    set GroupBy(v) { this._groupBy = v; }
    get Having() { return this._having; }
    set Having(v) { this._having = v; }
    sqlEscape (str, level) {
        if ((level && this.options.escapeLevel.indexOf(level) > -1) || !level) {
            return this.options.sqlStartChar + str + this.options.sqlEndChar;
        } else {
            return str;
        }
    }
    page (page) {
        this.pageNo = page;
        return this;
    }
    pageSize (pageSize) {
        this.itemsPerPage = pageSize;
        return this;
    }
    top (val) {
        this.topCount = val;
        return this;
    };
    addColumns () {
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
    applyOrder (defaultSqlTable, orderString, overrides) {
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
                    table = new SqlTable({TableName: parts[0].toSnakeCase()});
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
                    self.orderBy((new SqlColumn(table, col)).dir(dir));
                }
            });
        }
        return this;
    }
    select (query) {
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
    from (sqlTable) {
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlQuery::from', message: 'from clause must be a SqlTable'};
        }
        this.From.push(sqlTable);
        return this;
    };
    join (joinClause) {
        if (!(joinClause instanceof SqlJoin)) {
            throw {location: 'SqlQuery::join', message: 'clause is not a SqlJoin'};
        }
        this.Joins.push(joinClause);
        return this;
    }
    left (joinClause) {
        joinClause.Left = true;
        return this.join(joinClause);
    }
    right (joinClause) {
        joinClause.Right = true;
        return this.join(joinClause);
    }
    where (whereClause) {
        this.Wheres.push(whereClause);
        return this;
    }
    having (whereClause) {
        this.Having.push(whereClause);
        return this;
    }
    groupBy () {
        sliced(arguments).reduce(function (cur, next) {
            if (util.isArray(next)) {
                return cur.concat(next);
            }
            cur.push(next);
            return cur;
        }, this.GroupBy);
        return this;
    }
    orderBy () {
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
    distinct () {
        this.Distinct = true;
        return this;
    }
    removeColumn (sqlColumn) {
        var array = this.Columns;
        var i;
        for (i = 0; i < array.length; i++) {
            if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                array.splice(i, 1);
            }
        }
        return this;
    }
    updateAlias (sqlColumn, newAlias) {
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
    genSql (decryptFunction, maskFunction) {
        //var self = this;

        if (this.From && this.From.length < 1) {
            throw {location: 'toSql', message: 'No FROM in query'};
        }

        var sql = {};
        var values = [];
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
            } else {
                var literal = decryptFunction ? decryptFunction(c, true) : null;
                hasEncrypted = literal == null;
                literal = literal || c.qualifiedName(this);
                if (maskFunction) {
                    literal = maskFunction(c, literal) || literal;
                }

                columns += (idx > 0 ? ',' : '') + sprintf('\n%s as %s', literal, c.Alias.sqlEscape(this, 'column-alias'));

                if (!orderString) {
                    orderString = c.Alias.sqlEscape(this, 'column-alias');
                }
            }
        }, this);
        var from = '';
        this.From.forEach(function (f, idx) {
            from += (idx > 0 ? ',' : '') + sprintf('\n%s as %s', f.TableName, f.Alias.sqlEscape(this, 'table-alias'));
        }, this);
        var join = '';
        this.Joins.forEach(function (j, idx) {
            join += sprintf("\n%1$sJOIN %2$s as %3$s on %3$s.%4$s = %5$s.%6$s",
                j.Left ? 'LEFT ' : (j.Right ? 'RIGHT ' : ''),
                j.From.Table.TableName,
                j.From.Table.Alias.sqlEscape(this, 'table-alias'),
                j.From.ColumnName,
                j.To.Table.Alias.sqlEscape(this, 'table-alias'),
                j.To.ColumnName);
        }, this);

        var where = this.BuildWherePart(this.Wheres, values, 'and');

        var having = this.BuildWherePart(this.Having, values, 'and');

        var group = '';
        this.GroupBy.forEach(function (g, idx) {
            group += (idx > 0 ? ',' : '') + sprintf('%s.%s', g.TableName, g.ColumnName);
        });

        var select = sprintf('SELECT%s%s', (this.topCount ? ' TOP ' + this.topCount : ''), (this.Distinct ? ' DISTINCT' : '')) + columns + '\nFROM' + from + join;

        if (group && group !== '') {
            select += '\nGROUP BY ' + group;
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
}

export class SqlTable {
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
    constructor () {
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
    get TableName() { return this._tableName; }
    set TableName(v) { this._tableName = v; }
    get Alias() { return this._alias; }
    set Alias(v) { this._alias = v; }
    get Columns() { return this._columns; }
    set Columns(v) { this._columns = v; }

    getTable () {
        return this.TableName;
    }
    getAlias () {
        return this.Alias || this.TableName;
    }
    as (alias) {
        var table = new SqlTable(this, alias);
        table.Alias = alias;
        return table;
    }
    join (joinClause) {
        var query = new SqlQuery();
        query.join(joinClause);
        return query;
    }
    left (joinClause) {
        var query = new SqlQuery();
        query.left(joinClause);
        return query;
    }
    right (joinClause) {
        var query = new SqlQuery();
        query.right(joinClause);
        return query;
    }
    on (sqlColumn) {
        if (sqlColumn.Table !== this) {
            throw {location: 'SqlTable::on', message: 'trying to build join on column not from this table'};
        }
        return new SqlJoin(sqlColumn);
    }
    where (whereClause) {
        var query = new SqlQuery();
        query.where(whereClause);
        return query;
    }
    star () {
        return this;
    }
}

class SqlBuilder {
    constructor() {}

    /*
     * @param {sqlTable} - SqlTable instance for the table to build the update for
     * @param {details} - object with columns and values
     * @param {encryptFunction} - function(SqlColumn, variableName) - where SqlColumn is the instance of the column from the table
     *                              being updated, variableName is the sql replacement name (ie. businessName1)
     *                              should return null if not encrypted
     * @return { sql, values, hasEncrypted }
     */
    update (sqlTable, details, encryptFunction) {
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable'};
        }
        var item = 1;
        var data = {id: details.id};
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
                encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
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
    };
    insert (sqlTable, details, newId, encryptFunction) {
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable'};
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
                encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
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
    };
}

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
