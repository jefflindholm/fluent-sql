"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;require("./string.js");

var _sqlColumn = _interopRequireDefault(require("./sql-column"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}var

SqlJoin = /*#__PURE__*/function () {
  function SqlJoin(sqlColumn) {_classCallCheck(this, SqlJoin);
    if (!(this instanceof SqlJoin ? this.constructor : void 0)) {
      return new SqlJoin(sqlColumn);
    }
    if (!(sqlColumn instanceof _sqlColumn.default)) {
      throw { location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn' }; // eslint-disable-line
    }
    this.From = sqlColumn;
  }_createClass(SqlJoin, [{ key: "using", value: function using(












    sqlColumn) {
      if (!(sqlColumn instanceof _sqlColumn.default)) {
        throw { location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn' }; //eslint-disable-line
      }
      this.To = sqlColumn;
      return this;
    } }, { key: "From", get: function get() {return this._from;}, set: function set(v) {this._from = v;} }, { key: "To", get: function get() {return this._to;}, set: function set(v) {this._to = v;} }]);return SqlJoin;}();exports.default = SqlJoin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcWwtam9pbi5qcyJdLCJuYW1lcyI6WyJTcWxKb2luIiwic3FsQ29sdW1uIiwiU3FsQ29sdW1uIiwibG9jYXRpb24iLCJtZXNzYWdlIiwiRnJvbSIsIlRvIiwiX2Zyb20iLCJ2IiwiX3RvIl0sIm1hcHBpbmdzIjoib0dBQUE7O0FBRUEsaUU7O0FBRXFCQSxPO0FBQ2pCLG1CQUFZQyxTQUFaLEVBQXVCO0FBQ25CLFFBQUksc0RBQUosRUFBaUI7QUFDYixhQUFPLElBQUlELE9BQUosQ0FBWUMsU0FBWixDQUFQO0FBQ0g7QUFDRCxRQUFJLEVBQUVBLFNBQVMsWUFBWUMsa0JBQXZCLENBQUosRUFBdUM7QUFDbkMsWUFBTSxFQUFFQyxRQUFRLEVBQUUsc0JBQVosRUFBb0NDLE9BQU8sRUFBRSw2Q0FBN0MsRUFBTixDQURtQyxDQUNpRTtBQUN2RztBQUNELFNBQUtDLElBQUwsR0FBWUosU0FBWjtBQUNILEc7Ozs7Ozs7Ozs7Ozs7QUFhS0EsSUFBQUEsUyxFQUFXO0FBQ2IsVUFBSSxFQUFFQSxTQUFTLFlBQVlDLGtCQUF2QixDQUFKLEVBQXVDO0FBQ25DLGNBQU0sRUFBRUMsUUFBUSxFQUFFLGdCQUFaLEVBQThCQyxPQUFPLEVBQUUsNkNBQXZDLEVBQU4sQ0FEbUMsQ0FDMkQ7QUFDakc7QUFDRCxXQUFLRSxFQUFMLEdBQVVMLFNBQVY7QUFDQSxhQUFPLElBQVA7QUFDSCxLLHVDQWxCVSxDQUNQLE9BQU8sS0FBS00sS0FBWixDQUNILEMsb0JBQ1FDLEMsRUFBRyxDQUNSLEtBQUtELEtBQUwsR0FBYUMsQ0FBYixDQUNILEMscUNBQ1EsQ0FDTCxPQUFPLEtBQUtDLEdBQVosQ0FDSCxDLG9CQUNNRCxDLEVBQUcsQ0FDTixLQUFLQyxHQUFMLEdBQVdELENBQVgsQ0FDSCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL3N0cmluZy5qcyc7XG5cbmltcG9ydCBTcWxDb2x1bW4gZnJvbSAnLi9zcWwtY29sdW1uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3FsSm9pbiB7XG4gICAgY29uc3RydWN0b3Ioc3FsQ29sdW1uKSB7XG4gICAgICAgIGlmICghbmV3LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTcWxKb2luKHNxbENvbHVtbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoc3FsQ29sdW1uIGluc3RhbmNlb2YgU3FsQ29sdW1uKSkge1xuICAgICAgICAgICAgdGhyb3cgeyBsb2NhdGlvbjogJ1NxbEpvaW46OmNvbnN0cnVjdG9yJywgbWVzc2FnZTogJ3RyeWluZyB0byBqb2luIG9uIHNvbWV0aGluZyBub3QgYSBTcWxDb2x1bW4nIH07IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLkZyb20gPSBzcWxDb2x1bW47XG4gICAgfVxuICAgIGdldCBGcm9tKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJvbTtcbiAgICB9XG4gICAgc2V0IEZyb20odikge1xuICAgICAgICB0aGlzLl9mcm9tID0gdjtcbiAgICB9XG4gICAgZ2V0IFRvKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdG87XG4gICAgfVxuICAgIHNldCBUbyh2KSB7XG4gICAgICAgIHRoaXMuX3RvID0gdjtcbiAgICB9XG4gICAgdXNpbmcoc3FsQ29sdW1uKSB7XG4gICAgICAgIGlmICghKHNxbENvbHVtbiBpbnN0YW5jZW9mIFNxbENvbHVtbikpIHtcbiAgICAgICAgICAgIHRocm93IHsgbG9jYXRpb246ICdTcWxKb2luOjp1c2luZycsIG1lc3NhZ2U6ICd0cnlpbmcgdG8gam9pbiBvbiBzb21ldGhpbmcgbm90IGEgU3FsQ29sdW1uJyB9OyAvL2VzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLlRvID0gc3FsQ29sdW1uO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iXX0=