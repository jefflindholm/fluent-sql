import './string.extensions';
import { BaseColumn, BaseTable } from './base-sql';
import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlQuery from './sql-query';
import SqlWhere from './sql-where';
import { SqlError } from './helpers';


export interface Options {
  id: string | null;
}

export default class SqlTable implements BaseTable {

  static create(table: SqlTable, alias?: string): BaseTable {
    return new SqlTable(table.TableName, table.Columns, table.Schema, alias);
  }
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
  constructor(name: any, columns?: BaseColumn[], schema?: string, alias?: string) {
    if (name instanceof SqlTable) {
      this._tableName = name.TableName;
      this._schema = name.Schema;
      this._alias = name.Alias;
      this.Columns = name.Columns;
    } else if ((name.TableName || name.name) && (name.Columns || name.columns)) {
      this._tableName = name.TableName || name.name;
      this.Columns = name.columns || name.Columns;
      this._schema = '';
    } else {
      this._tableName = name;
      this._schema = schema || '';
      this._alias = alias || this._tableName;
      if (columns) {
        this.Columns = columns;
      }
    }
  }
  private _schema: string;
  private _tableName: string;
  private _alias: string | null = null;
  private _columns: BaseColumn[] = [];
  /* eslint-disable brace-style */
  get Schema() {
    return this._schema;
  }
  set Schema(v) {
    this._schema = v;
  }
  get TableName() {
    return this._tableName;
  }
  set TableName(v) {
    this._tableName = v;
  }
  get Alias() {
    return this._alias || this._tableName;
  }
  set Alias(v) {
    this._alias = v;
  }
  get Columns() {
    return this._columns;
  }
  set Columns(v) {
    if (v) {
      v.forEach(c => {
        if (!c.ColumnName && !c.Alias && !c.name) {
          throw new SqlError('SqlTable::Columns(set)', 'setting a column without a name or alias');
        }
        const name = c.ColumnName || c.Alias || c.name || ''; // should never be blank but TS did not like it without
        const prop = name.toCamel();
        const col = new SqlColumn(this, name, c.Literal, undefined, undefined, undefined, undefined, c.Alias);
        this._columns.push(col);
        (this as BaseTable)[prop] = col;
      }, this);
    }
  }
  /* eslint-enable */

  getTable() {
    if (this.Schema) {
      return `${this.Schema}.${this.TableName}`;
    }
    return this.TableName;
  }
  getAlias() {
    return this.Alias || this.TableName;
  }
  as(alias: string) {
    const table = SqlTable.create(this, alias);
    table.Alias = alias;
    return table;
  }
  join(joinClause: SqlJoin) {
    const query = new SqlQuery(null);
    query.join(joinClause);
    return query;
  }
  left(joinClause: SqlJoin) {
    const query = new SqlQuery(null);
    query.left(joinClause);
    return query;
  }
  right(joinClause: SqlJoin) {
    const query = new SqlQuery(null);
    query.right(joinClause);
    return query;
  }
  on(sqlColumn: SqlColumn) {
    if (sqlColumn?.Table !== this) {
      throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' }; //eslint-disable-line
    }
    return new SqlJoin(sqlColumn);
  }
  where(whereClause: SqlWhere) {
    const query = new SqlQuery(null);
    query.where(whereClause);
    return query;
  }
  star() {
    return this;
  }

  insert(data: any, options: any) {
    const columns: BaseColumn[] = [];
    const values: any = {};
    Object.entries(data).forEach(([k, v]) => {
      for (let i = 0; i < this.Columns.length; i++) {
        const c = this.Columns[i];
        if (c.ColumnName === k || c.Alias === k) {
          columns.push(c);
          values[k] = v;
          break;
        }
      }
    });

    const columnString = columns.map(c => c.ColumnName).join(', ');
    const valueString = Object.keys(values)
      .map(k => `:${k}`)
      .join(', ');
    const sql = `INSERT INTO ${this.TableName} (${columnString}) VALUES (${valueString})`;
    return { sql, values };
  }

  update(data: any, options: Options = { id: null }) {
    const id = options.id || 'id';
    const keyData = {};
    const values: any = {};

    Object.entries(data).forEach(([k, v]) => {
      for (let i = 0; i < this.Columns.length; i++) {
        const c = this.Columns[i];
        if (c.ColumnName === k || c.Alias === k) {
          values[k] = v;
          break;
        }
      }
    });
    const columnString = Object.keys(data)
      .filter(k => k !== id)
      .map(k => `${k} = :${k}`)
      .join(', ');
    const keyString = `${id} = :${id}`;

    const sql = `UPDATE ${this.TableName} SET ${columnString} WHERE ${keyString}`;
    return { sql, values };
  }
}
