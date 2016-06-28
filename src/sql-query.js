import './string.js';

import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlOrder from './sql-order';
import SqlTable from './sql-table';
//import SqlWhere from './sql-where';
import { processArgs } from './helpers';

let defaultOptions = {
    sqlStartChar: '[',
    sqlEndChar: ']',
    escapeLevel: ['table-alias', 'column-alias'],
    namedValues: true,
    namedValueMarker: ':',
};
export function setDefaultOptions(options) {
    defaultOptions = Object.assign({}, defaultOptions, options);
}
export function getDefaultOptions() {
    return defaultOptions;
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
export default  class SqlQuery {
    constructor (options) {
        if (!new.target) {
            return new SqlQuery(options);
        }

        if (options instanceof SqlQuery) {
            this.options = options.options;
        } else  {
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
        this.BuildWherePart = (whereArray, values, conjunction) => {
            let sql = '';
            let data;
            whereArray.forEach(function (where, idx) {
                if (idx !== 0) {
                    sql += `\n${conjunction.toUpperCase()} `;
                }
                let piece = '';
                if (where.Column) {
                    if (where.Value && where.Value.Literal) {
                        piece = `${where.Column.qualifiedName(this)} ${where.Op} (${where.Value.Literal})`;
                        if (where.Value.Values) {
                            for (const attr in where.Value.Values) {
                                if (where.Value.Values.hasOwnProperty(attr)) {
                                    data = {};
                                    data[attr] = where.Value.Values[attr];
                                    values.push(data);
                                }
                            }
                        }
                    } else if (where.Value && where.Value.Table) {
                        piece = `${where.Column.qualifiedName(this)} ${where.Op} (${where.Value.qualifiedName(this)})`;
                    } else {
                        if (!where.Value) {
                            piece = `${where.Column.qualifiedName(this)} ${where.Op}`;
                        } else {
                            let data;
                            piece = `${where.Column.qualifiedName(this)} ${where.Op}`;
                            if ( !this.options.namedValues ) {
                                data = where.Value;
                                piece += ' ? ';
                            } else {
                                const varName = where.Column.ColumnName + this.variableCount++;
                                piece += ` (${this.options.namedValueMarker}${varName})`;
                                data = {};
                                data[varName] = where.Value;
                            }
                            values.push(data);
                        }
                    }
                    if (where.Column.Not) {
                        sql += `NOT (${piece})`;
                    } else {
                        sql += piece;
                    }
                }
                if (where.Wheres && where.Wheres.length > 0) {
                    const sub = this.BuildWherePart(where.Wheres, values, where.type);
                    if (sub && sub.length > 1) {
                        sql += `(${sub})`;
                    }
                }
            }, this);
            return sql;
        };
    };
    /* eslint-disable brace-style */
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
    /* eslint-enable brace-style */
    sqlEscape = (str, level) => {
        if ((level && this.options.escapeLevel.indexOf(level) > -1) || !level) {
            return this.options.sqlStartChar + str + this.options.sqlEndChar;
        } else {
            return str;
        }
    };
    page = (page) => {
        this.pageNo = page;
        return this;
    };
    pageSize = (pageSize) => {
        this.itemsPerPage = pageSize;
        return this;
    };
    top = (val) => {
        this.topCount = val;
        return this;
    };
    addColumns = (...args) => {
        processArgs(v => {this.Columns.push(v)}, ...args); // eslint-disable-line brace-style
        return this;
    };
    /*
     * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
     * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
     * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
     *                         or you are using a function but want to order by its parameters
     *                         example: you are selecting buildFullNameFunc(first, last, middle) and dont want to order by the function also, use
     *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
     */
    applyOrder = (defaultSqlTable, orderString, overrides) => {
        if (orderString) {
            let col;
            let table;
            let parts;
            let dir;
            orderString.split(',').forEach( (o) => {
                parts = o.trim().split(' ');
                dir = parts.length > 1 ? parts[1] : 'ASC';
                parts = parts[0].split('.');
                if (parts.length > 1) {
                    col = parts[1].toSnakeCase();
                    table = new SqlTable({TableName: parts[0].toSnakeCase()});
                } else {
                    col = parts[0];
                    table = defaultSqlTable;
                }

                if (overrides && overrides.hasOwnProperty(col)) {
                    overrides[col].forEach((overCol) => {
                        this.orderBy(overCol.dir(dir));
                    });
                } else {
                    if (!(defaultSqlTable instanceof SqlTable)) {
                        throw {
                            location: 'SqlQuery::applyOrder',
                            message: 'defaultSqlTable is not an instance of SqlTable',
                        };
                    }
                    this.orderBy((new SqlColumn(table, col)).dir(dir));
                }
            });
        }
        return this;
    };
    select = (...args) => {
        const query = args[0];
        if (query.Columns) {
            query.Columns.forEach( (c) => {
                this.Columns.push(new SqlColumn(c));
            });
        } else {
            processArgs(a => {this.Columns.push(new SqlColumn(a))}, ...args); // eslint-disable-line brace-style
        }
        return this;
    };
    from = (sqlTable) => {
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlQuery::from', message: 'from clause must be a SqlTable'};
        }
        this.From.push(sqlTable);
        return this;
    };
    join = (joinClause) => {
        if (!(joinClause instanceof SqlJoin)) {
            throw {location: 'SqlQuery::join', message: 'clause is not a SqlJoin'};
        }
        this.Joins.push(joinClause);
        return this;
    };
    left = (joinClause) => {
        joinClause.Left = true; // eslint-disable-line no-param-reassign
        return this.join(joinClause);
    };
    right = (joinClause) => {
        joinClause.Right = true; // eslint-disable-line no-param-reassign
        return this.join(joinClause);
    };
    where = (whereClause) => {
        this.Wheres.push(whereClause);
        return this;
    };
    having = (whereClause) => {
        this.Having.push(whereClause);
        return this;
    };
    orderBy = (...args) => {
        processArgs(v => {this.OrderBy.push(new SqlOrder(v))}, ...args); // eslint-disable-line brace-style
        return this;
    };
    distinct = () => {
        this.Distinct = true;
        return this;
    };
    removeColumn = (sqlColumn) => {
        const array = this.Columns;
        for (let i = 0; i < array.length; i++) {
            if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                array.splice(i, 1);
            }
        }
        return this;
    };
    updateAlias = (sqlColumn, newAlias) => {
        const array = this.Columns;
        for (let i = 0; i < array.length; i++) {
            if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                array[i].Alias = newAlias;
                break;
            }
        }
        return this;
    };
    /*
     * Generates the SQL from the built up query
     * @param {decryptFunction} function that takes (SqlColumn, boolean - should this use the qualified name, usually true)
     *                           return null if not decrypted
     * @param {maskFunction} function that takes (SqlColumn, select term - this will include decryption from above)
     *                          return null if not replacement
     * @return { fetchSql, countSql, values, hasEncrypted }
     */
    genSql = (decryptFunction, maskFunction) => {

        if (this.From && this.From.length < 1) {
            throw {location: 'toSql', message: 'No FROM in query'};
        }

        const sql = {};
        const values = [];
        const groupBy = [];
        let columns = '';
        let orderString;
        let data;
        let hasEncrypted = false;
        this.Columns.forEach((c, idx) => {
            if (c.Literal) {
                columns += `${(idx > 0 ? ',' : '')}\n(${c.Literal}) as ${c.Alias.sqlEscape(this, 'column-alias')}`;
                // handle any columns that might have values
                if (c.Values) {
                    for (const attr in c.Values) {
                        if (c.Values.hasOwnProperty(attr)) {
                            data = {};
                            data[attr] = c.Values[attr];
                            values.push(data);
                        }
                    }
                }
                if (c.Grouped) {
                    groupBy.push(`(${c.Literal})`);
                }
            } else if (c.Aggregate) {
                let literal = decryptFunction ? decryptFunction(c, true) : null;
                hasEncrypted = literal !== null;
                literal = literal || c.qualifiedName(this);
                columns += `${(idx > 0 ? ',' : '')}\n${c.Aggregate.operation}(${literal}) as ${c.Alias.sqlEscape(this, 'column-alias')}`;
                groupBy.push(c.Aggregate.groupBy.qualifiedName(this));

            } else {
                let literal = decryptFunction ? decryptFunction(c, true) : null;
                hasEncrypted = literal !== null;
                literal = literal || c.qualifiedName(this);
                if (maskFunction) {
                    literal = maskFunction(c, literal) || literal;
                }

                columns += `${(idx > 0 ? ',' : '')}\n${literal} as ${c.Alias.sqlEscape(this, 'column-alias')}`;

                if (!orderString) {
                    orderString = c.Alias.sqlEscape(this, 'column-alias');
                }

                if ( c.Grouped ) {
                    groupBy.push(literal);
                }
            }
        }, this);
        let from = '';
        this.From.forEach((f, idx) => {
            from += `${(idx > 0 ? ',' : '')}\n${f.TableName} as ${f.Alias.sqlEscape(this, 'table-alias')}`;
        }, this);
        let join = '';
        this.Joins.forEach((j) => {
            const type = j.Left ? 'LEFT ' : (j.Right ? 'RIGHT ' : ''); // eslint-disable-line no-nested-ternary
            const from = j.From.Table.TableName;
            const alias = j.From.Table.Alias.sqlEscape(this, 'table-alias');
            const fromCol = j.From.ColumnName;
            const to = j.To.Table.Alias.sqlEscape(this, 'table-alias');
            const toCol = j.To.ColumnName;
            join += `\n${type}JOIN ${from} as ${alias} on ${alias}.${fromCol} = ${to}.${toCol}`
        }, this);

        const where = this.BuildWherePart(this.Wheres, values, 'and');

        const having = this.BuildWherePart(this.Having, values, 'and');

        const top = (this.topCount ? ` TOP ${this.topCount}` : '');
        let select = `SELECT${top}${(this.Distinct ? ' DISTINCT' : '')}${columns}\nFROM${from}${join}`;

        if (groupBy.length > 0) {
            select += `\nGROUP BY ${groupBy.join()}`;
        }
        if (having && having !== '') {
            select += `\nHAVING ${having}`;
        }
        if (where && where !== '') {
            select += `\nWHERE ${where}`;
        }

        let page = this.pageNo;
        let pageSize = this.itemsPerPage;

        if (page && !pageSize) {
            pageSize = 50;
        }
        if (pageSize && !page) {
            page = 1;
        }

        let countSql;
        let fetchSql;
        let order = '';
        if (page) {
            if (this.OrderBy && this.OrderBy.length > 0) {
                this.OrderBy.forEach( (o, idx) => {
                    // since we know we are going to be ordering over a select, we don't need a table
                    // in this, just use the column alias
                    order += `${(idx > 0 ? ',' : '')}${o.Column.Alias.sqlEscape(this, 'column-alias')} ${o.Direction}`;
                }, this);
                orderString = order;
            }
            countSql = `SELECT count(*) as RecordCount FROM (\n${select}\n) count_tbl`;
            const baseSql = `SELECT *, row_number() OVER (ORDER BY ${orderString}) as Paging_RowNumber FROM (\n${select}\n) base_query`;
            fetchSql = `SELECT * FROM (\n${baseSql}\n) as detail_query WHERE Paging_RowNumber BETWEEN ${(page - 1) * pageSize} AND ${page * pageSize}`;
        } else {
            this.OrderBy.forEach((o, idx) => {
                order += `${(idx > 0 ? ',' : '')}${o.Column.qualifiedName(this)} ${o.Direction}`;
            }, this);
            if (order && order !== '') {
                fetchSql = `${select}\nORDER BY ${order}`;
            } else {
                fetchSql = select;
            }
        }
        sql.fetchSql = fetchSql;
        sql.countSql = countSql;
        sql.hasEncrypted = hasEncrypted;
        if ( !this.options.namedValues ) {
            sql.values = values;
        } else {
            sql.values = {};
            values.forEach( (v) => {
                for (const attr in v) {
                    if (v.hasOwnProperty(attr)) {
                        sql.values[attr] = v[attr];
                    }
                }
            });
        }

        return sql;
    }
}
