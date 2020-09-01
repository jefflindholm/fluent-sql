import './string.js';

import SqlColumn from './sql-column';

export default class SqlJoin {
  constructor(sqlColumn: SqlColumn) {
    if (!(sqlColumn instanceof SqlColumn)) {
      throw { location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn' }; // eslint-disable-line
    }
    this._from = sqlColumn;
  }
  _from: SqlColumn;
  _to: SqlColumn | null = null;
  _left: boolean = false;
  _right: boolean = false;

  get Left() { return this._left }
  set Left(v) { this._left = v }
  get Right() { return this._right }
  set Right(v) { this._right = v }
  get From() { return this._from; }
  set From(v) { this._from = v; }
  get To() { return this._to; }
  set To(v) { this._to = v; }

  using(sqlColumn: SqlColumn) {
    if (!(sqlColumn instanceof SqlColumn)) {
      throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' }; //eslint-disable-line
    }
    this.To = sqlColumn;
    return this;
  }
}
