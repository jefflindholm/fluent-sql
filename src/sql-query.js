import './string.js';
import sliced from 'sliced';
import util from 'util';
import {sprintf} from 'sprintf-js';

import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlOrder from './sql-order';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';

/*
 * @param {options} - either another SqlQuery object to copy options from
 *                      or an object of options
 *                      sqlStartChar - character used to escape names (default is '[')
 *                      sqlEndChar - charater used to end escaped names (default is ']')
 *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
 *                                  - default is ['table-alias', 'column-alias']
 */
export default  class SqlQuery {
    constructor (options) {
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
    genSql (decryptFunction, maskFunction) {
        //var self = this;

        if (this.From && this.From.length < 1) {
            throw {location: 'toSql', message: 'No FROM in query'};
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
                if ( c.Grouped ) {
                    groupBy.push(sprintf('(%s)', c.Literal));
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

                if ( c.Grouped ) {
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

        var select = sprintf('SELECT%s%s', (this.topCount ? ' TOP ' + this.topCount : ''), (this.Distinct ? ' DISTINCT' : '')) + columns
        + '\nFROM' + from + join;

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
