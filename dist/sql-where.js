"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var helpers_1 = require("./helpers");
var SqlWhere = (function () {
    function SqlWhere(details) {
        var _newTarget = this.constructor;
        if (details === void 0) { details = null; }
        if (!_newTarget) {
            return new SqlWhere(details);
        }
        this.Wheres = [];
        if (details) {
            this.Column = details.Column;
            this.Op = details.Op;
            this.Value = details.Value;
        }
        this.add = function (whereClause) {
            var result = this;
            if (this.Column != null) {
                result = new SqlWhere(null);
                result.type = this.type;
                this.type = null;
                result.Wheres.push(this);
            }
            result.Wheres.push(whereClause);
            return result;
        };
    }
    Object.defineProperty(SqlWhere.prototype, "Wheres", {
        get: function () {
            return this._Wheres;
        },
        set: function (v) {
            this._Wheres = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlWhere.prototype, "Column", {
        get: function () {
            return this._Column;
        },
        set: function (v) {
            this._Column = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlWhere.prototype, "Op", {
        get: function () {
            return this._Op;
        },
        set: function (v) {
            this._Op = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlWhere.prototype, "Value", {
        get: function () {
            return this._Value;
        },
        set: function (v) {
            this._Value = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlWhere.prototype, "type", {
        get: function () {
            return this._Type;
        },
        set: function (v) {
            this._Type = v;
        },
        enumerable: true,
        configurable: true
    });
    SqlWhere.prototype.or = function (whereClause) {
        if (this.type && this.type !== 'or') {
            throw new helpers_1.SqlError('SqlWhere::or', 'cannot add \'or\' to \'and\' group');
        }
        this.type = 'or';
        return this.add(whereClause);
    };
    SqlWhere.prototype.and = function (whereClause) {
        if (this.type && this.type !== 'and') {
            throw new helpers_1.SqlError('SqlWhere::and', 'cannot add \'and\' to \'or\' group');
        }
        this.type = 'and';
        return this.add(whereClause);
    };
    return SqlWhere;
}());
exports.default = SqlWhere;
//# sourceMappingURL=sql-where.js.map