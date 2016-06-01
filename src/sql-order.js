import './string.js';

import SqlColumn from './sql-column';

export default  class SqlOrder {
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
            throw {location: 'SqlOrder::constructor', message: 'did not pass a SqlColumn object'};
        }
    }

    get Column() {
        return this._column;
    }

    set Column(v) {
        this._column = v;
    }

    get Direction() {
        return this._direction;
    }

    set Direction(v) {
        this._direction = v;
    }
}
