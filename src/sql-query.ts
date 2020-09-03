import './string.extensions';

import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlOrder from './sql-order';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs, SqlError } from './helpers';
import { truncate } from 'fs';
import { BaseQuery, eEscapeLevels, BaseTable } from './base-sql';

export interface DbOptions {
  sqlStartChar: string;
  sqlEndChar: string;
  escapeLevel: eEscapeLevels[];
  namedValues: boolean;
  namedValueMarker: string;
  markerType: string;
  dialect: string;
  recordSetPaging: boolean;
}
export const postgresOptions: DbOptions = {
  sqlStartChar: '"',
  sqlEndChar: '"',
  namedValues: true,
  namedValueMarker: '$',
  markerType: 'number',
  dialect: 'pg',
  recordSetPaging: false,
  escapeLevel: [eEscapeLevels.table, eEscapeLevels.column],
};
export const sqlServerOptions: DbOptions = {
  sqlStartChar: '[',
  sqlEndChar: ']',
  escapeLevel: [eEscapeLevels.table, eEscapeLevels.column],
  namedValues: true,
  namedValueMarker: ':',
  markerType: 'name',
  dialect: 'MS',
  recordSetPaging: false,
};

let defaultOptions = { ...sqlServerOptions };

export function setDefaultOptions(options: DbOptions, display = false) {
  if (display) console.log('options', options);
  defaultOptions = { ...defaultOptions, ...options };
  if (display) console.log('new defaults', defaultOptions);
}
export function getDefaultOptions() {
  return defaultOptions;
}
export function setPostgres() {
  setDefaultOptions(postgresOptions);
}
export function setSqlServer() {
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
export default class SqlQuery implements BaseQuery {

  constructor(options: DbOptions | SqlQuery | null = null) {
    if (options instanceof SqlQuery) {
      this._options = options.Options;
    } else {
      this._options = Object.assign({}, defaultOptions, options);
    }

    this._columns = [];
    this._from = [];
    this._joins = [];
    this._wheres = [];
    this._orderBy = [];
    this._groupBy = [];
    this._having = [];
    this._variableCount = 0;

    /**
     * @return {string}
     */
  }
  _options: DbOptions;
  _columns: SqlColumn[];
  _from: BaseTable[];
  _joins: SqlJoin[];
  _wheres: SqlWhere[];
  _orderBy: SqlOrder[];
  _groupBy: SqlColumn[];
  _having: SqlWhere[];
  _distinct: boolean = false;
  _variableCount: number;

  _offsetCount: number|null = null;
  _pageNo: number|null = null;
  _takeCount: number|null = null;

  get Distinct() { return this._distinct; }
  set Distinct(v) { this._distinct = v; }
  get Options() { return this._options; }
  set Options(v) { this._options = v; }
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

  buildWherePart(whereArray: SqlWhere[], values: any[], conjunction: string) {
    let sql = '';
    let data: any;
    whereArray.forEach((where, idx) => {
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
          if (where.Op === 'IS NULL' || where.Op === 'IS NOT NULL') {
            //if ((!where.Value) && where.Value !== 0 && where.Value !== false && where.Value !== '') {
            piece = `${where.Column.qualifiedName(this)} ${where.Op}`;
          } else {
            let data:any;
            piece = `${where.Column.qualifiedName(this)} ${where.Op}`;
            if (!this._options.namedValues || this._options.markerType === 'number') {
              data = where.Value;
              if (this._options.markerType === 'number') {
                piece += ` (${this._options.namedValueMarker}${values.length + 1})`;
              } else {
                piece += ' ? ';
              }
            } else {
              if (!where.Column || !where.Column.ColumnName) {
                throw new SqlError('SqlQuery::buildWhere', 'Where column is null or the column name is null');
              } else {
                const varName = where.Column.ColumnName + this._variableCount++;
                piece += ` (${this._options.namedValueMarker}${varName})`;
                data = {};
                data[varName] = where.Value;
              }
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
        const sub = this.buildWherePart(where.Wheres, values, where.type || 'and');
        if (sub && sub.length > 1) {
          sql += `(${sub})`;
        }
      }
    }, this);
    return sql;
  }

  /* eslint-enable brace-style */
  sqlEscape(str: string, level: eEscapeLevels | null = null) {
    if ((level && this._options.escapeLevel.indexOf(level) > -1) || !level) {
      return this._options.sqlStartChar + str + this._options.sqlEndChar;
    }
    return str;
  }

  // paging and offset
  page(page: number) {
    if (this._offsetCount) {
      throw new SqlError('sql-query:page', `Can't set page and an offset or skip value`);
    }
    this._pageNo = page;
    return this;
  }
  offset(count: number) {
    if (this._pageNo) {
      throw new SqlError('sql-query:offset', `Can't set offset or skip value when you have set a page number`);
    }
    this._offsetCount = count;
    return this;
  }
  skip(count: number) {
    if (this._pageNo) {
      throw new SqlError('sql-query:skip', `Can't set offset or skip value when you have set a page number`);
    }
    this._offsetCount = count;
    return this;
  }
  // these are all "TAKE" style settings
  pageSize(pageSize: number) {
    this._takeCount = pageSize;
    if (!this._pageNo) {
      this._pageNo = 1;
    }
    return this;
  }
  top(val: number) {
    this._takeCount = val;
    return this;
  }
  take(count: number) {
    this._takeCount = count;
    return this;
  }
  limit(count: number) {
    this._takeCount = count;
    return this;
  }

  addColumns(...args: any) {
    processArgs((v: any) => {
      this.Columns.push(v);
    }, ...args); // eslint-disable-line brace-style
    return this;
  }
  /*
   * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
   * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
   * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
   *                         or you are using a function but want to order by its parameters
   *                         example: you are selecting buildFullNameFunc(first, last, middle) and don't want to order by the function also, use
   *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
   */
  applyOrder(defaultSqlTable: BaseTable, orderString: string, overrides: any) {
    if (!(defaultSqlTable instanceof SqlTable)) {
      throw new SqlError('SqlQuery::applyOrder', 'defaultSqlTable is not an instance of SqlTable');
    }
    if (orderString) {
      let col;
      let table;
      let parts;
      let dir: string;
      orderString.split(',').forEach(o => {
        parts = o.trim().split(' ');
        dir = parts.length > 1 ? parts[1] : 'ASC';
        parts = parts[0].split('.');
        if (parts.length > 1) {
          col = parts[1].toSnakeCase();
          table = new SqlTable(parts[0].toSnakeCase(), [], '');
        } else {
          col = parts[0];
          table = defaultSqlTable;
        }

        if (overrides && overrides.hasOwnProperty(col)) {
          overrides[col].forEach((overCol: SqlColumn) => {
            this.orderBy(overCol.dir(dir));
          });
        } else {
          if (!(defaultSqlTable instanceof SqlTable)) {
            throw {
              // eslint-disable-line
              location: 'SqlQuery::applyOrder',
              message: 'defaultSqlTable is not an instance of SqlTable',
            };
          }
          this.orderBy(SqlColumn.create({ table, name: col }).dir(dir));
        }
      });
    }
    return this;
  }
  select(...args: any) {
    const query = args[0];
    if (query.Columns) {
      query.Columns.forEach((c: SqlColumn) => {
        this.Columns.push(SqlColumn.create({ column: c }));
      });
    } else {
      processArgs((a: any) => {
        this.Columns.push(SqlColumn.create({column: a}));
      }, ...args); // eslint-disable-line brace-style
    }
    return this;
  }
  from(sqlTable: BaseTable) {
    if (!(sqlTable instanceof SqlTable)) {
      throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' }; //eslint-disable-line
    }
    this.From.push(sqlTable);
    return this;
  }
  join(joinClause: SqlJoin) {
    if (!(joinClause instanceof SqlJoin)) {
      throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' }; // eslint-disable-line
    }
    this.Joins.push(joinClause);
    return this;
  }
  left(joinClause: SqlJoin) {
    joinClause.Left = true; // eslint-disable-line no-param-reassign
    return this.join(joinClause);
  }
  right(joinClause: SqlJoin) {
    joinClause.Right = true; // eslint-disable-line no-param-reassign
    return this.join(joinClause);
  }
  where(whereClause: SqlWhere) {
    this.Wheres.push(whereClause);
    return this;
  }
  having(whereClause: SqlWhere) {
    this.Having.push(whereClause);
    return this;
  }
  orderBy(...args: any) {
    processArgs((v: any) => {
      this.OrderBy.push(new SqlOrder(v));
    }, ...args); // eslint-disable-line brace-style
    return this;
  }
  distinct() {
    this.Distinct = true;
    return this;
  }
  removeColumn(sqlColumn: SqlColumn) {
    const array = this.Columns;
    for (let i = 0; i < array.length; i++) {
      if (
        array[i].ColumnName === sqlColumn.ColumnName &&
        array[i].TableName === sqlColumn.TableName &&
        array[i].Alias === sqlColumn.Alias
      ) {
        array.splice(i, 1);
      }
    }
    return this;
  }
  updateAlias(sqlColumn: SqlColumn, newAlias: string) {
    const array = this.Columns;
    for (let i = 0; i < array.length; i++) {
      if (
        array[i].ColumnName === sqlColumn.ColumnName &&
        array[i].TableName === sqlColumn.TableName &&
        array[i].Alias === sqlColumn.Alias
      ) {
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

  genSql(decryptFunction: any = null, maskFunction: any = null) {
    if (this.From && this.From.length < 1) {
      throw { location: 'toSql', message: 'No FROM in query' }; // eslint-disable-line
    }

    // OLD SCHOOL PAGING CODE
    /*
     */

    const sql:any = {};
    const values:any[] = [];
    const groupBy:string[] = [];
    let columns = '';
    let orderString: string;
    let data: any;
    let hasEncrypted = false;
    this.Columns.forEach((c, idx) => {
      if (c.Literal) {
        if (!c.Alias) {
          throw new SqlError('SqlQuery::genSql', `Literal exists with no Alias ${c.Literal}`);
        }
        columns += `${idx > 0 ? ',' : ''}\n(${c.Literal}) as ${c.Alias.sqlEscape(this, 'column-alias')}`;
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
        if (!c.Alias) {
          throw new SqlError('SqlQuery::genSql', `Aggregate exists with no Alias ${c.Aggregate.operation}`);
        }

        let literal = decryptFunction ? decryptFunction(c, true) : null;
        hasEncrypted = literal !== null;
        literal = literal || c.qualifiedName(this);
        columns += `${idx > 0 ? ',' : ''}\n${c.Aggregate.operation}(${literal}) as ${c.Alias.sqlEscape(
          this,
          'column-alias',
        )}`;
        if (c.Aggregate.groupBy) {
          groupBy.push(c.Aggregate.groupBy.qualifiedName(this));
        }
      } else {
        if (!c.Alias) {
          throw new SqlError('SqlQuery::genSql', 'Column exists with no Alias - which also means no ColumnName');
        }
        let literal = decryptFunction ? decryptFunction(c, true) : null;
        hasEncrypted = literal !== null;
        literal = literal || c.qualifiedName(this);
        if (maskFunction) {
          literal = maskFunction(c, literal) || literal;
        }

        columns += `${idx > 0 ? ',' : ''}\n${literal} as ${c.Alias.sqlEscape(this, 'column-alias')}`;

        if (!orderString) {
          orderString = c.Alias.sqlEscape(this, 'column-alias');
        }

        if (c.Grouped) {
          groupBy.push(literal);
        }
      }
    }, this);
    let from = '';
    this.From.forEach((f, idx) => {
      from += `${idx > 0 ? ',' : ''}\n${f.getTable()} as ${f.Alias.sqlEscape(this, 'table-alias')}`;
    }, this);
    let join = '';
    this.Joins.forEach(j => {
      if (!j.To || !j.To.Table) {
        throw new SqlError('SqlQuery::genSql', 'Join does not have a "To" value');
      }
      if (!j.From.Table) {
        throw new SqlError('SqlQuery::genSql', 'Join "From" does not have a value');
      }
      const type = j.Left ? 'LEFT ' : j.Right ? 'RIGHT ' : ''; // eslint-disable-line no-nested-ternary
      const from = j.From.Table.getTable();
      const alias = j.From.Table.Alias.sqlEscape(this, 'table-alias');
      const fromCol = j.From.ColumnName;
      const to = j.To.Table.Alias.sqlEscape(this, 'table-alias');
      const toCol = j.To.ColumnName;
      join += `\n${type}JOIN ${from} as ${alias} on ${alias}.${fromCol} = ${to}.${toCol}`;
    }, this);

    const where = this.buildWherePart(this.Wheres, values, 'and');

    const having = this.buildWherePart(this.Having, values, 'and');

    if (this._pageNo && !this._takeCount) {
      this._takeCount = 50;
    }

    let select;
    let limit = '';
    if (this._pageNo) {
      select = `SELECT${this.Distinct ? ' DISTINCT' : ''}${columns}\nFROM${from}${join}`;
      if (this._options.recordSetPaging) {
        // do nothing
      } else if (this._options.dialect === 'MS') {
        limit = `OFFSET ${(this._pageNo - 1) * (this._takeCount || 25)} ROWS\nFETCH NEXT ${this._takeCount} ROWS ONLY`;
      } else {
        // if (this._options.dialect === 'pg') {
        limit = `LIMIT ${this._takeCount} OFFSET ${(this._pageNo - 1) * (this._takeCount || 25)}`;
      }
    } else if (this._takeCount) {
      if (this._options.dialect === 'MS') {
        select = `SELECT TOP ${this._takeCount}${this.Distinct ? ' DISTINCT' : ''}${columns}\nFROM${from}${join}`;
        limit = '';
      } else {
        // if (this._options.dialect === 'pg') {
        select = `SELECT${this.Distinct ? ' DISTINCT' : ''}${columns}\nFROM${from}${join}`;
        limit = `LIMIT ${this._takeCount}`;
      }
    } else {
      select = `SELECT${this.Distinct ? ' DISTINCT' : ''}${columns}\nFROM${from}${join}`;
    }
    if (where && where !== '') {
      select += `\nWHERE ${where}`;
    }
    if (groupBy.length > 0) {
      select += `\nGROUP BY ${groupBy.join()}`;
    }
    if (having && having !== '') {
      select += `\nHAVING ${having}`;
    }

    let countSql;
    let fetchSql;
    let order = '';
    if (this._pageNo) {
      countSql = `SELECT count(*) as RecordCount FROM (\n${select}\n) count_tbl`;
      if (!this.OrderBy || this.OrderBy.length < 1) {
        // order by the first column in the select
        this.orderBy(this.Columns[0]);
      }
    }

    if (this.OrderBy && this.OrderBy.length > 0) {
      this.OrderBy.forEach((o, idx) => {
        order += `${idx > 0 ? ',' : ''}${o.Column.qualifiedName(this)} ${o.Direction}`;
      }, this);
    }

    if (this._pageNo && this._options.recordSetPaging) {
      const pageOrder = this.OrderBy.map(o => `${o.Column.ColumnName} ${o.Direction}`).join(', ');

      fetchSql = `SELECT * FROM (
SELECT *, row_number() OVER (ORDER BY ${pageOrder}) as Paging_RowNumber FROM (
${select}
) base_query
) as detail_query WHERE Paging_RowNumber BETWEEN ${(this._pageNo - 1) * (this._takeCount || 25)} AND ${this._takeCount}`;
    } else {
      if (order) {
        select += `\nORDER BY ${order}`;
      }

      if (limit) {
        fetchSql = `${select}\n${limit}`;
      } else {
        fetchSql = select;
      }
    }

    sql.fetchSql = fetchSql;
    sql.countSql = countSql;
    sql.hasEncrypted = hasEncrypted;

    if (!this._options.namedValues || this._options.markerType === 'number') {
      sql.values = values;
    } else {
      sql.values = {};
      values.forEach(v => {
        for (const attr in v) {
          if (v.hasOwnProperty(attr)) {
            sql.values[attr] = v[attr];
          }
        }
      });
    }

    return sql;
  }
  create() {
    return new SqlQuery(null);
  }
}
function CreateSqlQuery() {
  return new SqlQuery(null);
}

String.prototype.sqlEscape = function escape(sqlQuery?: any, level?: any) {
  let query = null;
  if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== 'function') {
    return CreateSqlQuery().sqlEscape(this as string, null);
  } else {
    query = sqlQuery;
  }
  return query.sqlEscape(this, level);
};
