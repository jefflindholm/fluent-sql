"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var sql_column_1 = require("./sql-column");
var SqlOrder = (function () {
    function SqlOrder(sqlObject, dir) {
        var _newTarget = this.constructor;
        if (!_newTarget) {
            return new SqlOrder(sqlObject, dir);
        }
        if (sqlObject instanceof SqlOrder) {
            this.Column = sqlObject.Column;
            this.Direction = dir || sqlObject.Direction || 'ASC';
        }
        else if (sqlObject instanceof sql_column_1.default) {
            this.Column = sqlObject;
            this.Direction = dir || 'ASC';
        }
        else {
            throw { location: 'SqlOrder::constructor', message: 'did not pass a SqlColumn object' }; // eslint-disable-line
        }
    }
    Object.defineProperty(SqlOrder.prototype, "Column", {
        /* eslint-disable brace-style */
        get: function () { return this._Column; },
        set: function (v) { this._Column = v; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SqlOrder.prototype, "Direction", {
        get: function () { return this._Direction; },
        set: function (v) { this._Direction = v; },
        enumerable: true,
        configurable: true
    });
    return SqlOrder;
}());
exports.default = SqlOrder;
//# sourceMappingURL=sql-order.js.map