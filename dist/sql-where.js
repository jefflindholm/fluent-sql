"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;require("./string.js");
var _helpers = require("./helpers");function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}var

SqlWhere = /*#__PURE__*/function () {
  function SqlWhere(details) {_classCallCheck(this, SqlWhere);
    if (!(this instanceof SqlWhere ? this.constructor : void 0)) {
      return new SqlWhere(details);
    }
    this.Wheres = [];
    if (details) {
      this.Column = details.Column;
      this.Op = details.Op;
      this.Value = details.Value;
    }
    this.add = function (whereClause) {
      var result = this;
      if (this.Column != null) {
        result = new SqlWhere();
        result.type = this.type;
        this.type = null;
        result.Wheres.push(this);
      }
      result.Wheres.push(whereClause);
      return result;
    };
  }_createClass(SqlWhere, [{ key: "or", value: function or(









































    whereClause) {
      if (this.type && this.type !== 'or') {
        throw new _helpers.SqlError('SqlWhere::or', "cannot add 'or' to 'and' group");
      }
      this.type = 'or';
      return this.add(whereClause);
    } }, { key: "and", value: function and(

    whereClause) {
      if (this.type && this.type !== 'and') {
        throw new _helpers.SqlError('SqlWhere::and', "cannot add 'and' to 'or' group");
      }
      this.type = 'and';
      return this.add(whereClause);
    } }, { key: "Wheres", get: function get() {return this._Wheres;}, set: function set(v) {this._Wheres = v;} }, { key: "Column", get: function get() {return this._Column;}, set: function set(v) {this._Column = v;} }, { key: "Op", get: function get() {return this._Op;}, set: function set(v) {this._Op = v;} }, { key: "Value", get: function get() {return this._Value;}, set: function set(v) {this._Value = v;} }, { key: "type", get: function get() {return this._type;}, set: function set(v) {this._type = v;} }]);return SqlWhere;}();exports.default = SqlWhere;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcWwtd2hlcmUuanMiXSwibmFtZXMiOlsiU3FsV2hlcmUiLCJkZXRhaWxzIiwiV2hlcmVzIiwiQ29sdW1uIiwiT3AiLCJWYWx1ZSIsImFkZCIsIndoZXJlQ2xhdXNlIiwicmVzdWx0IiwidHlwZSIsInB1c2giLCJTcWxFcnJvciIsIl9XaGVyZXMiLCJ2IiwiX0NvbHVtbiIsIl9PcCIsIl9WYWx1ZSIsIl90eXBlIl0sIm1hcHBpbmdzIjoib0dBQUE7QUFDQSxvQzs7QUFFcUJBLFE7QUFDakIsb0JBQVlDLE9BQVosRUFBcUI7QUFDakIsUUFBSSx1REFBSixFQUFpQjtBQUNiLGFBQU8sSUFBSUQsUUFBSixDQUFhQyxPQUFiLENBQVA7QUFDSDtBQUNELFNBQUtDLE1BQUwsR0FBYyxFQUFkO0FBQ0EsUUFBSUQsT0FBSixFQUFhO0FBQ1QsV0FBS0UsTUFBTCxHQUFjRixPQUFPLENBQUNFLE1BQXRCO0FBQ0EsV0FBS0MsRUFBTCxHQUFVSCxPQUFPLENBQUNHLEVBQWxCO0FBQ0EsV0FBS0MsS0FBTCxHQUFhSixPQUFPLENBQUNJLEtBQXJCO0FBQ0g7QUFDRCxTQUFLQyxHQUFMLEdBQVcsVUFBVUMsV0FBVixFQUF1QjtBQUM5QixVQUFJQyxNQUFNLEdBQUcsSUFBYjtBQUNBLFVBQUksS0FBS0wsTUFBTCxJQUFlLElBQW5CLEVBQXlCO0FBQ3JCSyxRQUFBQSxNQUFNLEdBQUcsSUFBSVIsUUFBSixFQUFUO0FBQ0FRLFFBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxHQUFjLEtBQUtBLElBQW5CO0FBQ0EsYUFBS0EsSUFBTCxHQUFZLElBQVo7QUFDQUQsUUFBQUEsTUFBTSxDQUFDTixNQUFQLENBQWNRLElBQWQsQ0FBbUIsSUFBbkI7QUFDSDtBQUNERixNQUFBQSxNQUFNLENBQUNOLE1BQVAsQ0FBY1EsSUFBZCxDQUFtQkgsV0FBbkI7QUFDQSxhQUFPQyxNQUFQO0FBQ0gsS0FWRDtBQVdILEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBDRUQsSUFBQUEsVyxFQUFhO0FBQ1osVUFBSSxLQUFLRSxJQUFMLElBQWEsS0FBS0EsSUFBTCxLQUFjLElBQS9CLEVBQXFDO0FBQ2pDLGNBQU0sSUFBSUUsaUJBQUosQ0FBYSxjQUFiLEVBQTZCLGdDQUE3QixDQUFOO0FBQ0g7QUFDRCxXQUFLRixJQUFMLEdBQVksSUFBWjtBQUNBLGFBQU8sS0FBS0gsR0FBTCxDQUFTQyxXQUFULENBQVA7QUFDSCxLOztBQUVHQSxJQUFBQSxXLEVBQWE7QUFDYixVQUFJLEtBQUtFLElBQUwsSUFBYSxLQUFLQSxJQUFMLEtBQWMsS0FBL0IsRUFBc0M7QUFDbEMsY0FBTSxJQUFJRSxpQkFBSixDQUFhLGVBQWIsRUFBOEIsZ0NBQTlCLENBQU47QUFDSDtBQUNELFdBQUtGLElBQUwsR0FBWSxLQUFaO0FBQ0EsYUFBTyxLQUFLSCxHQUFMLENBQVNDLFdBQVQsQ0FBUDtBQUNILEsseUNBdERZLENBQ1QsT0FBTyxLQUFLSyxPQUFaLENBQ0gsQyxvQkFrQlVDLEMsRUFBRyxDQUNWLEtBQUtELE9BQUwsR0FBZUMsQ0FBZixDQUNILEMseUNBbEJZLENBQ1QsT0FBTyxLQUFLQyxPQUFaLENBQ0gsQyxvQkFrQlVELEMsRUFBRyxDQUNWLEtBQUtDLE9BQUwsR0FBZUQsQ0FBZixDQUNILEMscUNBbEJRLENBQ0wsT0FBTyxLQUFLRSxHQUFaLENBQ0gsQyxvQkFrQk1GLEMsRUFBRyxDQUNOLEtBQUtFLEdBQUwsR0FBV0YsQ0FBWCxDQUNILEMsd0NBbEJXLENBQ1IsT0FBTyxLQUFLRyxNQUFaLENBQ0gsQyxvQkFrQlNILEMsRUFBRyxDQUNULEtBQUtHLE1BQUwsR0FBY0gsQ0FBZCxDQUNILEMsdUNBbEJVLENBQ1AsT0FBTyxLQUFLSSxLQUFaLENBQ0gsQyxvQkFrQlFKLEMsRUFBRyxDQUNSLEtBQUtJLEtBQUwsR0FBYUosQ0FBYixDQUNILEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vc3RyaW5nLmpzJztcbmltcG9ydCB7IFNxbEVycm9yIH0gZnJvbSAnLi9oZWxwZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3FsV2hlcmUge1xuICAgIGNvbnN0cnVjdG9yKGRldGFpbHMpIHtcbiAgICAgICAgaWYgKCFuZXcudGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNxbFdoZXJlKGRldGFpbHMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuV2hlcmVzID0gW107XG4gICAgICAgIGlmIChkZXRhaWxzKSB7XG4gICAgICAgICAgICB0aGlzLkNvbHVtbiA9IGRldGFpbHMuQ29sdW1uO1xuICAgICAgICAgICAgdGhpcy5PcCA9IGRldGFpbHMuT3A7XG4gICAgICAgICAgICB0aGlzLlZhbHVlID0gZGV0YWlscy5WYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uICh3aGVyZUNsYXVzZSkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhpcy5Db2x1bW4gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBTcWxXaGVyZSgpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC50eXBlID0gdGhpcy50eXBlO1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmVzdWx0LldoZXJlcy5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LldoZXJlcy5wdXNoKHdoZXJlQ2xhdXNlKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0IFdoZXJlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX1doZXJlcztcbiAgICB9XG5cbiAgICBnZXQgQ29sdW1uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fQ29sdW1uO1xuICAgIH1cblxuICAgIGdldCBPcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX09wO1xuICAgIH1cblxuICAgIGdldCBWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX1ZhbHVlO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICB9XG5cbiAgICBzZXQgV2hlcmVzKHYpIHtcbiAgICAgICAgdGhpcy5fV2hlcmVzID0gdjtcbiAgICB9XG5cbiAgICBzZXQgQ29sdW1uKHYpIHtcbiAgICAgICAgdGhpcy5fQ29sdW1uID0gdjtcbiAgICB9XG5cbiAgICBzZXQgT3Aodikge1xuICAgICAgICB0aGlzLl9PcCA9IHY7XG4gICAgfVxuXG4gICAgc2V0IFZhbHVlKHYpIHtcbiAgICAgICAgdGhpcy5fVmFsdWUgPSB2O1xuICAgIH1cblxuICAgIHNldCB0eXBlKHYpIHtcbiAgICAgICAgdGhpcy5fdHlwZSA9IHY7XG4gICAgfVxuXG4gICAgb3Iod2hlcmVDbGF1c2UpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAmJiB0aGlzLnR5cGUgIT09ICdvcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTcWxFcnJvcignU3FsV2hlcmU6Om9yJywgXCJjYW5ub3QgYWRkICdvcicgdG8gJ2FuZCcgZ3JvdXBcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50eXBlID0gJ29yJztcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKHdoZXJlQ2xhdXNlKTtcbiAgICB9XG5cbiAgICBhbmQod2hlcmVDbGF1c2UpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAmJiB0aGlzLnR5cGUgIT09ICdhbmQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3FsRXJyb3IoJ1NxbFdoZXJlOjphbmQnLCBcImNhbm5vdCBhZGQgJ2FuZCcgdG8gJ29yJyBncm91cFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnR5cGUgPSAnYW5kJztcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKHdoZXJlQ2xhdXNlKTtcbiAgICB9XG59XG4iXX0=