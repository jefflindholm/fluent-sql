"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;require("./string.js");
var _sqlColumn = _interopRequireDefault(require("./sql-column"));
var _sqlJoin = _interopRequireDefault(require("./sql-join"));
var _sqlQuery = _interopRequireDefault(require("./sql-query"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));return true;} catch (e) {return false;}}function _construct(Parent, args, Class) {if (isNativeReflectConstruct()) {_construct = Reflect.construct;} else {_construct = function _construct(Parent, args, Class) {var a = [null];a.push.apply(a, args);var Constructor = Function.bind.apply(Parent, a);var instance = new Constructor();if (Class) _setPrototypeOf(instance, Class.prototype);return instance;};}return _construct.apply(null, arguments);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}var

SqlTable = /*#__PURE__*/function () {
  /*
                                      * @param {} - either another SqlTable, alias
                                      *             or TableName, array of columns
                                      * example:
                                      *      var users = new SqlTable('users', [{ColumnName: 'id'}, {ColumnName: 'username'}, {ColumnName: 'password'}])
                                      *      var users = new SqlTable({
                                      *          TableName: 'users',
                                      *          columns: [{ColumnName: 'id'}, {ColumnName: 'username'}, {ColumnName: 'password'}]
                                      *      }, 'u');
                                      */
  function SqlTable() {_classCallCheck(this, SqlTable);for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
    if (!(this instanceof SqlTable ? this.constructor : void 0)) {
      return _construct(SqlTable, args);
    }
    var columns;
    var alias;
    if (typeof args[0] === 'string') {
      this.TableName = args[0];
      if (args.length > 1) {
        columns = args[1];
      }
    } else {
      alias = args[1];
      this.TableName = args[0].TableName || args[0].name;
      columns = args[0].Columns || args[0].columns;
    }
    this.Alias = alias || this.TableName;
    this.Columns = [];
    if (columns) {
      columns.forEach(function (c) {
        var name = c.ColumnName || c.name;
        var prop = name.toCamel();
        var col = new _sqlColumn.default(this, name, c.Literal);
        this.Columns.push(col);
        this[prop] = col;
      }, this);
    }
  }
  /* eslint-disable brace-style */_createClass(SqlTable, [{ key: "getTable",








    /* eslint-enable */value: function getTable()

    {
      if (this.Schema) {
        return "".concat(this.Schema, ".").concat(this.TableName);
      }
      return this.TableName;
    } }, { key: "getAlias", value: function getAlias()
    {
      return this.Alias || this.TableName;
    } }, { key: "as", value: function as(
    alias) {
      var table = new SqlTable(this, alias);
      table.Alias = alias;
      return table;
    } }, { key: "join", value: function join(
    joinClause) {
      var query = new _sqlQuery.default();
      query.join(joinClause);
      return query;
    } }, { key: "left", value: function left(
    joinClause) {
      var query = new _sqlQuery.default();
      query.left(joinClause);
      return query;
    } }, { key: "right", value: function right(
    joinClause) {
      var query = new _sqlQuery.default();
      query.right(joinClause);
      return query;
    } }, { key: "on", value: function on(
    sqlColumn) {
      if (sqlColumn.Table !== this) {
        throw { location: 'SqlTable::on', message: 'trying to build join on column not from this table' }; //eslint-disable-line
      }
      return new _sqlJoin.default(sqlColumn);
    } }, { key: "where", value: function where(
    whereClause) {
      var query = new _sqlQuery.default();
      query.where(whereClause);
      return query;
    } }, { key: "star", value: function star()
    {
      return this;
    } }, { key: "Schema", get: function get() {return this._schema;}, set: function set(v) {this._schema = v;} }, { key: "TableName", get: function get() {return this._tableName;}, set: function set(v) {this._tableName = v;} }, { key: "Alias", get: function get() {return this._alias;}, set: function set(v) {this._alias = v;} }, { key: "Columns", get: function get() {return this._columns;}, set: function set(v) {this._columns = v;} }]);return SqlTable;}();exports.default = SqlTable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcWwtdGFibGUuanMiXSwibmFtZXMiOlsiU3FsVGFibGUiLCJhcmdzIiwiY29sdW1ucyIsImFsaWFzIiwiVGFibGVOYW1lIiwibGVuZ3RoIiwibmFtZSIsIkNvbHVtbnMiLCJBbGlhcyIsImZvckVhY2giLCJjIiwiQ29sdW1uTmFtZSIsInByb3AiLCJ0b0NhbWVsIiwiY29sIiwiU3FsQ29sdW1uIiwiTGl0ZXJhbCIsInB1c2giLCJTY2hlbWEiLCJ0YWJsZSIsImpvaW5DbGF1c2UiLCJxdWVyeSIsIlNxbFF1ZXJ5Iiwiam9pbiIsImxlZnQiLCJyaWdodCIsInNxbENvbHVtbiIsIlRhYmxlIiwibG9jYXRpb24iLCJtZXNzYWdlIiwiU3FsSm9pbiIsIndoZXJlQ2xhdXNlIiwid2hlcmUiLCJfc2NoZW1hIiwidiIsIl90YWJsZU5hbWUiLCJfYWxpYXMiLCJfY29sdW1ucyJdLCJtYXBwaW5ncyI6Im9HQUFBO0FBQ0E7QUFDQTtBQUNBLCtEOztBQUVxQkEsUTtBQUNqQjs7Ozs7Ozs7OztBQVVBLHNCQUFxQixtRUFBTkMsSUFBTSxvREFBTkEsSUFBTTtBQUNqQixRQUFJLHVEQUFKLEVBQWlCO0FBQ2Isd0JBQVdELFFBQVgsRUFBdUJDLElBQXZCO0FBQ0g7QUFDRCxRQUFJQyxPQUFKO0FBQ0EsUUFBSUMsS0FBSjtBQUNBLFFBQUksT0FBT0YsSUFBSSxDQUFDLENBQUQsQ0FBWCxLQUFtQixRQUF2QixFQUFpQztBQUM3QixXQUFLRyxTQUFMLEdBQWlCSCxJQUFJLENBQUMsQ0FBRCxDQUFyQjtBQUNBLFVBQUlBLElBQUksQ0FBQ0ksTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQ2pCSCxRQUFBQSxPQUFPLEdBQUdELElBQUksQ0FBQyxDQUFELENBQWQ7QUFDSDtBQUNKLEtBTEQsTUFLTztBQUNIRSxNQUFBQSxLQUFLLEdBQUdGLElBQUksQ0FBQyxDQUFELENBQVo7QUFDQSxXQUFLRyxTQUFMLEdBQWlCSCxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVFHLFNBQVIs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QyxFQUFHLENBQUUsS0FBS0UsTUFBTCxHQUFjRixDQUFkLENBQWtCLEMsMENBQ25CLENBQUUsT0FBTyxLQUFLRyxRQUFaLENBQXVCLEMsb0JBQzNCSCxDLEVBQUcsQ0FBRSxLQUFLRyxRQUFMLEdBQWdCSCxDQUFoQixDQUFvQixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL3N0cmluZy5qcyc7XG5pbXBvcnQgU3FsQ29sdW1uIGZyb20gJy4vc3FsLWNvbHVtbic7XG5pbXBvcnQgU3FsSm9pbiBmcm9tICcuL3NxbC1qb2luJztcbmltcG9ydCBTcWxRdWVyeSBmcm9tICcuL3NxbC1xdWVyeSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNxbFRhYmxlIHtcbiAgICAvKlxuICAgICAqIEBwYXJhbSB7fSAtIGVpdGhlciBhbm90aGVyIFNxbFRhYmxlLCBhbGlhc1xuICAgICAqICAgICAgICAgICAgIG9yIFRhYmxlTmFtZSwgYXJyYXkgb2YgY29sdW1uc1xuICAgICAqIGV4YW1wbGU6XG4gICAgICogICAgICB2YXIgdXNlcnMgPSBuZXcgU3FsVGFibGUoJ3VzZXJzJywgW3tDb2x1bW5OYW1lOiAnaWQnfSwge0NvbHVtbk5hbWU6ICd1c2VybmFtZSd9LCB7Q29sdW1uTmFtZTogJ3Bhc3N3b3JkJ31dKVxuICAgICAqICAgICAgdmFyIHVzZXJzID0gbmV3IFNxbFRhYmxlKHtcbiAgICAgKiAgICAgICAgICBUYWJsZU5hbWU6ICd1c2VycycsXG4gICAgICogICAgICAgICAgY29sdW1uczogW3tDb2x1bW5OYW1lOiAnaWQnfSwge0NvbHVtbk5hbWU6ICd1c2VybmFtZSd9LCB7Q29sdW1uTmFtZTogJ3Bhc3N3b3JkJ31dXG4gICAgICogICAgICB9LCAndScpO1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFuZXcudGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNxbFRhYmxlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb2x1bW5zO1xuICAgICAgICBsZXQgYWxpYXM7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMuVGFibGVOYW1lID0gYXJnc1swXTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zID0gYXJnc1sxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsaWFzID0gYXJnc1sxXTtcbiAgICAgICAgICAgIHRoaXMuVGFibGVOYW1lID0gYXJnc1swXS5UYWJsZU5hbWUgfHwgYXJnc1swXS5uYW1lO1xuICAgICAgICAgICAgY29sdW1ucyA9IGFyZ3NbMF0uQ29sdW1ucyB8fCBhcmdzWzBdLmNvbHVtbnM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5BbGlhcyA9IGFsaWFzIHx8IHRoaXMuVGFibGVOYW1lO1xuICAgICAgICB0aGlzLkNvbHVtbnMgPSBbXTtcbiAgICAgICAgaWYgKGNvbHVtbnMpIHtcbiAgICAgICAgICAgIGNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBjLkNvbHVtbk5hbWUgfHwgYy5uYW1lO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb3AgPSBuYW1lLnRvQ2FtZWwoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2wgPSBuZXcgU3FsQ29sdW1uKHRoaXMsIG5hbWUsIGMuTGl0ZXJhbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5Db2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICB0aGlzW3Byb3BdID0gY29sO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogZXNsaW50LWRpc2FibGUgYnJhY2Utc3R5bGUgKi9cbiAgICBnZXQgU2NoZW1hKCkgeyByZXR1cm4gdGhpcy5fc2NoZW1hIH1cbiAgICBzZXQgU2NoZW1hKHYpIHsgdGhpcy5fc2NoZW1hID0gdn1cbiAgICBnZXQgVGFibGVOYW1lKCkgeyByZXR1cm4gdGhpcy5fdGFibGVOYW1lOyB9XG4gICAgc2V0IFRhYmxlTmFtZSh2KSB7IHRoaXMuX3RhYmxlTmFtZSA9IHY7IH1cbiAgICBnZXQgQWxpYXMoKSB7IHJldHVybiB0aGlzLl9hbGlhczsgfVxuICAgIHNldCBBbGlhcyh2KSB7IHRoaXMuX2FsaWFzID0gdjsgfVxuICAgIGdldCBDb2x1bW5zKCkgeyByZXR1cm4gdGhpcy5fY29sdW1uczsgfVxuICAgIHNldCBDb2x1bW5zKHYpIHsgdGhpcy5fY29sdW1ucyA9IHY7IH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlICovXG5cbiAgICBnZXRUYWJsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuU2NoZW1hKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5TY2hlbWF9LiR7dGhpcy5UYWJsZU5hbWV9YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLlRhYmxlTmFtZTtcbiAgICB9XG4gICAgZ2V0QWxpYXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkFsaWFzIHx8IHRoaXMuVGFibGVOYW1lO1xuICAgIH1cbiAgICBhcyhhbGlhcykge1xuICAgICAgICBjb25zdCB0YWJsZSA9IG5ldyBTcWxUYWJsZSh0aGlzLCBhbGlhcyk7XG4gICAgICAgIHRhYmxlLkFsaWFzID0gYWxpYXM7XG4gICAgICAgIHJldHVybiB0YWJsZTtcbiAgICB9XG4gICAgam9pbihqb2luQ2xhdXNlKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gbmV3IFNxbFF1ZXJ5KCk7XG4gICAgICAgIHF1ZXJ5LmpvaW4oam9pbkNsYXVzZSk7XG4gICAgICAgIHJldHVybiBxdWVyeTtcbiAgICB9XG4gICAgbGVmdChqb2luQ2xhdXNlKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gbmV3IFNxbFF1ZXJ5KCk7XG4gICAgICAgIHF1ZXJ5LmxlZnQoam9pbkNsYXVzZSk7XG4gICAgICAgIHJldHVybiBxdWVyeTtcbiAgICB9XG4gICAgcmlnaHQoam9pbkNsYXVzZSkge1xuICAgICAgICBjb25zdCBxdWVyeSA9IG5ldyBTcWxRdWVyeSgpO1xuICAgICAgICBxdWVyeS5yaWdodChqb2luQ2xhdXNlKTtcbiAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgIH1cbiAgICBvbihzcWxDb2x1bW4pIHtcbiAgICAgICAgaWYgKHNxbENvbHVtbi5UYWJsZSAhPT0gdGhpcykge1xuICAgICAgICAgICAgdGhyb3cgeyBsb2NhdGlvbjogJ1NxbFRhYmxlOjpvbicsIG1lc3NhZ2U6ICd0cnlpbmcgdG8gYnVpbGQgam9pbiBvbiBjb2x1bW4gbm90IGZyb20gdGhpcyB0YWJsZScgfTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBTcWxKb2luKHNxbENvbHVtbik7XG4gICAgfVxuICAgIHdoZXJlKHdoZXJlQ2xhdXNlKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gbmV3IFNxbFF1ZXJ5KCk7XG4gICAgICAgIHF1ZXJ5LndoZXJlKHdoZXJlQ2xhdXNlKTtcbiAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgIH1cbiAgICBzdGFyKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iXX0=