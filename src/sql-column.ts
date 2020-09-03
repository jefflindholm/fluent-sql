import './string.extensions';
import { BaseColumn, BaseTable } from './base-sql';
import SqlOrder from './sql-order';
import SqlQuery from './sql-query';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs, SqlError } from './helpers';

export class SqlAggregate {
  table: BaseTable;
  column: BaseColumn;
  operation: string;
  groupBy: BaseColumn | null = null;

  constructor(table: BaseTable, column: BaseColumn, operation: string) {
    this.table = table;
    this.column = column;
    this.operation = operation;
    this.column.Alias = `${this.column.Alias || this.column.ColumnName}_${operation.toLowerCase()}`;
  }
  on(sqlColumn: BaseColumn) {
    this.groupBy = sqlColumn;
    return this.column;
  }
  by(sqlColumn: BaseColumn) {
    return this.on(sqlColumn);
  }
}

export default class SqlColumn implements BaseColumn {

  static create({ column, alias, table, name, literal }: { column?: SqlColumn, alias?: string, table?: BaseTable, name?: string, literal?: string }): SqlColumn {
    if (column) {
      return new SqlColumn(column.Table, column.ColumnName, column.Literal, column.Not, column.Values, column.Aggregate, column.Grouped, alias || column.Alias);
    } else if (table && name) {
      return new SqlColumn(table, name);
    } else if (literal) {
      return new SqlColumn(null, undefined, literal, undefined, undefined, undefined, undefined, alias);
    }
    throw new SqlError('SqlColumn.create', 'no values to create a good column');
  }


  constructor(table: BaseTable | null, name?: string, literal?: string, not?: boolean, values?: string[], aggregate?: SqlAggregate, grouped?: boolean, alias?: string) {
    if (!(table instanceof SqlTable) && !literal) {
      throw new SqlError('SqlColumn::constructor', 'must construct using a SqlTable or literal');
    }
    this._table = table;
    this._columnName = name;
    this._literal = literal;
    this._not = not;
    this._values = values;
    this._aggregate = aggregate;
    this._grouped = grouped;
    this._alias = alias || (this._columnName && this._columnName.toCamel());
  }

  private _table: BaseTable | null;
  private _columnName: string | undefined;
  private _literal: string | undefined;
  private _alias: string | undefined;
  private _not: boolean | undefined;
  private _values: any | undefined = [];
  private _grouped: boolean | undefined;
  private _aggregate: SqlAggregate | undefined;

  // aggregate functions
  aggregate(op: string): SqlAggregate {
    const column: BaseColumn = SqlColumn.create({ column: this });
    if (column.Table) {
      column.Aggregate = new SqlAggregate(column.Table, column, op);
      return column.Aggregate;
    }
    throw new SqlError('SqlColumn::aggregate', 'column has null SqlTable');
  }
  avg() {
    return this.aggregate('AVG');
  }

  checksum() {
    return this.aggregate('CHECKSUM_AGG');
  }
  count() {
    return this.aggregate('COUNT');
  }
  countBig() {
    return this.aggregate('COUNT_BIG');
  }
  grouping() {
    return this.aggregate('GROUPING');
  }
  groupingId() {
    return this.aggregate('GROUPING_ID');
  }
  max() {
    return this.aggregate('MAX');
  }
  min() {
    return this.aggregate('MIN');
  }
  sum() {
    return this.aggregate('SUM');
  }
  stdev() {
    return this.aggregate('STDEV');
  }
  stdevp() {
    return this.aggregate('STDEVP');
  }
  // VAR
  varp() {
    return this.aggregate('VARP');
  }

  qualifiedName(sqlQuery: SqlQuery) {
    if (this.Literal) {
      return this.Literal;
    } else if (this.Table) {
      return `${this.Table.Alias.sqlEscape(sqlQuery, 'table-alias')}.${this.ColumnName}`;
    }
    throw new SqlError('SqlColumn::qualifiedName', 'Literal and Table cannot both be null in SqlQuery');
  }
  as(alias: string) {
    const col = SqlColumn.create({ column: this, alias });
    return col;
  }
  using(values: any) {
    const col = SqlColumn.create({ column: this, alias: this.Alias });
    col.Values = values;
    return col;
  }
  groupBy() {
    const col = SqlColumn.create({ column: this, alias: this.Alias });
    col._grouped = true;
    return col;
  }

  get TableName() {
    if (this.Table) {
      return this.Table.TableName;
    }
    throw new SqlError('SqlColumn::TableName', 'Table is NULL');
  }

  get Table() { return this._table; }
  set Table(v) { this._table = v; }
  get ColumnName() { return this._columnName; }
  set ColumnName(v) { this._columnName = v; }
  get Literal() { return this._literal; }
  set Literal(v) { this._literal = v; }
  get Alias() { return this._alias || this._columnName; }
  set Alias(v) { this._alias = v; }
  get Not() { return this._not; }
  set Not(v) { this._not = v; }
  get Values() { return this._values; }
  set Values(v) { this._values = v; }
  get Grouped() { return this._grouped; }
  set Grouped(v) { this._grouped = v; }
  get Aggregate() { return this._aggregate; }
  set Aggregate(v) { this._aggregate = v; }

  eq(val: any) {
    return new SqlWhere({ Column: this, Op: '=', Value: val, Wheres: [] });
  }
  ne(val: any) {
    return new SqlWhere({ Column: this, Op: '<>', Value: val, Wheres: [] });
  }
  gt(val: any) {
    return new SqlWhere({ Column: this, Op: '>', Value: val, Wheres: [] });
  }
  gte(val: any) {
    return new SqlWhere({ Column: this, Op: '>=', Value: val, Wheres: [] });
  }
  lt(val: any) {
    return new SqlWhere({ Column: this, Op: '<', Value: val, Wheres: [] });
  }
  isNull() {
    return new SqlWhere({ Column: this, Op: 'IS NULL', Value: null, Wheres: [] });
  }
  isNotNull() {
    return new SqlWhere({ Column: this, Op: 'IS NOT NULL', Value: null, Wheres: [] });
  }
  lte(val: any) {
    return new SqlWhere({ Column: this, Op: '<=', Value: val, Wheres: [] });
  }
  like(val: any) {
    let value = val;
    if (typeof value === 'string') {
      value = `%${value}%`;
    }
    return new SqlWhere({ Column: this, Op: 'like', Value: value, Wheres: [] });
  }
  starts(val: any) {
    let value = val;
    if (typeof value === 'string') {
      value = `${value}%`;
    }
    return new SqlWhere({ Column: this, Op: 'like', Value: value, Wheres: [] });
  }
  ends(val: any) {
    let value = val;
    if (typeof value === 'string') {
      value = `%${value}`;
    }
    return new SqlWhere({ Column: this, Op: 'like', Value: value, Wheres: [] });
  }
  in(...args: any) {
    const values: any = [];
    processArgs((v: any) => { values.push(v); }, ...args); // eslint-disable-line brace-style
    return new SqlWhere({ Column: this, Op: 'in', Value: values, Wheres: [] });
  }
  between(val1: any, val2: any) {
    return this.gte(val1).and(this.lte(val2));
  }
  op(op: string, val1: any, val2: any) {
    let o = op;
    if (!(this as BaseColumn)[o]) {
      o = o.toLowerCase();
    }
    return (this as BaseColumn)[o](val1, val2);
  }
  asc() {
    return new SqlOrder(this, 'ASC');
  }
  desc() {
    return new SqlOrder(this, 'DESC');
  }
  direction(dir: string) {
    return new SqlOrder(this, dir);
  }
  dir(dir: string) {
    return new SqlOrder(this, dir);
  }
  not() {
    const col = SqlColumn.create({ column: this, alias: this.Alias });
    col.Not = true;
    return col;
  }
}
