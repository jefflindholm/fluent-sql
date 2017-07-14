import './string.js';

import SqlColumn from './sql-column';

export default class SqlJoin {
    constructor(sqlColumn) {
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

    /* eslint-disable brace-style */
    get From() { return this._From; }
    set From(v) { this._From = v; }
    get To() { return this._To; }
    set To(v) { this._To = v; }
    get Right() { return this._Right; }
    set Right(v) { this._Right = true; }
    get Left() { return this._Left; }
    set Left(v) { this._Left = v; }
    /* eslint-enable brace-style */
    using(sqlColumn) {
        if (!(sqlColumn instanceof SqlColumn)) {
            throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' }; //eslint-disable-line
        }
        this.To = sqlColumn;
        return this;
    }
}
