"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var sql_column_1 = require("./sql-column");
var SqlJoin = (function () {
    function SqlJoin(sqlColumn) {
        var _newTarget = this.constructor;
        if (!_newTarget) {
            return new SqlJoin(sqlColumn);
        }
        if (!(sqlColumn instanceof sql_column_1.default)) {
            throw { location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn' }; // eslint-disable-line
        }
        this.From = sqlColumn;
    }
    Object.defineProperty(SqlJoin.prototype, "From", {
        /* eslint-disable brace-style */
        get: function () { return this._From; },
        set: function (v) { this._From = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlJoin.prototype, "To", {
        get: function () { return this._To; },
        set: function (v) { this._To = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlJoin.prototype, "Right", {
        get: function () { return this._Right; },
        set: function (v) { this._Right = true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlJoin.prototype, "Left", {
        get: function () { return this._Left; },
        set: function (v) { this._Left = v; },
        enumerable: true,
        configurable: true
    });
    /* eslint-enable brace-style */
    SqlJoin.prototype.using = function (sqlColumn) {
        if (!(sqlColumn instanceof sql_column_1.default)) {
            throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' }; //eslint-disable-line
        }
        this.To = sqlColumn;
        return this;
    };
    return SqlJoin;
}());
exports.default = SqlJoin;
//# sourceMappingURL=sql-join.js.map