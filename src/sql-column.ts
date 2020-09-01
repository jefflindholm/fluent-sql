import './string.extensions.js';
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
  constructor(table: BaseTable, name: string, literal: string | null, not: boolean, values: string[], aggregate: SqlAggregate | null, grouped: boolean, alias: string | null) {
    this._table = table;
    this._columnName = name;
    this._literal = literal;
    this._not = not;
    this._values = values;
    this._aggregate = aggregate;
    this._grouped = grouped;
    this._alias = alias || this._columnName.toCamel();
  }

  _table: BaseTable;
  _columnName: string;
  _literal: string | null;
  _alias: string | null;
  _not: boolean;
  _values: string[] = [];
  _grouped: boolean;
  _aggregate: SqlAggregate | null = null;

  // aggregate functions
  aggregate(op: string): SqlAggregate {
    const column = CreateColumn({ column: this });
    column.Aggregate = new SqlAggregate(column.Table, column, op);
    return column.Aggregate;
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
    return this.Literal || `${this.Table.Alias.sqlEscape(sqlQuery, 'table-alias')}.${this.ColumnName}`;
  }
  as(alias: string) {
    const col = CreateColumn({ column: this, alias });
    return col;
  }
  using(values: string[]) {
    const col = CreateColumn({ column: this, alias: this.Alias });
    col.Values = values;
    return col;
  }
  groupBy() {
    const col = CreateColumn({ column: this, alias: this.Alias });
    col._grouped = true;
    return col;
  }

  get TableName() { return this.Table.TableName; }

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
    const col = CreateColumn({ column: this, alias: this.Alias });
    col.Not = true;
    return col;
  }
}
export function CreateColumn({ column, alias, table, col }: {column?: SqlColumn, alias?: string|null, table?: SqlTable, col?: string}): SqlColumn {
  if (column) {
    return new SqlColumn(column.Table, column.ColumnName, column.Literal, column.Not, column.Values, column.Aggregate, column.Grouped, alias || column.Alias);
  } else if (table && col) {
    return new SqlColumn(table, col, '', false, [], null, false, col);
  }
  throw new SqlError('CreateColumn', 'no values to create a good column');
}
