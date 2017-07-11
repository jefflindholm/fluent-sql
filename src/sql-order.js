// @flow
import './string.js';

import SqlColumn from './sql-column';

type DirectionType = 'ASC' | 'DESC';

export default class SqlOrder {
    constructor(sqlObject: SqlOrder | SqlColumn, dir: DirectionType | null = null) {
        // $FlowFixMe
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
    _Direction: DirectionType;

    get Column(): SqlColumn {
        return this._Column;
    }

    set Column(v: SqlColumn) {
        this._Column = v;
    }

    get Direction(): DirectionType {
        return this._Direction;
    }

    set Direction(v: DirectionType) {
        this._Direction = v;
    }
}
