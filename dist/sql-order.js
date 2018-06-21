'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./string.js');

var _sqlColumn = require('./sql-column');

var _sqlColumn2 = _interopRequireDefault(_sqlColumn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlOrder = function () {
    function SqlOrder(sqlObject, dir) {
        _classCallCheck(this, SqlOrder);

        if (!new.target) {
            return new SqlOrder(sqlObject, dir);
        }

        if (sqlObject instanceof SqlOrder) {
            this.Column = sqlObject.Column;
            this.Direction = dir || sqlObject.Direction || 'ASC';
        } else if (sqlObject instanceof _sqlColumn2.default) {
            this.Column = sqlObject;
            this.Direction = dir || 'ASC';
        } else {
            throw { location: 'SqlOrder::constructor', message: 'did not pass a SqlColumn object' }; // eslint-disable-line
        }
    }

    _createClass(SqlOrder, [{
        key: 'Column',
        get: function get() {
            return this._column;
        },
        set: function set(v) {
            this._column = v;
        }
    }, {
        key: 'Direction',
        get: function get() {
            return this._direction;
        },
        set: function set(v) {
            this._direction = v;
        }
    }]);

    return SqlOrder;
}();

exports.default = SqlOrder;