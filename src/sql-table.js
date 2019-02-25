import './string.js';
import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlQuery, { getDefaultOptions } from './sql-query';

export default class SqlTable {
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
  constructor(...args) {
    if (!new.target) {
      return new SqlTable(...args);
    }
    let columns;
    let alias;
    if (typeof args[0] === 'string') {
      this.TableName = args[0];
      if (args.length > 1) {
        columns = args[1];
      }
    } else {
      alias = args[1];
      this.TableName = args[0].TableName || args[0].name;
      columns = args[0].Columns || args[0].columns;
    }
    this.Alias = alias || this.TableName;
    this.Columns = [];
    if (columns) {
      columns.forEach(function(c) {
        const name = c.ColumnName || c.name;
        const prop = name.toCamel();
        const col = new SqlColumn(this, name, c.Literal);
        this.Columns.push(col);
        this[prop] = col;
      }, this);
    }
  }
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
    return this._alias;
  }
  set Alias(v) {
    this._alias = v;
  }
  get Columns() {
    return this._columns;
  }
  set Columns(v) {
    this._columns = v;
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
  as(alias) {
    const table = new SqlTable(this, alias);
    table.Alias = alias;
    return table;
  }
  join(joinClause) {
    const query = new SqlQuery();
    query.join(joinClause);
    return query;
  }
  left(joinClause) {
    const query = new SqlQuery();
    query.left(joinClause);
    return query;
  }
  right(joinClause) {
    const query = new SqlQuery();
    query.right(joinClause);
    return query;
  }
  on(sqlColumn) {
    if (sqlColumn.Table !== this) {
      throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' }; //eslint-disable-line
    }
    return new SqlJoin(sqlColumn);
  }
  where(whereClause) {
    const query = new SqlQuery();
    query.where(whereClause);
    return query;
  }
  star() {
    return this;
  }

  insert(data, options = {}) {
    const id = options.id || 'id';
    const dialect = options.dialect || getDefaultOptions().dialect;
    const columns = [];
    const values = {};
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
    let sql;
    if (dialect === 'MS') {
      sql = `INSERT INTO ${this.TableName} (${columnString}) OUTPUT Inserted.${id} VALUES (${valueString})`;
    } else if (dialect === 'pg') {
      sql = `INSERT INTO ${this.TableName} (${columnString}) VALUES (${valueString}) RETURNING ${id}`;
    } else {
      sql = `INSERT INTO ${this.TableName} (${columnString}) VALUES (${valueString})`;
    }
    return { sql, values };
  }

  update(data, options = {}) {
    const id = options.id || 'id';
    const keyData = {};
    const values = {};

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
