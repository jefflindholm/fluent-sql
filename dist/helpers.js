"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.processArgs = processArgs;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var SqlError = exports.SqlError = function (_Error) {
    _inherits(SqlError, _Error);

    function SqlError(loc, msg) {
        _classCallCheck(this, SqlError);

        var _this = _possibleConstructorReturn(this, (SqlError.__proto__ || Object.getPrototypeOf(SqlError)).call(this, msg));

        _this.location = loc;
        _this.message = msg;
        return _this;
    }

    return SqlError;
}(Error);