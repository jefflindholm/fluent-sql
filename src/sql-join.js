// @flow
import './string.js';

import SqlColumn from './sql-column';

export default class SqlJoin {
    constructor(sqlColumn: SqlColumn) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlJoin(sqlColumn);
        }
        if (!(sqlColumn instanceof SqlColumn)) {
            throw { location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn' }; // eslint-disable-line
        }
        this.From = sqlColumn;
    }

    _From: SqlColumn;
    _To: SqlColumn;
    _Left: boolean;
    _Right: boolean;

    get From(): SqlColumn {
        return this._From;
    }
    set From(v: SqlColumn) {
        this._From = v;
    }
    get To(): SqlColumn {
        return this._To;
    }
    set To(v: SqlColumn) {
        this._To = v;
    }
    get Left(): boolean {
        return this._Left;
    }
    set Left(v: boolean) {
        this._Left = v;
    }
    get Right(): boolean {
        return this._Right;
    }
    set Right(v: boolean) {
        this._Right = v;
    }
    using(sqlColumn: SqlColumn) {
        if (!(sqlColumn instanceof SqlColumn)) {
            throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' }; //eslint-disable-line
        }
        this.To = sqlColumn;
        return this;
    }
}
