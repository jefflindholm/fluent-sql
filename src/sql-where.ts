import './string.extensions';
import { BaseColumn, BaseWhere } from './base-sql';
import { SqlError } from './helpers';

export default class SqlWhere implements BaseWhere {
  constructor(details: BaseWhere|null) {
    if (details) {
      this._column = details.Column;
      this._op = details.Op;
      this._value = details.Value;
    }
    this._wheres = [];
  }

  _value: any = null;
  _column: BaseColumn | null = null;
  _op: string | null = null;
  _wheres: SqlWhere[];
  _type: string | null = null;

  add(whereClause: SqlWhere): SqlWhere {
    let result: SqlWhere;

    if (this.Column != null) {
      result = new SqlWhere(null);
      result.type = this.type;
      this.type = null;
      result.Wheres.push(this);
    } else {
      result = this;
    }
    result.Wheres.push(whereClause);
    return result;

  }

  get Wheres() {
    return this._wheres;
  }
  set Wheres(v) {
    this._wheres = v;
  }

  get Column() {
    return this._column;
  }

  set Column(v) {
    this._column = v;
  }

  get Op() {
    return this._op;
  }

  set Op(v) {
    this._op = v;
  }

  get Value() {
    return this._value;
  }

  set Value(v) {
    this._value = v;
  }

  get type() {
    return this._type;
  }

  set type(v) {
    this._type = v;
  }

  or(whereClause: SqlWhere) {
    if (this.type && this.type !== 'or') {
      throw new SqlError('SqlWhere::or', "cannot add 'or' to 'and' group");
    }
    this.type = 'or';
    return this.add(whereClause);
  }

  and(whereClause: SqlWhere) {
    if (this.type && this.type !== 'and') {
      throw new SqlError('SqlWhere::and', "cannot add 'and' to 'or' group");
    }
    this.type = 'and';
    return this.add(whereClause);
  }
}
