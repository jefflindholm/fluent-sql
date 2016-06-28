import './string.js';
import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlQuery from './sql-query';

export default  class SqlTable {
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
    constructor (...args) {
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
    get TableName() { return this._tableName; }
    set TableName(v) { this._tableName = v; }
    get Alias() { return this._alias; }
    set Alias(v) { this._alias = v; }
    get Columns() { return this._columns; }
    set Columns(v) { this._columns = v; }

    getTable () {
        return this.TableName;
    }
    getAlias () {
        return this.Alias || this.TableName;
    }
    as (alias) {
        const table = new SqlTable(this, alias);
        table.Alias = alias;
        return table;
    }
    join (joinClause) {
        const query = new SqlQuery();
        query.join(joinClause);
        return query;
    }
    left (joinClause) {
        const query = new SqlQuery();
        query.left(joinClause);
        return query;
    }
    right (joinClause) {
        const query = new SqlQuery();
        query.right(joinClause);
        return query;
    }
    on (sqlColumn) {
        if (sqlColumn.Table !== this) {
            throw {location: 'SqlTable::on', message: 'trying to build join on column not from this table'};
        }
        return new SqlJoin(sqlColumn);
    }
    where (whereClause) {
        const query = new SqlQuery();
        query.where(whereClause);
        return query;
    }
    star () {
        return this;
    }
}
