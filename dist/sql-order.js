"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;require("./string.js");

var _sqlColumn = _interopRequireDefault(require("./sql-column"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}var

SqlOrder = /*#__PURE__*/function () {
  function SqlOrder(sqlObject, dir) {_classCallCheck(this, SqlOrder);
    if (!(this instanceof SqlOrder ? this.constructor : void 0)) {
      return new SqlOrder(sqlObject, dir);
    }

    if (sqlObject instanceof SqlOrder) {
      this.Column = sqlObject.Column;
      this.Direction = dir || sqlObject.Direction || 'ASC';
    } else if (sqlObject instanceof _sqlColumn.default) {
      this.Column = sqlObject;
      this.Direction = dir || 'ASC';
    } else {
      throw { location: 'SqlOrder::constructor', message: 'did not pass a SqlColumn object' }; // eslint-disable-line
    }
  }_createClass(SqlOrder, [{ key: "Column", get: function get()

    {
      return this._column;
    }, set: function set(

    v) {
      this._column = v;
    } }, { key: "Direction", get: function get()

    {
      return this._direction;
    }, set: function set(

    v) {
      this._direction = v;
    } }]);return SqlOrder;}();exports.default = SqlOrder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcWwtb3JkZXIuanMiXSwibmFtZXMiOlsiU3FsT3JkZXIiLCJzcWxPYmplY3QiLCJkaXIiLCJDb2x1bW4iLCJEaXJlY3Rpb24iLCJTcWxDb2x1bW4iLCJsb2NhdGlvbiIsIm1lc3NhZ2UiLCJfY29sdW1uIiwidiIsIl9kaXJlY3Rpb24iXSwibWFwcGluZ3MiOiJvR0FBQTs7QUFFQSxpRTs7QUFFcUJBLFE7QUFDakIsb0JBQVlDLFNBQVosRUFBdUJDLEdBQXZCLEVBQTRCO0FBQ3hCLFFBQUksdURBQUosRUFBaUI7QUFDYixhQUFPLElBQUlGLFFBQUosQ0FBYUMsU0FBYixFQUF3QkMsR0FBeEIsQ0FBUDtBQUNIOztBQUVELFFBQUlELFNBQVMsWUFBWUQsUUFBekIsRUFBbUM7QUFDL0IsV0FBS0csTUFBTCxHQUFjRixTQUFTLENBQUNFLE1BQXhCO0FBQ0EsV0FBS0MsU0FBTCxHQUFpQkYsR0FBRyxJQUFJRCxTQUFTLENBQUNHLFNBQWpCLElBQThCLEtBQS9DO0FBQ0gsS0FIRCxNQUdPLElBQUlILFNBQVMsWUFBWUksa0JBQXpCLEVBQW9DO0FBQ3ZDLFdBQUtGLE1BQUwsR0FBY0YsU0FBZDtBQUNBLFdBQUtHLFNBQUwsR0FBaUJGLEdBQUcsSUFBSSxLQUF4QjtBQUNILEtBSE0sTUFHQTtBQUNILFlBQU0sRUFBRUksUUFBUSxFQUFFLHVCQUFaLEVBQXFDQyxPQUFPLEVBQUUsaUNBQTlDLEVBQU4sQ0FERyxDQUNzRjtBQUM1RjtBQUNKLEc7O0FBRVk7QUFDVCxhQUFPLEtBQUtDLE9BQVo7QUFDSCxLOztBQUVVQyxJQUFBQSxDLEVBQUc7QUFDVixXQUFLRCxPQUFMLEdBQWVDLENBQWY7QUFDSCxLOztBQUVlO0FBQ1osYUFBTyxLQUFLQyxVQUFaO0FBQ0gsSzs7QUFFYUQsSUFBQUEsQyxFQUFHO0FBQ2IsV0FBS0MsVUFBTCxHQUFrQkQsQ0FBbEI7QUFDSCxLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL3N0cmluZy5qcyc7XG5cbmltcG9ydCBTcWxDb2x1bW4gZnJvbSAnLi9zcWwtY29sdW1uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3FsT3JkZXIge1xuICAgIGNvbnN0cnVjdG9yKHNxbE9iamVjdCwgZGlyKSB7XG4gICAgICAgIGlmICghbmV3LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTcWxPcmRlcihzcWxPYmplY3QsIGRpcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3FsT2JqZWN0IGluc3RhbmNlb2YgU3FsT3JkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuQ29sdW1uID0gc3FsT2JqZWN0LkNvbHVtbjtcbiAgICAgICAgICAgIHRoaXMuRGlyZWN0aW9uID0gZGlyIHx8IHNxbE9iamVjdC5EaXJlY3Rpb24gfHwgJ0FTQyc7XG4gICAgICAgIH0gZWxzZSBpZiAoc3FsT2JqZWN0IGluc3RhbmNlb2YgU3FsQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLkNvbHVtbiA9IHNxbE9iamVjdDtcbiAgICAgICAgICAgIHRoaXMuRGlyZWN0aW9uID0gZGlyIHx8ICdBU0MnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgeyBsb2NhdGlvbjogJ1NxbE9yZGVyOjpjb25zdHJ1Y3RvcicsIG1lc3NhZ2U6ICdkaWQgbm90IHBhc3MgYSBTcWxDb2x1bW4gb2JqZWN0JyB9OyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgQ29sdW1uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29sdW1uO1xuICAgIH1cblxuICAgIHNldCBDb2x1bW4odikge1xuICAgICAgICB0aGlzLl9jb2x1bW4gPSB2O1xuICAgIH1cblxuICAgIGdldCBEaXJlY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJlY3Rpb247XG4gICAgfVxuXG4gICAgc2V0IERpcmVjdGlvbih2KSB7XG4gICAgICAgIHRoaXMuX2RpcmVjdGlvbiA9IHY7XG4gICAgfVxufVxuIl19