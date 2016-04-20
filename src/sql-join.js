import './string.js';
import sliced from 'sliced';
import util from 'util';
import {sprintf} from 'sprintf-js';

import SqlColumn from './sql-column';

export default  class SqlJoin {
    constructor(sqlColumn) {
        if (!new.target) {
            return new SqlJoin(sqlColumn);
        }
        if (!(sqlColumn instanceof SqlColumn)) {
            throw {location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn'};
        }
        this.From = sqlColumn;
    }
    get From() { return this._from; }
    set From(v) { this._from = v; }
    get To() { return this._to; }
    set To(v) { this._to = v; }
    using (sqlColumn) {
        if (!(sqlColumn instanceof SqlColumn)) {
            throw {location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn'};
        }
        this.To = sqlColumn;
        return this;
    }
}
