// @flow
/* eslint-disable no-underscore-dangle, class-methods-use-this */
import './string'
import SqlColumn from './sql-column'
import SqlJoin from './sql-join'
import SqlQuery from './sql-query'
import SqlWhere from './sql-where'

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
    // $FlowFixMe
    constructor(...args) {
        // $FlowFixMe
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
            columns.forEach((c) => {
                const name = c.ColumnName || c.name;
                const prop = name.toCamel();
                const col = new SqlColumn(this, name, c.Literal);
                this.Columns.push(col);
                this[prop] = col;
            }, this);
        }
    }
    _tableName: string
    _alias: string
    _columns: SqlColumn[]

    /* eslint-disable brace-style */
    get TableName(): string { return this._tableName; }
    set TableName(v: string) { this._tableName = v; }
    get Alias(): string { return this._alias; }
    set Alias(v: string) { this._alias = v; }
    get Columns(): SqlColumn[] { return this._columns; }
    set Columns(v: SqlColumn[]) { this._columns = v; }
    /* eslint-enable */

    getTable() {
        return this.TableName;
    }
    getAlias() {
        return this.Alias || this.TableName;
    }
    as(alias: string) {
        const table = new SqlTable(this, alias);
        table.Alias = alias;
        return table;
    }
    join(joinClause: SqlJoin) {
        const query = new SqlQuery();
        query.join(joinClause);
        return query;
    }
    left(joinClause: SqlJoin) {
        const query = new SqlQuery();
        query.left(joinClause);
        return query;
    }
    right(joinClause: SqlJoin) {
        const query = new SqlQuery();
        query.right(joinClause);
        return query;
    }
    on(sqlColumn: SqlColumn) {
        if (sqlColumn.Table !== this) {
            throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' }; //eslint-disable-line
        }
        return new SqlJoin(sqlColumn);
    }
    where(whereClause: SqlWhere) {
        const query = new SqlQuery();
        query.where(whereClause);
        return query;
    }
    star() {
        return this;
    }
}
