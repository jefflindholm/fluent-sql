// @flow
import './string.js';

import SqlOrder from './sql-order';
import SqlQuery from './sql-query';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs } from './helpers';

class SqlAggregate {
    constructor(table: SqlTable, column: SqlColumn, operation: string) {
        this._Table = table;
        this._Column = column;
        this._Operation = operation;
        this._Column.Alias = `${this._Column.Alias || this._Column.ColumnName}_${operation.toLowerCase()}`;
    }
    on(sqlColumn: SqlColumn) {
        this._GroupBy = sqlColumn;
        return this._Column;
    }
    by(sqlColumn: SqlColumn) {
        return this.on(sqlColumn);
    }
    get Column(): SqlColumn {
        return this._Column;
    }
    get Table(): SqlTable {
        return this._Table;
    }
    get Operation(): string {
        return this._Operation;
    }
    get GroupBy(): SqlColumn {
        return this._GroupBy;
    }
    _Column: SqlColumn;
    _Table: SqlTable;
    _Operation: string;
    _GroupBy: SqlColumn;
}
type SqlLiteral = {
    Literal: string,
    Alias: string,
};
export default class SqlColumn {
    constructor(sqlObject: SqlColumn | SqlTable | SqlLiteral, columnName: ?string, literal: ?string) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlColumn(sqlObject, columnName, literal);
        }
        if (sqlObject instanceof SqlColumn) {
            this._Table = sqlObject._Table;
            this._ColumnName = sqlObject._ColumnName;
            this._Literal = sqlObject._Literal;
            this._Alias = sqlObject._Alias;
            this._Not = sqlObject._Not;
            this._Values = sqlObject._Values;
            this._Aggregate = sqlObject._Aggregate;
            this._Grouped = sqlObject._Grouped;
        } else if (sqlObject != null && sqlObject.Literal && !(sqlObject instanceof SqlTable)) {
            this._Literal = (((sqlObject: any).Literal): string);
            this._Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof SqlTable)) {
            throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' }; // eslint-disable-line no-throw-literal
        } else {
            this._Table = sqlObject;
            this._ColumnName = columnName || '';
            this._Literal = literal;
            this._Alias = columnName ? (columnName: any).toCamel() : undefined; // eslint-disable-line no-undefined
        }
    }
    _Table: SqlTable;
    _ColumnName: string;
    _Literal: ?string;
    _Alias: ?string;
    _Not: boolean;
    _Values: any;
    _Aggregate: SqlAggregate;
    _Grouped: boolean;

    // aggregate functions
    aggregate(op: string): SqlAggregate {
        const column = new SqlColumn(this);
        column.Aggregate = new SqlAggregate(column.table, column, op);
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
        return this.Literal || `${(this.Table.Alias: any).sqlEscape(sqlQuery, 'table-alias')}.${this.ColumnName}`;
    }
    // `
    as(alias: string): SqlColumn {
        const col = new SqlColumn(this);
        col.Alias = alias;
        return col;
    }
    using(values: any): SqlColumn {
        const col = new SqlColumn(this);
        col.Values = values;
        return col;
    }
    groupBy(): SqlColumn {
        const col = new SqlColumn(this);
        col._Grouped = true;
        return col;
    }
    get Aggregate(): SqlAggregate {
        return this._Aggregate;
    }
    set Aggregate(v: SqlAggregate) {
        this._Aggregate = v;
    }
    get Table(): SqlTable {
        return this._Table;
    }
    set Table(v: SqlTable) {
        this._Table = v;
    }
    get TableName(): string {
        return this._Table.TableName;
    }
    get ColumnName(): string {
        return this._ColumnName;
    }
    set ColumnName(v: string) {
        this._ColumnName = v;
    }
    get Literal(): ?string {
        return this._Literal;
    }
    set Literal(v: string) {
        this._Literal = v;
    }
    get Alias(): ?string {
        return this._Alias;
    }
    set Alias(v: string) {
        this._Alias = v;
    }
    get Not(): boolean {
        return this._Not;
    }
    set Not(v: boolean) {
        this._Not = v;
    }
    get Values(): any {
        return this._Values;
    }
    set Values(v: any) {
        this._Values = v;
    }
    get Grouped(): boolean {
        return this._Grouped;
    }
    set Grouped(v: boolean) {
        this._Grouped = v;
    }
    eq(val: any): SqlWhere {
        return new SqlWhere({ Column: this, Op: '=', Value: val });
    }
    ne(val: any): SqlWhere {
        return new SqlWhere({ Column: this, Op: '<>', Value: val });
    }
    gt(val: any): SqlWhere {
        return new SqlWhere({ Column: this, Op: '>', Value: val });
    }
    gte(val: any): SqlWhere {
        return new SqlWhere({ Column: this, Op: '>=', Value: val });
    }
    lt(val: any): SqlWhere {
        return new SqlWhere({ Column: this, Op: '<', Value: val });
    }
    isNull(): SqlWhere {
        return new SqlWhere({ Column: this, Op: 'IS NULL' });
    }
    isNotNull(): SqlWhere {
        return new SqlWhere({ Column: this, Op: 'IS NOT NULL' });
    }
    lte(val: any): SqlWhere {
        return new SqlWhere({ Column: this, Op: '<=', Value: val });
    }
    like(val: string): SqlWhere {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}%`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    starts(val: string): SqlWhere {
        let value = val;
        if (typeof value === 'string') {
            value = `${value}%`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    ends(val: string): SqlWhere {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    in(...args: Array<any>): SqlWhere {
        const values = [];
        processArgs((v) => { values.push(v); }, ...args); // eslint-disable-line brace-style
        return new SqlWhere({ Column: this, Op: 'in', Value: values });
    }
    between(val1: any, val2: any): SqlWhere {
        return this.gte(val1).and(this.lte(val2));
    }
    op(op: string, val1: any, val2: any): SqlWhere {
        let o = op;
        if (!(this: any)[o]) {
            o = o.toLowerCase();
        }
        return (this: any)[o](val1, val2);
    }
    asc(): SqlOrder {
        return new SqlOrder(this, 'ASC');
    }
    desc(): SqlOrder {
        return new SqlOrder(this, 'DESC');
    }
    direction(dir: 'ASC' | 'DESC'): SqlOrder {
        return new SqlOrder(this, dir);
    }
    dir(dir: 'ASC' | 'DESC'): SqlOrder {
        return new SqlOrder(this, dir);
    }
    not(): SqlColumn {
        const col = new SqlColumn(this);
        col.Not = true;
        return col;
    }
}
