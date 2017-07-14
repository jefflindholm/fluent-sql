"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
function processArgs(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < args.length; i++) {
        if (Array.isArray(args[i])) {
            for (var j = 0; j < args[i].length; j++) {
                func(args[i][j]);
            }
        }
        else {
            func(args[i]);
        }
    }
}
exports.processArgs = processArgs;
var SqlError = (function (_super) {
    __extends(SqlError, _super);
    function SqlError(loc, msg) {
        var _this = _super.call(this, msg) || this;
        _this.location = loc;
        _this.message = msg;
        return _this;
    }
    return SqlError;
}(Error));
exports.SqlError = SqlError;
//# sourceMappingURL=helpers.js.map