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

var SqlJoin = function () {
    function SqlJoin(sqlColumn) {
        _classCallCheck(this, SqlJoin);

        if (!new.target) {
            return new SqlJoin(sqlColumn);
        }
        if (!(sqlColumn instanceof _sqlColumn2.default)) {
            throw { location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn' }; // eslint-disable-line
        }
        this.From = sqlColumn;
    }

    _createClass(SqlJoin, [{
        key: 'using',
        value: function using(sqlColumn) {
            if (!(sqlColumn instanceof _sqlColumn2.default)) {
                throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' }; //eslint-disable-line
            }
            this.To = sqlColumn;
            return this;
        }
    }, {
        key: 'From',
        get: function get() {
            return this._from;
        },
        set: function set(v) {
            this._from = v;
        }
    }, {
        key: 'To',
        get: function get() {
            return this._to;
        },
        set: function set(v) {
            this._to = v;
        }
    }]);

    return SqlJoin;
}();

exports.default = SqlJoin;