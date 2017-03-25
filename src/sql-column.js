/* eslint-disable no-underscore-dangle */
// @flow
import './string';

import SqlOrder from './sql-order';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs } from './helpers';

class SqlAggregate {
    constructor(table: SqlTable, column: SqlColumn, operation: string) {
        this.table = table;
        this.column = column;
        this.operation = operation;
        this.column.Alias = `${this.column.Alias || this.column.ColumnName}_${operation.toLowerCase()}`;
    }
    groupBy: SqlColumn
    table: SqlTable
    column: SqlColumn
    operation: string

    on(sqlCol: SqlColumn) {
        this.groupBy = sqlCol;
        return this.column;
    }
    by(sqlColumn: SqlColumn) {
        return this.on(sqlColumn);
    }
}
type SqlObject = {
    Literal: string,
    Alias: string,
}
export default class SqlColumn {
    _grouped: boolean
    _table: SqlTable
    _columnName: string
    _alias: ?string
    _values: Array<any>
    _not: boolean
    _literal: string
    _aggregate: SqlAggregate
    ColumnName: string

    constructor(sqlObject: SqlColumn | SqlTable | SqlObject,
                columnName?: string,
                literal?: string) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlColumn(sqlObject, columnName, literal);
        }
        if (sqlObject instanceof SqlColumn) {
            this.Table = sqlObject.Table;
            this.ColumnName = sqlObject.ColumnName;
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
            this.Not = sqlObject.Not;
            this.Values = sqlObject.Values;
            this._aggregate = sqlObject._aggregate;
            this._grouped = sqlObject._grouped;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof SqlTable)) {
            throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' }; // eslint-disable-line no-throw-literal
        } else {
            this.Table = sqlObject;
            this.ColumnName = columnName || '';
            this.Literal = literal || '';
            // $FlowFixMe
            this.Alias = columnName ? columnName.toCamel() : undefined; // eslint-disable-line no-undefined
        }
    }

    // aggregate functions
    aggregate(op: string): SqlAggregate {
        const column = new SqlColumn(this);
        column._aggregate = new SqlAggregate(column.table, column, op);
        return column._aggregate;
    }
    avg(): SqlAggregate {
        return this.aggregate('AVG');
    }

    checksum(): SqlAggregate {
        return this.aggregate('CHECKSUM_AGG');
    }
    count(): SqlAggregate {
        return this.aggregate('COUNT');
    }
    countBig(): SqlAggregate {
        return this.aggregate('COUNT_BIG');
    }
    grouping(): SqlAggregate {
        return this.aggregate('GROUPING');
    }
    groupingId(): SqlAggregate {
        return this.aggregate('GROUPING_ID');
    }
    max(): SqlAggregate {
        return this.aggregate('MAX');
    }
    min(): SqlAggregate {
        return this.aggregate('MIN');
    }
    sum(): SqlAggregate {
        return this.aggregate('SUM');
    }
    stdev(): SqlAggregate {
        return this.aggregate('STDEV');
    }
    stdevp(): SqlAggregate {
        return this.aggregate('STDEVP');
    }
    // VAR
    varp(): SqlAggregate {
        return this.aggregate('VARP');
    }

    qualifiedName(sqlQuery: string): string {
        return this.Literal || `${this.Table.Alias.sqlEscape(sqlQuery, 'table-alias')}.${this.ColumnName}`;
    }
    as(alias: string): SqlColumn {
        const col = new SqlColumn(this);
        col.Alias = alias;
        return col;
    }
    using(values: Array<any>): SqlColumn {
        const col = new SqlColumn(this);
        col.Values = values;
        return col;
    }
    groupBy(): SqlColumn {
        const col = new SqlColumn(this);
        col._grouped = true;
        return col;
    }
    get Aggregate(): SqlAggregate {
        return this._aggregate
    }
    get Table(): SqlTable {
        return this._table;
    }
    set Table(v: SqlTable) {
        this._table = v;
    }
    get ColumnName(): string {
        return this._columnName;
    }
    set ColumnName(v: string) {
        this._columnName = v;
    }
    get Literal(): string {
        return this._literal;
    }
    set Literal(v: string) {
        this._literal = v;
    }
    get Alias(): ?string {
        return this._alias;
    }
    set Alias(v: ?string) {
        this._alias = v;
    }
    get Not(): boolean {
        return this._not;
    }
    set Not(v: boolean) {
        this._not = v;
    }
    get Values(): Array<any> {
        return this._values;
    }
    set Values(v: Array<any>) {
        this._values = v;
    }
    get Grouped(): boolean {
        return this._grouped;
    }
    set Grouped(v: boolean) {
        this._grouped = v;
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
    like(val: any): SqlWhere {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}%`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    starts(val: any): SqlWhere {
        let value = val;
        if (typeof value === 'string') {
            value = `${value}%`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    ends(val: any): SqlWhere {
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
        // $FlowFixMe
        if (!this[o]) {
            o = o.toLowerCase();
        }
        // $FlowFixMe
        return this[o](val1, val2);
    }
    asc(): SqlOrder {
        return new SqlOrder(this, 'ASC');
    }
    desc(): SqlOrder {
        return new SqlOrder(this, 'DESC');
    }
    direction(dir: string): SqlOrder {
        return new SqlOrder(this, dir);
    }
    dir(dir: string): SqlOrder {
        return new SqlOrder(this, dir);
    }
    not(): SqlColumn {
        const col = new SqlColumn(this);
        col.Not = true;
        return col;
    }
}
