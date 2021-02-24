import './string.extensions';

import SqlColumn from './sql-column';

export default class SqlOrder {
  constructor(sqlObject: SqlColumn | SqlOrder, dir: string | null = null) {

    if (!(sqlObject instanceof SqlOrder) && !(sqlObject instanceof SqlColumn)) {
      throw { location: 'SqlOrder::constructor', message: 'did not pass a SqlColumn object' }; // eslint-disable-line
    }
    if (sqlObject instanceof SqlOrder) {
      this._column = sqlObject.Column;
      this._direction = dir || sqlObject.Direction || 'ASC';
    } else {
      this._column = sqlObject;
    this._direction = dir || 'ASC';
    }
  }
  private _column: SqlColumn;
  private _direction: String;

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
