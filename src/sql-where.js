import './string.js';

export default  class SqlWhere {
    constructor(details) {
        if (!new.target) {
            return new SqlWhere(details);
        }
        this.Wheres = [];
        if (details) {
            this.Column = details.Column;
            this.Op = details.Op;
            this.Value = details.Value;
        }
        this.add = function (whereClause) {
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

    get Wheres() {
        return this._Wheres;
    }

    get Column() {
        return this._Column;
    }

    get Op() {
        return this._Op;
    }

    get Value() {
        return this._Value;
    }

    get type() {
        return this._type;
    }

    set Wheres(v) {
        this._Wheres = v;
    }

    set Column(v) {
        this._Column = v;
    }

    set Op(v) {
        this._Op = v;
    }

    set Value(v) {
        this._Value = v;
    }

    set type(v) {
        this._type = v;
    }

    or(whereClause) {
        if (this.type && this.type !== 'or') {
            throw {location: 'SqlWhere::or', message: 'cannot add \'or\' to \'and\' group'};
        }
        this.type = 'or';
        return this.add(whereClause);
    }

    and(whereClause) {
        if (this.type && this.type !== 'and') {
            throw {location: 'SqlWhere::and', message: 'cannot add \'and\' to \'or\' group'};
        }
        this.type = 'and';
        return this.add(whereClause);
    }
}
