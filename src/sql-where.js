// @flow
/* eslint-disable no-underscore-dangle */
import './string';
import { SqlError } from './helpers';
import SqlColumn from './sql-column'

export type SimpleWhere = {
    Column: SqlColumn,
    Op: string,
    Value: any,
}
export default class SqlWhere {
    constructor(details?: SqlWhere | SimpleWhere) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlWhere(details);
        }
        this._Wheres = []
        this._Column = null
        this._Value = null
        if (details) {
            this.Column = details.Column;
            this.Op = details.Op;
            this.Value = details.Value;
        }
        this.add = (whereClause: SqlWhere) => {
            let result = this;
            if (this.Column != null) {
                result = new SqlWhere();
                result.type = this.type;
                this.type = null;
                result.Wheres.push(this);
            }
            result.Wheres.push(whereClause);
            return result;
        };
    }

    _Wheres: SqlWhere[]
    _Column: ?SqlColumn
    _Op: string
    _Value: any
    _Type: ?string
    add: Function

    get Wheres(): SqlWhere[] {
        return this._Wheres;
    }

    get Column(): ?SqlColumn {
        return this._Column;
    }

    get Op(): string {
        return this._Op;
    }

    get Value(): any {
        return this._Value;
    }

    get type(): ?string {
        return this._Type;
    }

    set Wheres(v: SqlWhere[]) {
        this._Wheres = v;
    }

    set Column(v: ?SqlColumn) {
        this._Column = v;
    }

    set Op(v: string) {
        this._Op = v;
    }

    set Value(v: any) {
        this._Value = v;
    }

    set type(v: ?string) {
        this._Type = v;
    }

    or(whereClause: SqlWhere) {
        if (this.type && this.type !== 'or') {
            throw new SqlError('SqlWhere::or', 'cannot add \'or\' to \'and\' group');
        }
        this.type = 'or';
        return this.add(whereClause);
    }

    and(whereClause: SqlWhere) {
        if (this.type && this.type !== 'and') {
            throw new SqlError('SqlWhere::and', 'cannot add \'and\' to \'or\' group');
        }
        this.type = 'and';
        return this.add(whereClause);
    }
}
