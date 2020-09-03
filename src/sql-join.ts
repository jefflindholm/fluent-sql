import './string.extensions';

import SqlColumn from './sql-column';
import { SqlError } from './helpers';

export default class SqlJoin {
  constructor(sqlColumn: SqlColumn) {
    if (!(sqlColumn instanceof SqlColumn)) {
      throw new SqlError('SqlJoin::constructor', 'trying to join on something not a SqlColumn');
    }
    this._from = sqlColumn;
  }
  private _from: SqlColumn;
  private _to: SqlColumn | null = null;
  private _left: boolean = false;
  private _right: boolean = false;

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
