'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.processArgs = processArgs;

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function processArgs(func) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    for (var i = 0; i < args.length; i++) {
        if (_util2.default.isArray(args[i])) {
            for (var j = 0; j < args[i].length; j++) {
                func(args[i][j]);
            }
        } else {
            func(args[i]);
        }
    }
}