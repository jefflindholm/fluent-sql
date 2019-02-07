"use strict";Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, "SqlQuery", { enumerable: true, get: function get() {return _sqlQuery.default;} });Object.defineProperty(exports, "setDefaultOptions", { enumerable: true, get: function get() {return _sqlQuery.setDefaultOptions;} });Object.defineProperty(exports, "getDefaultOptions", { enumerable: true, get: function get() {return _sqlQuery.getDefaultOptions;} });Object.defineProperty(exports, "setPostgres", { enumerable: true, get: function get() {return _sqlQuery.setPostgres;} });Object.defineProperty(exports, "setSqlServer", { enumerable: true, get: function get() {return _sqlQuery.setSqlServer;} });Object.defineProperty(exports, "postgresOptions", { enumerable: true, get: function get() {return _sqlQuery.postgresOptions;} });Object.defineProperty(exports, "sqlServerOptions", { enumerable: true, get: function get() {return _sqlQuery.sqlServerOptions;} });Object.defineProperty(exports, "SqlBuilder", { enumerable: true, get: function get() {return _sqlBuilder.default;} });Object.defineProperty(exports, "SqlColumn", { enumerable: true, get: function get() {return _sqlColumn.default;} });Object.defineProperty(exports, "SqlJoin", { enumerable: true, get: function get() {return _sqlJoin.default;} });Object.defineProperty(exports, "SqlOrder", { enumerable: true, get: function get() {return _sqlOrder.default;} });Object.defineProperty(exports, "SqlTable", { enumerable: true, get: function get() {return _sqlTable.default;} });Object.defineProperty(exports, "SqlWhere", { enumerable: true, get: function get() {return _sqlWhere.default;} });Object.defineProperty(exports, "SqlError", { enumerable: true, get: function get() {return _helpers.SqlError;} });require("./string.js");

var _sqlQuery = _interopRequireWildcard(require("./sql-query"));

var _sqlBuilder = _interopRequireDefault(require("./sql-builder"));
var _sqlColumn = _interopRequireDefault(require("./sql-column"));
var _sqlJoin = _interopRequireDefault(require("./sql-join"));
var _sqlOrder = _interopRequireDefault(require("./sql-order"));
var _sqlTable = _interopRequireDefault(require("./sql-table"));
var _sqlWhere = _interopRequireDefault(require("./sql-where"));

var _helpers = require("./helpers");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) {var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};if (desc.get || desc.set) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}}newObj.default = obj;return newObj;}}









(function () {
  if (!String.prototype.sqlEscape) {
    var sqlEscape = function escape(sqlQuery, level) {
      var query = null;
      if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== 'function') {
        query = new _sqlQuery.default();
      } else {
        query = sqlQuery;
      }
      return query.sqlEscape(this, level);
    };
    String.prototype.sqlEscape = sqlEscape; // eslint-disable-line no-extend-native
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mbHVlbnQtc3FsLmpzIl0sIm5hbWVzIjpbIlN0cmluZyIsInByb3RvdHlwZSIsInNxbEVzY2FwZSIsImVzY2FwZSIsInNxbFF1ZXJ5IiwibGV2ZWwiLCJxdWVyeSIsIlNxbFF1ZXJ5Il0sIm1hcHBpbmdzIjoiaXVEQUFBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxvQzs7Ozs7Ozs7OztBQVVBLENBQUMsWUFBWTtBQUNULE1BQUksQ0FBQ0EsTUFBTSxDQUFDQyxTQUFQLENBQWlCQyxTQUF0QixFQUFpQztBQUM3QixRQUFNQSxTQUFTLEdBQUcsU0FBU0MsTUFBVCxDQUFnQkMsUUFBaEIsRUFBMEJDLEtBQTFCLEVBQWlDO0FBQy9DLFVBQUlDLEtBQUssR0FBRyxJQUFaO0FBQ0EsVUFBSSxDQUFDRixRQUFELElBQWEsQ0FBQ0EsUUFBUSxDQUFDRixTQUF2QixJQUFvQyxPQUFPRSxRQUFRLENBQUNGLFNBQWhCLEtBQThCLFVBQXRFLEVBQWtGO0FBQzlFSSxRQUFBQSxLQUFLLEdBQUcsSUFBSUMsaUJBQUosRUFBUjtBQUNILE9BRkQsTUFFTztBQUNIRCxRQUFBQSxLQUFLLEdBQUdGLFFBQVI7QUFDSDtBQUNELGFBQU9FLEtBQUssQ0FBQ0osU0FBTixDQUFnQixJQUFoQixFQUFzQkcsS0FBdEIsQ0FBUDtBQUNILEtBUkQ7QUFTQUwsSUFBQUEsTUFBTSxDQUFDQyxTQUFQLENBQWlCQyxTQUFqQixHQUE2QkEsU0FBN0IsQ0FWNkIsQ0FVVztBQUMzQztBQUNKLENBYkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vc3RyaW5nLmpzJztcblxuaW1wb3J0IFNxbFF1ZXJ5IGZyb20gJy4vc3FsLXF1ZXJ5JztcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBTcWxCdWlsZGVyIH0gZnJvbSAnLi9zcWwtYnVpbGRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNxbENvbHVtbiB9IGZyb20gJy4vc3FsLWNvbHVtbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNxbEpvaW4gfSBmcm9tICcuL3NxbC1qb2luJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3FsT3JkZXIgfSBmcm9tICcuL3NxbC1vcmRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNxbFRhYmxlIH0gZnJvbSAnLi9zcWwtdGFibGUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTcWxXaGVyZSB9IGZyb20gJy4vc3FsLXdoZXJlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3FsUXVlcnkgfSBmcm9tICcuL3NxbC1xdWVyeSc7XG5leHBvcnQgeyBTcWxFcnJvciB9IGZyb20gJy4vaGVscGVycyc7XG5leHBvcnQge1xuICAgIHNldERlZmF1bHRPcHRpb25zLFxuICAgIGdldERlZmF1bHRPcHRpb25zLFxuICAgIHNldFBvc3RncmVzLFxuICAgIHNldFNxbFNlcnZlcixcbiAgICBwb3N0Z3Jlc09wdGlvbnMsXG4gICAgc3FsU2VydmVyT3B0aW9uc1xufSBmcm9tICcuL3NxbC1xdWVyeSc7XG5cbihmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFTdHJpbmcucHJvdG90eXBlLnNxbEVzY2FwZSkge1xuICAgICAgICBjb25zdCBzcWxFc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUoc3FsUXVlcnksIGxldmVsKSB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFzcWxRdWVyeSB8fCAhc3FsUXVlcnkuc3FsRXNjYXBlIHx8IHR5cGVvZiBzcWxRdWVyeS5zcWxFc2NhcGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IG5ldyBTcWxRdWVyeSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHNxbFF1ZXJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5LnNxbEVzY2FwZSh0aGlzLCBsZXZlbCk7XG4gICAgICAgIH07XG4gICAgICAgIFN0cmluZy5wcm90b3R5cGUuc3FsRXNjYXBlID0gc3FsRXNjYXBlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV4dGVuZC1uYXRpdmVcbiAgICB9XG59KSgpO1xuIl19