'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
/* eslint-disable no-underscore-dangle */


require('./string');

var _helpers = require('./helpers');

var _sqlColumn = require('./sql-column');

var _sqlColumn2 = _interopRequireDefault(_sqlColumn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlWhere = function () {
    function SqlWhere(details) {
        var _this = this;

        _classCallCheck(this, SqlWhere);

        // $FlowFixMe
        if (!new.target) {
            return new SqlWhere(details);
        }
        this._Wheres = [];
        this._Column = null;
        this._Value = null;
        if (details) {
            this.Column = details.Column;
            this.Op = details.Op;
            this.Value = details.Value;
        }
        this.add = function (whereClause) {
            var result = _this;
            if (_this.Column != null) {
                result = new SqlWhere();
                result.type = _this.type;
                _this.type = null;
                result.Wheres.push(_this);
            }
            result.Wheres.push(whereClause);
            return result;
        };
    }

    _createClass(SqlWhere, [{
        key: 'or',
        value: function or(whereClause) {
            if (this.type && this.type !== 'or') {
                throw new _helpers.SqlError('SqlWhere::or', 'cannot add \'or\' to \'and\' group');
            }
            this.type = 'or';
            return this.add(whereClause);
        }
    }, {
        key: 'and',
        value: function and(whereClause) {
            if (this.type && this.type !== 'and') {
                throw new _helpers.SqlError('SqlWhere::and', 'cannot add \'and\' to \'or\' group');
            }
            this.type = 'and';
            return this.add(whereClause);
        }
    }, {
        key: 'Wheres',
        get: function get() {
            return this._Wheres;
        },
        set: function set(v) {
            this._Wheres = v;
        }
    }, {
        key: 'Column',
        get: function get() {
            return this._Column;
        },
        set: function set(v) {
            this._Column = v;
        }
    }, {
        key: 'Op',
        get: function get() {
            return this._Op;
        },
        set: function set(v) {
            this._Op = v;
        }
    }, {
        key: 'Value',
        get: function get() {
            return this._Value;
        },
        set: function set(v) {
            this._Value = v;
        }
    }, {
        key: 'type',
        get: function get() {
            return this._Type;
        },
        set: function set(v) {
            this._Type = v;
        }
    }]);

    return SqlWhere;
}();

exports.default = SqlWhere;