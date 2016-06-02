import './string.js';

import SqlOrder from './sql-order';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { processArgs } from './helpers';

export default  class SqlColumn {
    constructor(sqlObject, columnName, literal) {
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
            this._grouped = sqlObject._grouped;
        } else if (sqlObject != null && sqlObject.Literal) {
            this.Literal = sqlObject.Literal;
            this.Alias = sqlObject.Alias;
        } else if (sqlObject != null && !(sqlObject instanceof SqlTable)) {
            throw {location: 'SqlColumn::constructor', message: 'must construct using a SqlTable'};
        } else {
            this.Table = sqlObject;
            this.ColumnName = columnName;
            this.Literal = literal;
            this.Alias = columnName ? columnName.toCamel() : undefined;
        }
    }

    qualifiedName(sqlQuery) {
        return this.Literal || `${this.Table.Alias.sqlEscape(sqlQuery, 'table-alias')}.${this.ColumnName}`;
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
        col._grouped = true;
        return col;
    }
    get Table() {
        return this._table;
    }
    set Table(v) {
        this._table = v;
    }
    get ColumnName() {
        return this._columnName;
    }
    set ColumnName(v) {
        this._columnName = v;
    }
    get Literal() {
        return this._literal;
    }
    set Literal(v) {
        this._literal = v;
    }
    get Alias() {
        return this._alias;
    }
    set Alias(v) {
        this._alias = v;
    }
    get Not() {
        return this._not;
    }
    set Not(v) {
        this._not = v;
    }
    get Values() {
        return this._values;
    }
    set Values(v) {
        this._values = v;
    }
    get Grouped() {
        return this._grouped;
    }
    set Grouped(v) {
        this._grouped = v;
    }
    eq (val) {
        return new SqlWhere({Column: this, Op: '=', Value: val});
    };
    ne (val) {
        return new SqlWhere({Column: this, Op: '<>', Value: val});
    }
    gt (val) {
        return new SqlWhere({Column: this, Op: '>', Value: val});
    }
    gte (val) {
        return new SqlWhere({Column: this, Op: '>=', Value: val});
    }
    lt (val) {
        return new SqlWhere({Column: this, Op: '<', Value: val});
    }
    isNull () {
        return new SqlWhere({Column: this, Op: 'IS NULL'});
    }
    isNotNull () {
        return new SqlWhere({Column: this, Op: 'IS NOT NULL'});
    }
    lte (val) {
        return new SqlWhere({Column: this, Op: '<=', Value: val});
    }
    like (val) {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}%`;
        }
        return new SqlWhere({Column: this, Op: 'like', Value: value});
    }
    starts (val) {
        let value = val;
        if (typeof value === 'string') {
            value = `${value}%`;
        }
        return new SqlWhere({Column: this, Op: 'like', Value: value});
    }
    ends(val) {
        let value = val;
        if (typeof value === 'string') {
            value = `%${value}`;
        }
        return new SqlWhere({Column: this, Op: 'like', Value: value});
    }
    in (...args) {
        const values = [];
        processArgs((v) => { values.push(v) }, ...args); // eslint-disable-line brace-style
        return new SqlWhere({Column: this, Op: 'in', Value: values});
    }
    between (val1, val2) {
        return this.gte(val1).and(this.lte(val2));
    }
    op (op, val1, val2) {
        let o = op;
        if (!this[o]) {
            o = o.toLowerCase();
        }
        return this[o](val1, val2);
    }
    asc () {
        return new SqlOrder(this, 'ASC');
    }
    desc () {
        return new SqlOrder(this, 'DESC');
    }
    direction (dir) {
        return new SqlOrder(this, dir);
    }
    dir (dir) {
        return new SqlOrder(this, dir);
    }
    not () {
        const col = new SqlColumn(this);
        col.Not = true;
        return col;
    }
}
