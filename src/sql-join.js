/* eslint-disable no-underscore-dangle */
// @flow
import './string';

import SqlColumn from './sql-column';

export default class SqlJoin {
    constructor(sqlColumn: SqlColumn) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlJoin(sqlColumn);
        }
        this.From = sqlColumn;
    }

    _from: SqlColumn
    _to: SqlColumn

    get From(): SqlColumn {
        return this._from;
    }
    set From(v: SqlColumn) {
        this._from = v;
    }
    get To(): SqlColumn {
        return this._to;
    }
    set To(v: SqlColumn) {
        this._to = v;
    }
    using(sqlColumn: SqlColumn) {
        this.To = sqlColumn;
        return this;
    }
}
