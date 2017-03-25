/* eslint-disable no-underscore-dangle */

import './string';

import SqlColumn from './sql-column';

export default class SqlOrder {
    constructor(sqlObject: any, dir: string) {
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

    _column: string;
    _direction: string;

    get Column(): string {
        return this._column;
    }

    set Column(v: string) {
        this._column = v;
    }

    get Direction(): string {
        return this._direction;
    }

    set Direction(v: string) {
        this._direction = v;
    }
}
