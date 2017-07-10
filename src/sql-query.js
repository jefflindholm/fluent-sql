// @flow
import './string.js';

import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlOrder from './sql-order';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs } from './helpers';

type EscapeLevel = 'table-alias' | 'column-alias';
type OptionType = {
    sqlStartChar: string,
    sqlEndChar: string,
    escapeLevel: Array<EscapeLevel>,
    namedValues: boolean,
    namedValueMarker: string,
};
type SqlStatement = {
    fetchSql: ?string,
    countSql: ?string | null,
    hasEncrypted: boolean,
    values: any,
};

let defaultOptions: OptionType = {
    sqlStartChar: '[',
    sqlEndChar: ']',
    escapeLevel: [
        'table-alias',
        'column-alias'
    ],
    namedValues: true,
    namedValueMarker: ':',
};
export function setDefaultOptions(options: OptionType): void {
    defaultOptions = Object.assign({}, defaultOptions, options);
}
export function getDefaultOptions(): OptionType {
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
export default class SqlQuery {
    _Options: OptionType;
    _Columns: Array<SqlColumn>
    _From: Array<SqlTable>;
    _Joins: Array<SqlJoin>;
    _Wheres: Array<SqlWhere>;
    _OrderBy: Array<SqlColumn>;
    _GroupBy: Array<SqlColumn>;
    _Having: Array<SqlWhere>;
    _VariableCount: number;
    _PageNo: number;
    _ItemsPerPage: number;
    _TopCount: number;
    _Distinct: boolean;
    BuildWherePart: (wa: Array<SqlWhere>, v: Array<any>, c: 'or' | 'and' | null) => string;

    constructor(options: SqlQuery | OptionType) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlQuery(options);
        }

        if (options instanceof SqlQuery) {
            this._Options = options._Options;
        } else {
            this._Options = Object.assign({}, defaultOptions, options);
        }

        this._Columns = [];
        this._From = [];
        this._Joins = [];
        this._Wheres = [];
        this._OrderBy = [];
        this._GroupBy = [];
        this._Having = [];
        this._VariableCount = 0;

        /**
         * @return {string}
         */
        this.BuildWherePart = (whereArray: Array<SqlWhere>, values: Array<any>, conjunction: 'or' | 'and' | null) => {
            let sql = '';
            let data;
            whereArray.forEach( (where, idx) => {
                if (idx !== 0) {
                    sql += `\n${(conjunction || '').toUpperCase()} `;
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
                        if ((!where.Value) && where.Value !== 0 && where.Value !== false) {
                            piece = `${where.Column.qualifiedName(this)} ${where.Op}`;
                        } else {
                            let data;
                            piece = `${where.Column.qualifiedName(this)} ${where.Op}`;
                            if ( !this._Options.namedValues ) {
                                data = where.Value;
                                piece += ' ? ';
                            } else {
                                const varName = where.Column.ColumnName + this._VariableCount++;
                                piece += ` (${this._Options.namedValueMarker}${varName})`;
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
                    const sub = this.BuildWherePart(where.Wheres, values, where.Type);
                    if (sub && sub.length > 1) {
                        sql += `(${sub})`;
                    }
                }
            }, this);
            return sql;
        };
    }
    /* eslint-disable brace-style */
    get Columns(): Array<SqlColumn> { return this._Columns; }
    set Columns(v: Array<SqlColumn>) { this._Columns = v; }
    get From(): Array<SqlTable> { return this._From; }
    set From(v: Array<SqlTable>) { this._From = v; }
    get Joins(): Array<SqlJoin> { return this._Joins; }
    set Joins(v: Array<SqlJoin>) { this._Joins = v; }
    get Wheres(): Array<SqlWhere> { return this._Wheres; }
    set Wheres(v: Array<SqlWhere>) { this._Wheres = v; }
    get OrderBy(): Array<SqlColumn> { return this._OrderBy; }
    set OrderBy(v: Array<SqlColumn>) { this._OrderBy = v; }
    get Having(): Array<SqlWhere> { return this._Having; }
    set Having(v: Array<SqlWhere>) { this._Having = v; }

    /* eslint-enable brace-style */
    sqlEscape = (str: string, level: 'table-alias' | 'column-alias') => {
        if ((level && this._Options.escapeLevel.indexOf(level) > -1) || !level) {
            return this._Options.sqlStartChar + str + this._Options.sqlEndChar;
        }
        return str;
    };

    page = (page: number): SqlQuery => {
        this._PageNo = page;
        return this;
    };
    pageSize = (pageSize: number): SqlQuery => {
        this._ItemsPerPage = pageSize;
        return this;
    };
    top = (val: number): SqlQuery => {
        this._TopCount = val;
        return this;
    };
    // addColumns = (...args: Array<SqlColumn | Array<SqlColumn>>) => {
    //     args.forEach((a) => {
    //         if (a instanceof SqlColumn) {
    //             this._Columns.push(a);
    //         } else {
    //             this._Columns.push.apply(this._Columns, a);
    //         }
    //     });
    // }

    addColumns = (...args) => {
        processArgs(v => {
            this._Columns.push(v);
        }, ...args); // eslint-disable-line brace-style
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
    applyOrder = (defaultSqlTable: SqlTable, orderString: string, overrides: {[string]: Array<SqlColumn>}) => {
        if (orderString) {
            let col: string;
            let table: SqlTable;
            let parts: Array<string>;
            let dir: string;
            orderString.split(',').forEach( (o) => {
                parts = o.trim().split(' ');
                dir = parts.length > 1 ? parts[1] : 'ASC';
                parts = parts[0].split('.');
                if (parts.length > 1) {
                    // $FlowFixMe
                    col = parts[1].toSnakeCase();
                    // $FlowFixMe
                    table = new SqlTable({ TableName: parts[0].toSnakeCase() });
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
                        throw { // eslint-disable-line
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
    select = (...args: Array<any>): SqlQuery => {
        const query = args[0];
        if (query.Columns) {
            query.Columns.forEach( (c) => {
                this.Columns.push(new SqlColumn(c));
            });
        } else {
            processArgs(a => { this.Columns.push(new SqlColumn(a)); }, ...args); // eslint-disable-line brace-style
        }
        return this;
    };
    from = (sqlTable: SqlTable): SqlQuery => {
        if (!(sqlTable instanceof SqlTable)) {
            throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' }; //eslint-disable-line
        }
        this.From.push(sqlTable);
        return this;
    };
    join = (joinClause: SqlJoin): SqlQuery => {
        if (!(joinClause instanceof SqlJoin)) {
            throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' }; // eslint-disable-line
        }
        this.Joins.push(joinClause);
        return this;
    };
    left = (joinClause: SqlJoin): SqlQuery => {
        joinClause.Left = true; // eslint-disable-line no-param-reassign
        return this.join(joinClause);
    };
    right = (joinClause: SqlJoin): SqlQuery => {
        joinClause.Right = true; // eslint-disable-line no-param-reassign
        return this.join(joinClause);
    };
    where = (whereClause: SqlWhere): SqlQuery => {
        this.Wheres.push(whereClause);
        return this;
    };
    having = (whereClause: SqlWhere): SqlQuery => {
        this.Having.push(whereClause);
        return this;
    };
    orderBy = (...args: Array<SqlOrder>): SqlQuery => {
        processArgs(v => { this.OrderBy.push(new SqlOrder(v)); }, ...args); // eslint-disable-line brace-style
        return this;
    };
    distinct = (): SqlQuery => {
        this._Distinct = true;
        return this;
    };
    removeColumn = (sqlColumn: SqlColumn): SqlQuery => {
        const array = this.Columns;
        for (let i = 0; i < array.length; i++) {
            if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
                array.splice(i, 1);
            }
        }
        return this;
    };
    updateAlias = (sqlColumn: SqlColumn, newAlias: string): SqlQuery => {
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
    genSql = (decryptFunction: (SqlColumn, boolean) => ?string, maskFunction: (SqlColumn, string) => ?string): SqlStatement => {
        if (this.From && this.From.length < 1) {
            throw { location: 'toSql', message: 'No FROM in query' }; // eslint-disable-line
        }

        const sql: SqlStatement = {
            fetchSql: '',
            countSql: undefined,
            hasEncrypted: false,
            values: {},
        };
        const values = [];
        const groupBy = [];
        let columns = '';
        let orderString: string = '';
        let data: any;
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
                if (c.Aggregate.groupBy) {
                    groupBy.push(c.Aggregate.groupBy.qualifiedName(this));
                }
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
            // $FlowFixMe
            from += `${(idx > 0 ? ',' : '')}\n${f.getTable()} as ${f.Alias.sqlEscape(this, 'table-alias')}`;
        }, this);
        let join = '';
        this.Joins.forEach((j) => {
            const type = j.Left ? 'LEFT ' : (j.Right ? 'RIGHT ' : ''); // eslint-disable-line no-nested-ternary
            const from = j.From.Table.getTable();
            const alias = j.From.Table.Alias.sqlEscape(this, 'table-alias');
            const fromCol = j.From.ColumnName;
            const to = j.To.Table.Alias.sqlEscape(this, 'table-alias');
            const toCol = j.To.ColumnName;
            join += `\n${type}JOIN ${from} as ${alias} on ${alias}.${fromCol} = ${to}.${toCol}`
        }, this);

        const where = this.BuildWherePart(this.Wheres, values, 'and');

        const having = this.BuildWherePart(this.Having, values, 'and');

        const top = (this._TopCount ? ` TOP ${this._TopCount}` : '');
        let select = `SELECT${top}${(this._Distinct ? ' DISTINCT' : '')}${columns}\nFROM${from}${join}`;

        if (where && where !== '') {
            select += `\nWHERE ${where}`;
        }
        if (groupBy.length > 0) {
            select += `\nGROUP BY ${groupBy.join()}`;
        }
        if (having && having !== '') {
            select += `\nHAVING ${having}`;
        }

        let page = this._PageNo;
        let pageSize = this._ItemsPerPage;

        if (page && !pageSize) {
            pageSize = 50;
        }
        if (pageSize && !page) {
            page = 1;
        }

        let countSql:string;
        let fetchSql = '';
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
        if ( !this._Options.namedValues ) {
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
