import './string.js';

import SqlColumn from './sql-column';

type Directions = 'ASC' | 'DESC';
export default class SqlOrder {
    constructor(sqlObject, dir) {
        if (!new.target) {
            return new SqlOrder(sqlObject, dir);
        }

        if (sqlObject instanceof SqlOrder) {
            this.Column = sqlObject.Column;
            this.Direction = dir || sqlObject.Direction || 'ASC';
        } else if (sqlObject instanceof SqlColumn) {
            this.Column = sqlObject;
            this.Direction = dir || 'ASC';
        } else {
            throw { location: 'SqlOrder::constructor', message: 'did not pass a SqlColumn object' }; // eslint-disable-line
        }
    }

    _Column: SqlColumn;
    _Direction: Directions;

    /* eslint-disable brace-style */
    get Column() { return this._Column; }
    set Column(v) { this._Column = v; }
    get Direction() { return this._Direction; }
    set Direction(v) { this._Direction = v; }
    /* eslint-enable brace-style */
}
