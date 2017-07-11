// @flow
import './string.js';
import { SqlError } from './helpers';
import SqlColumn from './sql-column';

type BasicWhere = {
    Column: SqlColumn,
    Op: string,
    Value?: any,
}
export default class SqlWhere {
    constructor(details?: SqlWhere | BasicWhere | null) {
        // $FlowFixMe
        if (!new.target) {
            return new SqlWhere(details);
        }
        this.Wheres = [];
        if (details) {
            this.Column = details.Column;
            this.Op = details.Op;
            this.Value = details.Value;
        }
        this.add = function (whereClause: SqlWhere): SqlWhere {
            let result = this;
            if (this.Column != null) {
                result = new SqlWhere();
                result.Type = this.Type;
                this.Type = null;
                result.Wheres.push(this);
            }
            result.Wheres.push(whereClause);
            return result;
        };
    }
    add: (wc: SqlWhere) => SqlWhere;
    _Wheres: Array<SqlWhere>;
    _Column: SqlColumn;
    _Op: string;
    _Value: any;
    _Type: 'or' | 'and' | null;

    get Wheres(): Array<SqlWhere> {
        return this._Wheres;
    }

    get Column(): SqlColumn {
        return this._Column;
    }

    get Op(): string {
        return this._Op;
    }

    get Value(): any {
        return this._Value;
    }

    get Type(): 'or' | 'and' | null {
        return this._Type;
    }

    set Wheres(v: Array<SqlWhere>) {
        this._Wheres = v;
    }

    set Column(v: SqlColumn) {
        this._Column = v;
    }

    set Op(v: string) {
        this._Op = v;
    }

    set Value(v: any) {
        this._Value = v;
    }

    set Type(v: 'or' | 'and' | null) {
        this._Type = v;
    }

    or(whereClause: SqlWhere) {
        if (this.Type && this.Type !== 'or') {
            throw new SqlError('SqlWhere::or', 'cannot add \'or\' to \'and\' group');
        }
        this.Type = 'or';
        return this.add(whereClause);
    }

    and(whereClause: SqlWhere) {
        if (this.Type && this.Type !== 'and') {
            throw new SqlError('SqlWhere::and', 'cannot add \'and\' to \'or\' group');
        }
        this.Type = 'and';
        return this.add(whereClause);
    }
}
