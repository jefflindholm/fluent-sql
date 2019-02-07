"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;require("./string.js");

var _sqlOrder = _interopRequireDefault(require("./sql-order"));
var _sqlTable = _interopRequireDefault(require("./sql-table"));
var _sqlWhere = _interopRequireDefault(require("./sql-where"));
var _helpers = require("./helpers");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}var

SqlAggregate = /*#__PURE__*/function () {
  function SqlAggregate(table, column, operation) {_classCallCheck(this, SqlAggregate);
    this.table = table;
    this.column = column;
    this.operation = operation;
    this.column.Alias = "".concat(this.column.Alias || this.column.ColumnName, "_").concat(operation.toLowerCase());
  }_createClass(SqlAggregate, [{ key: "on", value: function on(
    sqlColumn) {
      this.groupBy = sqlColumn;
      return this.column;
    } }, { key: "by", value: function by(
    sqlColumn) {
      return this.on(sqlColumn);
    } }]);return SqlAggregate;}();var

SqlColumn = /*#__PURE__*/function () {
  function SqlColumn(sqlObject, columnName, literal) {_classCallCheck(this, SqlColumn);
    if (!(this instanceof SqlColumn ? this.constructor : void 0)) {
      return new SqlColumn(sqlObject, columnName, literal);
    }
    if (sqlObject instanceof SqlColumn) {
      this.Table = sqlObject.Table;
      this.ColumnName = sqlObject.ColumnName;
      this.Literal = sqlObject.Literal;
      this.Alias = sqlObject.Alias;
      this.Not = sqlObject.Not;
      this.Values = sqlObject.Values;
      this.Aggregate = sqlObject.Aggregate;
      this._grouped = sqlObject._grouped;
    } else if (sqlObject != null && sqlObject.Literal) {
      this.Literal = sqlObject.Literal;
      this.Alias = sqlObject.Alias;
    } else if (sqlObject != null && !(sqlObject instanceof _sqlTable.default)) {
      throw { location: 'SqlColumn::constructor', message: 'must construct using a SqlTable' }; // eslint-disable-line no-throw-literal
    } else {
      this.Table = sqlObject;
      this.ColumnName = columnName;
      this.Literal = literal;
      this.Alias = columnName ? columnName.toCamel() : undefined; // eslint-disable-line no-undefined
    }
  }
  // aggregate functions
  _createClass(SqlColumn, [{ key: "aggregate", value: function aggregate(op) {
      var column = new SqlColumn(this);
      column.Aggregate = new SqlAggregate(column.table, column, op);
      return column.Aggregate;
    } }, { key: "avg", value: function avg()
    {
      return this.aggregate('AVG');
    } }, { key: "checksum", value: function checksum()

    {
      return this.aggregate('CHECKSUM_AGG');
    } }, { key: "count", value: function count()
    {
      return this.aggregate('COUNT');
    } }, { key: "countBig", value: function countBig()
    {
      return this.aggregate('COUNT_BIG');
    } }, { key: "grouping", value: function grouping()
    {
      return this.aggregate('GROUPING');
    } }, { key: "groupingId", value: function groupingId()
    {
      return this.aggregate('GROUPING_ID');
    } }, { key: "max", value: function max()
    {
      return this.aggregate('MAX');
    } }, { key: "min", value: function min()
    {
      return this.aggregate('MIN');
    } }, { key: "sum", value: function sum()
    {
      return this.aggregate('SUM');
    } }, { key: "stdev", value: function stdev()
    {
      return this.aggregate('STDEV');
    } }, { key: "stdevp", value: function stdevp()
    {
      return this.aggregate('STDEVP');
    }
    // VAR
  }, { key: "varp", value: function varp() {
      return this.aggregate('VARP');
    } }, { key: "qualifiedName", value: function qualifiedName(

    sqlQuery) {
      return this.Literal || "".concat(this.Table.Alias.sqlEscape(sqlQuery, 'table-alias'), ".").concat(this.ColumnName);
    } }, { key: "as", value: function as(
    alias) {
      var col = new SqlColumn(this);
      col.Alias = alias;
      return col;
    } }, { key: "using", value: function using(
    values) {
      var col = new SqlColumn(this);
      col.Values = values;
      return col;
    } }, { key: "groupBy", value: function groupBy()
    {
      var col = new SqlColumn(this);
      col._grouped = true;
      return col;
    } }, { key: "eq", value: function eq(










































    val) {
      return new _sqlWhere.default({ Column: this, Op: '=', Value: val });
    } }, { key: "ne", value: function ne(
    val) {
      return new _sqlWhere.default({ Column: this, Op: '<>', Value: val });
    } }, { key: "gt", value: function gt(
    val) {
      return new _sqlWhere.default({ Column: this, Op: '>', Value: val });
    } }, { key: "gte", value: function gte(
    val) {
      return new _sqlWhere.default({ Column: this, Op: '>=', Value: val });
    } }, { key: "lt", value: function lt(
    val) {
      return new _sqlWhere.default({ Column: this, Op: '<', Value: val });
    } }, { key: "isNull", value: function isNull()
    {
      return new _sqlWhere.default({ Column: this, Op: 'IS NULL' });
    } }, { key: "isNotNull", value: function isNotNull()
    {
      return new _sqlWhere.default({ Column: this, Op: 'IS NOT NULL' });
    } }, { key: "lte", value: function lte(
    val) {
      return new _sqlWhere.default({ Column: this, Op: '<=', Value: val });
    } }, { key: "like", value: function like(
    val) {
      var value = val;
      if (typeof value === 'string') {
        value = "%".concat(value, "%");
      }
      return new _sqlWhere.default({ Column: this, Op: 'like', Value: value });
    } }, { key: "starts", value: function starts(
    val) {
      var value = val;
      if (typeof value === 'string') {
        value = "".concat(value, "%");
      }
      return new _sqlWhere.default({ Column: this, Op: 'like', Value: value });
    } }, { key: "ends", value: function ends(
    val) {
      var value = val;
      if (typeof value === 'string') {
        value = "%".concat(value);
      }
      return new _sqlWhere.default({ Column: this, Op: 'like', Value: value });
    } }, { key: "in", value: function _in()
    {
      var values = [];for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
      _helpers.processArgs.apply(void 0, [function (v) {values.push(v);}].concat(args)); // eslint-disable-line brace-style
      return new _sqlWhere.default({ Column: this, Op: 'in', Value: values });
    } }, { key: "between", value: function between(
    val1, val2) {
      return this.gte(val1).and(this.lte(val2));
    } }, { key: "op", value: function op(
    _op, val1, val2) {
      var o = _op;
      if (!this[o]) {
        o = o.toLowerCase();
      }
      return this[o](val1, val2);
    } }, { key: "asc", value: function asc()
    {
      return new _sqlOrder.default(this, 'ASC');
    } }, { key: "desc", value: function desc()
    {
      return new _sqlOrder.default(this, 'DESC');
    } }, { key: "direction", value: function direction(
    dir) {
      return new _sqlOrder.default(this, dir);
    } }, { key: "dir", value: function dir(
    _dir) {
      return new _sqlOrder.default(this, _dir);
    } }, { key: "not", value: function not()
    {
      var col = new SqlColumn(this);
      col.Not = true;
      return col;
    } }, { key: "Table", get: function get() {return this._table;}, set: function set(v) {this._table = v;} }, { key: "ColumnName", get: function get() {return this._columnName;}, set: function set(v) {this._columnName = v;} }, { key: "Literal", get: function get() {return this._literal;}, set: function set(v) {this._literal = v;} }, { key: "Alias", get: function get() {return this._alias;}, set: function set(v) {this._alias = v;} }, { key: "Not", get: function get() {return this._not;}, set: function set(v) {this._not = v;} }, { key: "Values", get: function get() {return this._values;}, set: function set(v) {this._values = v;} }, { key: "Grouped", get: function get() {return this._grouped;}, set: function set(v) {this._grouped = v;} }]);return SqlColumn;}();exports.default = SqlColumn;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcWwtY29sdW1uLmpzIl0sIm5hbWVzIjpbIlNxbEFnZ3JlZ2F0ZSIsInRhYmxlIiwiY29sdW1uIiwib3BlcmF0aW9uIiwiQWxpYXMiLCJDb2x1bW5OYW1lIiwidG9Mb3dlckNhc2UiLCJzcWxDb2x1bW4iLCJncm91cEJ5Iiwib24iLCJTcWxDb2x1bW4iLCJzcWxPYmplY3QiLCJjb2x1bW5OYW1lIiwibGl0ZXJhbCIsIlRhYmxlIiwiTGl0ZXJhbCIsIk5vdCIsIlZhbHVlcyIsIkFnZ3JlZ2F0ZSIsIl9ncm91cGVkIiwiU3FsVGFibGUiLCJsb2NhdGlvbiIsIm1lc3NhZ2UiLCJ0b0NhbWVsIiwidW5kZWZpbmVkIiwib3AiLCJhZ2dyZWdhdGUiLCJzcWxRdWVyeSIsInNxbEVzY2FwZSIsImFsaWFzIiwiY29sIiwidmFsdWVzIiwidmFsIiwiU3FsV2hlcmUiLCJDb2x1bW4iLCJPcCIsIlZhbHVlIiwidmFsdWUiLCJhcmdzIiwicHJvY2Vzc0FyZ3MiLCJ2IiwicHVzaCIsInZhbDEiLCJ2YWwyIiwiZ3RlIiwiYW5kIiwibHRlIiwibyIsIlNxbE9yZGVyIiwiZGlyIiwiX3RhYmxlIiwiX2NvbHVtbk5hbWUiLCJfbGl0ZXJhbCIsIl9hbGlhcyIsIl9ub3QiLCJfdmFsdWVzIl0sIm1hcHBpbmdzIjoib0dBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0M7O0FBRU1BLFk7QUFDRix3QkFBWUMsS0FBWixFQUFtQkMsTUFBbkIsRUFBMkJDLFNBQTNCLEVBQXNDO0FBQ2xDLFNBQUtGLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsU0FBS0QsTUFBTCxDQUFZRSxLQUFaLGFBQXVCLEtBQUtGLE1BQUwsQ0FBWUUsS0FBWixJQUFxQixLQUFLRixNQUFMLENBQVlHLFVBQXhELGNBQXNFRixTQUFTLENBQUNHLFdBQVYsRUFBdEU7QUFDSCxHO0FBQ0VDLElBQUFBLFMsRUFBVztB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QVosQ0FDSCxDLG9CQUNTYixDLEVBQUcsQ0FDVCxLQUFLYSxNQUFMLEdBQWNiLENBQWQsQ0FDSCxDLHNDQUNTLENBQ04sT0FBTyxLQUFLYyxJQUFaLENBQ0gsQyxvQkFDT2QsQyxFQUFHLENBQ1AsS0FBS2MsSUFBTCxHQUFZZCxDQUFaLENBQ0gsQyx5Q0FDWSxDQUNULE9BQU8sS0FBS2UsT0FBWixDQUNILEMsb0JBQ1VmLEMsRUFBRyxDQUNWLEtBQUtlLE9BQUwsR0FBZWYsQ0FBZixDQUNILEMsMENBQ2EsQ0FDVixPQUFPLEtBQUtyQixRQUFaLENBQ0gsQyxvQkFDV3FCLEMsRUFBRyxDQUNYLEtBQUtyQixRQUFMLEdBQWdCcUIsQ0FBaEIsQ0FDSCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL3N0cmluZy5qcyc7XG5cbmltcG9ydCBTcWxPcmRlciBmcm9tICcuL3NxbC1vcmRlcic7XG5pbXBvcnQgU3FsVGFibGUgZnJvbSAnLi9zcWwtdGFibGUnO1xuaW1wb3J0IFNxbFdoZXJlIGZyb20gJy4vc3FsLXdoZXJlJztcbmltcG9ydCB7IHByb2Nlc3NBcmdzIH0gZnJvbSAnLi9oZWxwZXJzJztcblxuY2xhc3MgU3FsQWdncmVnYXRlIHtcbiAgICBjb25zdHJ1Y3Rvcih0YWJsZSwgY29sdW1uLCBvcGVyYXRpb24pIHtcbiAgICAgICAgdGhpcy50YWJsZSA9IHRhYmxlO1xuICAgICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb247XG4gICAgICAgIHRoaXMuY29sdW1uLkFsaWFzID0gYCR7dGhpcy5jb2x1bW4uQWxpYXMgfHwgdGhpcy5jb2x1bW4uQ29sdW1uTmFtZX1fJHtvcGVyYXRpb24udG9Mb3dlckNhc2UoKX1gO1xuICAgIH1cbiAgICBvbihzcWxDb2x1bW4pIHtcbiAgICAgICAgdGhpcy5ncm91cEJ5ID0gc3FsQ29sdW1uO1xuICAgICAgICByZXR1cm4gdGhpcy5jb2x1bW47XG4gICAgfVxuICAgIGJ5KHNxbENvbHVtbikge1xuICAgICAgICByZXR1cm4gdGhpcy5vbihzcWxDb2x1bW4pO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNxbENvbHVtbiB7XG4gICAgY29uc3RydWN0b3Ioc3FsT2JqZWN0LCBjb2x1bW5OYW1lLCBsaXRlcmFsKSB7XG4gICAgICAgIGlmICghbmV3LnRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTcWxDb2x1bW4oc3FsT2JqZWN0LCBjb2x1bW5OYW1lLCBsaXRlcmFsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3FsT2JqZWN0IGluc3RhbmNlb2YgU3FsQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLlRhYmxlID0gc3FsT2JqZWN0LlRhYmxlO1xuICAgICAgICAgICAgdGhpcy5Db2x1bW5OYW1lID0gc3FsT2JqZWN0LkNvbHVtbk5hbWU7XG4gICAgICAgICAgICB0aGlzLkxpdGVyYWwgPSBzcWxPYmplY3QuTGl0ZXJhbDtcbiAgICAgICAgICAgIHRoaXMuQWxpYXMgPSBzcWxPYmplY3QuQWxpYXM7XG4gICAgICAgICAgICB0aGlzLk5vdCA9IHNxbE9iamVjdC5Ob3Q7XG4gICAgICAgICAgICB0aGlzLlZhbHVlcyA9IHNxbE9iamVjdC5WYWx1ZXM7XG4gICAgICAgICAgICB0aGlzLkFnZ3JlZ2F0ZSA9IHNxbE9iamVjdC5BZ2dyZWdhdGU7XG4gICAgICAgICAgICB0aGlzLl9ncm91cGVkID0gc3FsT2JqZWN0Ll9ncm91cGVkO1xuICAgICAgICB9IGVsc2UgaWYgKHNxbE9iamVjdCAhPSBudWxsICYmIHNxbE9iamVjdC5MaXRlcmFsKSB7XG4gICAgICAgICAgICB0aGlzLkxpdGVyYWwgPSBzcWxPYmplY3QuTGl0ZXJhbDtcbiAgICAgICAgICAgIHRoaXMuQWxpYXMgPSBzcWxPYmplY3QuQWxpYXM7XG4gICAgICAgIH0gZWxzZSBpZiAoc3FsT2JqZWN0ICE9IG51bGwgJiYgIShzcWxPYmplY3QgaW5zdGFuY2VvZiBTcWxUYWJsZSkpIHtcbiAgICAgICAgICAgIHRocm93IHsgbG9jYXRpb246ICdTcWxDb2x1bW46OmNvbnN0cnVjdG9yJywgbWVzc2FnZTogJ211c3QgY29uc3RydWN0IHVzaW5nIGEgU3FsVGFibGUnIH07IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdGhyb3ctbGl0ZXJhbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5UYWJsZSA9IHNxbE9iamVjdDtcbiAgICAgICAgICAgIHRoaXMuQ29sdW1uTmFtZSA9IGNvbHVtbk5hbWU7XG4gICAgICAgICAgICB0aGlzLkxpdGVyYWwgPSBsaXRlcmFsO1xuICAgICAgICAgICAgdGhpcy5BbGlhcyA9IGNvbHVtbk5hbWUgPyBjb2x1bW5OYW1lLnRvQ2FtZWwoKSA6IHVuZGVmaW5lZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZmluZWRcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBhZ2dyZWdhdGUgZnVuY3Rpb25zXG4gICAgYWdncmVnYXRlKG9wKSB7XG4gICAgICAgIGNvbnN0IGNvbHVtbiA9IG5ldyBTcWxDb2x1bW4odGhpcyk7XG4gICAgICAgIGNvbHVtbi5BZ2dyZWdhdGUgPSBuZXcgU3FsQWdncmVnYXRlKGNvbHVtbi50YWJsZSwgY29sdW1uLCBvcCk7XG4gICAgICAgIHJldHVybiBjb2x1bW4uQWdncmVnYXRlO1xuICAgIH1cbiAgICBhdmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZ3JlZ2F0ZSgnQVZHJyk7XG4gICAgfVxuXG4gICAgY2hlY2tzdW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZ3JlZ2F0ZSgnQ0hFQ0tTVU1fQUdHJyk7XG4gICAgfVxuICAgIGNvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGUoJ0NPVU5UJyk7XG4gICAgfVxuICAgIGNvdW50QmlnKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGUoJ0NPVU5UX0JJRycpO1xuICAgIH1cbiAgICBncm91cGluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdncmVnYXRlKCdHUk9VUElORycpO1xuICAgIH1cbiAgICBncm91cGluZ0lkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGUoJ0dST1VQSU5HX0lEJyk7XG4gICAgfVxuICAgIG1heCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdncmVnYXRlKCdNQVgnKTtcbiAgICB9XG4gICAgbWluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGUoJ01JTicpO1xuICAgIH1cbiAgICBzdW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFnZ3JlZ2F0ZSgnU1VNJyk7XG4gICAgfVxuICAgIHN0ZGV2KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hZ2dyZWdhdGUoJ1NUREVWJyk7XG4gICAgfVxuICAgIHN0ZGV2cCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdncmVnYXRlKCdTVERFVlAnKTtcbiAgICB9XG4gICAgLy8gVkFSXG4gICAgdmFycCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWdncmVnYXRlKCdWQVJQJyk7XG4gICAgfVxuXG4gICAgcXVhbGlmaWVkTmFtZShzcWxRdWVyeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5MaXRlcmFsIHx8IGAke3RoaXMuVGFibGUuQWxpYXMuc3FsRXNjYXBlKHNxbFF1ZXJ5LCAndGFibGUtYWxpYXMnKX0uJHt0aGlzLkNvbHVtbk5hbWV9YDtcbiAgICB9XG4gICAgYXMoYWxpYXMpIHtcbiAgICAgICAgY29uc3QgY29sID0gbmV3IFNxbENvbHVtbih0aGlzKTtcbiAgICAgICAgY29sLkFsaWFzID0gYWxpYXM7XG4gICAgICAgIHJldHVybiBjb2w7XG4gICAgfVxuICAgIHVzaW5nKHZhbHVlcykge1xuICAgICAgICBjb25zdCBjb2wgPSBuZXcgU3FsQ29sdW1uKHRoaXMpO1xuICAgICAgICBjb2wuVmFsdWVzID0gdmFsdWVzO1xuICAgICAgICByZXR1cm4gY29sO1xuICAgIH1cbiAgICBncm91cEJ5KCkge1xuICAgICAgICBjb25zdCBjb2wgPSBuZXcgU3FsQ29sdW1uKHRoaXMpO1xuICAgICAgICBjb2wuX2dyb3VwZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gY29sO1xuICAgIH1cbiAgICBnZXQgVGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90YWJsZTtcbiAgICB9XG4gICAgc2V0IFRhYmxlKHYpIHtcbiAgICAgICAgdGhpcy5fdGFibGUgPSB2O1xuICAgIH1cbiAgICBnZXQgQ29sdW1uTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbHVtbk5hbWU7XG4gICAgfVxuICAgIHNldCBDb2x1bW5OYW1lKHYpIHtcbiAgICAgICAgdGhpcy5fY29sdW1uTmFtZSA9IHY7XG4gICAgfVxuICAgIGdldCBMaXRlcmFsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGl0ZXJhbDtcbiAgICB9XG4gICAgc2V0IExpdGVyYWwodikge1xuICAgICAgICB0aGlzLl9saXRlcmFsID0gdjtcbiAgICB9XG4gICAgZ2V0IEFsaWFzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWxpYXM7XG4gICAgfVxuICAgIHNldCBBbGlhcyh2KSB7XG4gICAgICAgIHRoaXMuX2FsaWFzID0gdjtcbiAgICB9XG4gICAgZ2V0IE5vdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vdDtcbiAgICB9XG4gICAgc2V0IE5vdCh2KSB7XG4gICAgICAgIHRoaXMuX25vdCA9IHY7XG4gICAgfVxuICAgIGdldCBWYWx1ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XG4gICAgfVxuICAgIHNldCBWYWx1ZXModikge1xuICAgICAgICB0aGlzLl92YWx1ZXMgPSB2O1xuICAgIH1cbiAgICBnZXQgR3JvdXBlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dyb3VwZWQ7XG4gICAgfVxuICAgIHNldCBHcm91cGVkKHYpIHtcbiAgICAgICAgdGhpcy5fZ3JvdXBlZCA9IHY7XG4gICAgfVxuICAgIGVxKHZhbCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxbFdoZXJlKHsgQ29sdW1uOiB0aGlzLCBPcDogJz0nLCBWYWx1ZTogdmFsIH0pO1xuICAgIH1cbiAgICBuZSh2YWwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcWxXaGVyZSh7IENvbHVtbjogdGhpcywgT3A6ICc8PicsIFZhbHVlOiB2YWwgfSk7XG4gICAgfVxuICAgIGd0KHZhbCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxbFdoZXJlKHsgQ29sdW1uOiB0aGlzLCBPcDogJz4nLCBWYWx1ZTogdmFsIH0pO1xuICAgIH1cbiAgICBndGUodmFsKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3FsV2hlcmUoeyBDb2x1bW46IHRoaXMsIE9wOiAnPj0nLCBWYWx1ZTogdmFsIH0pO1xuICAgIH1cbiAgICBsdCh2YWwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcWxXaGVyZSh7IENvbHVtbjogdGhpcywgT3A6ICc8JywgVmFsdWU6IHZhbCB9KTtcbiAgICB9XG4gICAgaXNOdWxsKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxbFdoZXJlKHsgQ29sdW1uOiB0aGlzLCBPcDogJ0lTIE5VTEwnIH0pO1xuICAgIH1cbiAgICBpc05vdE51bGwoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3FsV2hlcmUoeyBDb2x1bW46IHRoaXMsIE9wOiAnSVMgTk9UIE5VTEwnIH0pO1xuICAgIH1cbiAgICBsdGUodmFsKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3FsV2hlcmUoeyBDb2x1bW46IHRoaXMsIE9wOiAnPD0nLCBWYWx1ZTogdmFsIH0pO1xuICAgIH1cbiAgICBsaWtlKHZhbCkge1xuICAgICAgICBsZXQgdmFsdWUgPSB2YWw7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGAlJHt2YWx1ZX0lYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNxbFdoZXJlKHsgQ29sdW1uOiB0aGlzLCBPcDogJ2xpa2UnLCBWYWx1ZTogdmFsdWUgfSk7XG4gICAgfVxuICAgIHN0YXJ0cyh2YWwpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gdmFsO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFsdWUgPSBgJHt2YWx1ZX0lYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNxbFdoZXJlKHsgQ29sdW1uOiB0aGlzLCBPcDogJ2xpa2UnLCBWYWx1ZTogdmFsdWUgfSk7XG4gICAgfVxuICAgIGVuZHModmFsKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHZhbDtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlID0gYCUke3ZhbHVlfWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBTcWxXaGVyZSh7IENvbHVtbjogdGhpcywgT3A6ICdsaWtlJywgVmFsdWU6IHZhbHVlIH0pO1xuICAgIH1cbiAgICBpbiguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBwcm9jZXNzQXJncygodikgPT4geyB2YWx1ZXMucHVzaCh2KTsgfSwgLi4uYXJncyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYnJhY2Utc3R5bGVcbiAgICAgICAgcmV0dXJuIG5ldyBTcWxXaGVyZSh7IENvbHVtbjogdGhpcywgT3A6ICdpbicsIFZhbHVlOiB2YWx1ZXMgfSk7XG4gICAgfVxuICAgIGJldHdlZW4odmFsMSwgdmFsMikge1xuICAgICAgICByZXR1cm4gdGhpcy5ndGUodmFsMSkuYW5kKHRoaXMubHRlKHZhbDIpKTtcbiAgICB9XG4gICAgb3Aob3AsIHZhbDEsIHZhbDIpIHtcbiAgICAgICAgbGV0IG8gPSBvcDtcbiAgICAgICAgaWYgKCF0aGlzW29dKSB7XG4gICAgICAgICAgICBvID0gby50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzW29dKHZhbDEsIHZhbDIpO1xuICAgIH1cbiAgICBhc2MoKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3FsT3JkZXIodGhpcywgJ0FTQycpO1xuICAgIH1cbiAgICBkZXNjKCkge1xuICAgICAgICByZXR1cm4gbmV3IFNxbE9yZGVyKHRoaXMsICdERVNDJyk7XG4gICAgfVxuICAgIGRpcmVjdGlvbihkaXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTcWxPcmRlcih0aGlzLCBkaXIpO1xuICAgIH1cbiAgICBkaXIoZGlyKSB7XG4gICAgICAgIHJldHVybiBuZXcgU3FsT3JkZXIodGhpcywgZGlyKTtcbiAgICB9XG4gICAgbm90KCkge1xuICAgICAgICBjb25zdCBjb2wgPSBuZXcgU3FsQ29sdW1uKHRoaXMpO1xuICAgICAgICBjb2wuTm90ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGNvbDtcbiAgICB9XG59XG4iXX0=