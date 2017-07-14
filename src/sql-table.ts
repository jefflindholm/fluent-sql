import './string.js';
import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlQuery from './sql-query';

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
            columns.forEach(function (c) {
                const name = c.ColumnName || c.name;
                const prop = name.toCamel();
                const col = new SqlColumn(this, name, c.Literal);
                this.Columns.push(col);
                this[prop] = col;
            }, this);
        }
    }
    _Schema: string;
    _TableName: string;
    _Alias: string;
    _Columns: Array<SqlColumn>;

    /* eslint-disable brace-style */
    get Schema() { return this._Schema }
    set Schema(v) { this._Schema = v}
    get TableName() { return this._TableName; }
    set TableName(v) { this._TableName = v; }
    get Alias() { return this._Alias; }
    set Alias(v) { this._Alias = v; }
    get Columns() { return this._Columns; }
    set Columns(v) { this._Columns = v; }
    /* eslint-enable */

    getTable() {
        if (this.Schema) {
            return `${this.Schema}.${this.TableName}`
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
        const query = new SqlQuery(null);
        query.join(joinClause);
        return query;
    }
    left(joinClause) {
        const query = new SqlQuery(null);
        query.left(joinClause);
        return query;
    }
    right(joinClause) {
        const query = new SqlQuery(null);
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
        const query = new SqlQuery(null);
        query.where(whereClause);
        return query;
    }
    star() {
        return this;
    }
}
