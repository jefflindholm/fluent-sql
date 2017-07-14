import './string.js';

import SqlOrder from './sql-order';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs } from './helpers';

class SqlAggregate {
    constructor(table, column, operation) {
        this.Table = table;
        this.Column = column;
        this.Operation = operation;
        this.Column.Alias = `${this.Column.Alias || this.Column.ColumnName}_${operation.toLowerCase()}`;
    }
    on(sqlColumn) {
        this.GroupBy = sqlColumn;
        return this.Column;
    }
    by(sqlColumn) {
        return this.on(sqlColumn);
    }
    _Table: SqlTable;
    _Column: SqlColumn;
    _Operation: string;
    _GroupBy: SqlColumn;
    /* eslint-disable brace-style */
    get Table() { return this._Table; }
    set Table(v) { this._Table = v; }
    get Column() { return this._Column; }
    set Column(v) { this._Column = v; }
    get Operation() { return this._Operation; }
    set Operation(v) { this._Operation = v; }
    get GroupBy() { return this._GroupBy; }
    set GroupBy(v) { this._GroupBy = v; }
    /* eslint-enable brace-style */


}
export default class SqlColumn {
    constructor(sqlObject, columnName = null, literal = null) {
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
            this.Aggregate = sqlObject.Aggregate;
            this.Grouped = sqlObject.Grouped;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof SqlTable)) {
            throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' }; // eslint-disable-line no-throw-literal
        } else {
            this.Table = sqlObject;
            this.ColumnName = columnName;
            this.Literal = literal;
            this.Alias = columnName ? columnName.toCamel() : undefined; // eslint-disable-line no-undefined
        }
    }
    // aggregate functions
    aggregate(op) {
        const column = new SqlColumn(this, null, null);
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

    qualifiedName(sqlQuery) {
        return this.Literal || `${(this.Table.Alias as any).sqlEscape(sqlQuery, 'table-alias')}.${this.ColumnName}`;
    }
    as(alias) {
        const col = new SqlColumn(this);
        col.Alias = alias;
        return col;
    }
    using(values) {
        const col = new SqlColumn(this);
        col.Values = values;
        return col;
    }
    groupBy() {
        const col = new SqlColumn(this);
        col.Grouped = true;
        return col;
    }

    _Table: SqlTable;
    _ColumnName: string;
    _Literal: string;
    _Alias: string;
    _Not: boolean;
    _Values: Array<any>;
    _Grouped: boolean;
    _Aggregate: SqlAggregate;
    /* eslint-disable brace-style */
    get Aggregate() { return this._Aggregate; }
    set Aggregate(v) { this._Aggregate = v; }
    get Table() { return this._Table; }
    set Table(v) { this._Table = v; }
    get TableName() { return this._Table.TableName; }
    get ColumnName() { return this._ColumnName; }
    set ColumnName(v) { this._ColumnName = v; }
    get Literal() { return this._Literal; }
    set Literal(v) { this._Literal = v; }
    get Alias() { return this._Alias; }
    set Alias(v) { this._Alias = v; }
    get Not() { return this._Not; }
    set Not(v) { this._Not = v; }
    get Values() { return this._Values; }
    set Values(v) { this._Values = v; }
    get Grouped() { return this._Grouped; }
    set Grouped(v) { this._Grouped = v; }
    /* eslint-disable brace-style */

    eq(val) {
        return new SqlWhere({ Column: this, Op: '=', Value: val });
    }
    ne(val) {
        return new SqlWhere({ Column: this, Op: '<>', Value: val });
    }
    gt(val) {
        return new SqlWhere({ Column: this, Op: '>', Value: val });
    }
    gte(val) {
        return new SqlWhere({ Column: this, Op: '>=', Value: val });
    }
    lt(val) {
        return new SqlWhere({ Column: this, Op: '<', Value: val });
    }
    isNull() {
        return new SqlWhere({ Column: this, Op: 'IS NULL' });
    }
    isNotNull() {
        return new SqlWhere({ Column: this, Op: 'IS NOT NULL' });
    }
    lte(val) {
        return new SqlWhere({ Column: this, Op: '<=', Value: val });
    }
    like(val) {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}%`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    starts(val) {
        let value = val;
        if (typeof value === 'string') {
            value = `${value}%`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    ends(val) {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}`;
        }
        return new SqlWhere({ Column: this, Op: 'like', Value: value });
    }
    in(...args) {
        const values = [];
        processArgs((v) => { values.push(v); }, ...args); // eslint-disable-line brace-style
        return new SqlWhere({ Column: this, Op: 'in', Value: values });
    }
    between(val1, val2) {
        return this.gte(val1).and(this.lte(val2));
    }
    op(op, val1, val2) {
        let o = op;
        if (!this[o]) {
            o = o.toLowerCase();
        }
        return this[o](val1, val2);
    }
    asc() {
        return new SqlOrder(this, 'ASC');
    }
    desc() {
        return new SqlOrder(this, 'DESC');
    }
    direction(dir) {
        return new SqlOrder(this, dir);
    }
    dir(dir) {
        return new SqlOrder(this, dir);
    }
    not() {
        const col = new SqlColumn(this, null, null);
        col.Not = true;
        return col;
    }
}
