"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.processArgs = processArgs;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function processArgs(func) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < args.length; i++) {
        if (Array.isArray(args[i])) {
            for (var j = 0; j < args[i].length; j++) {
                func(args[i][j]);
            }
        } else {
            func(args[i]);
        }
    }
}

var SqlError = exports.SqlError = function SqlError(loc, msg) {
    _classCallCheck(this, SqlError);

    // super(msg);
    this.location = loc;
    this.message = msg;
};