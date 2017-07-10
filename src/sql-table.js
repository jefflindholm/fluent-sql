// @flow
import './string.js';
import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlQuery from './sql-query';
import SqlWhere from './sql-where';

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
    constructor(...args: Array<any>) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlTable(...args);
        }
        let columns: Array<{columnName: string, name: string, literal: string, Literal: string}> = [];
        let alias: string = '';
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
                // $FlowFixMe
                const prop: TableColumn = name.toCamel();
                const col = new SqlColumn(this, name, c.literal || c.Literal);
                this.Columns.push(col);
                // $FlowFixMe
                this[prop] = col;
            });
        }
    }
    _Alias: string;
    _Columns: Array<SqlColumn>;
    _Schema: string;
    _TableName: string;

    /* eslint-disable brace-style */
    get Schema(): string { return this._Schema }
    set Schema(v: string) { this._Schema = v}
    get TableName(): string { return this._TableName; }
    set TableName(v: string) { this._TableName = v; }
    get Alias(): string { return this._Alias; }
    set Alias(v: string) { this._Alias = v; }
    get Columns(): Array<SqlColumn> { return this._Columns; }
    set Columns(v: Array<SqlColumn>) { this._Columns = v; }
    /* eslint-enable */

    getTable(): string {
        if (this.Schema) {
            return `${this.Schema}.${this.TableName}`
        }
        return this.TableName;
    }
    getAlias(): string {
        return this.Alias || this.TableName;
    }
    as(alias: string): SqlTable {
        const table = new SqlTable(this, alias);
        table.Alias = alias;
        return table;
    }
    join(joinClause: SqlJoin): SqlQuery {
        const query = new SqlQuery();
        query.join(joinClause);
        return query;
    }
    left(joinClause: SqlJoin): SqlQuery {
        const query = new SqlQuery();
        query.left(joinClause);
        return query;
    }
    right(joinClause: SqlJoin): SqlQuery {
        const query = new SqlQuery();
        query.right(joinClause);
        return query;
    }
    on(sqlColumn: SqlColumn): SqlJoin {
        if (sqlColumn.Table !== this) {
            throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' }; //eslint-disable-line
        }
        return new SqlJoin(sqlColumn);
    }
    where(whereClause: SqlWhere): SqlQuery {
        const query = new SqlQuery();
        query.where(whereClause);
        return query;
    }
    star(): SqlTable {
        return this;
    }
}
