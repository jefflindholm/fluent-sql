"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.setDefaultOptions = setDefaultOptions;exports.getDefaultOptions = getDefaultOptions;exports.setPostgres = setPostgres;exports.setSqlServer = setSqlServer;exports.default = exports.sqlServerOptions = exports.postgresOptions = void 0;require("./string.js");

var _sqlColumn = _interopRequireDefault(require("./sql-column"));
var _sqlJoin = _interopRequireDefault(require("./sql-join"));
var _sqlOrder = _interopRequireDefault(require("./sql-order"));
var _sqlTable = _interopRequireDefault(require("./sql-table"));

var _helpers = require("./helpers");
var _fs = require("fs");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};var ownKeys = Object.keys(source);if (typeof Object.getOwnPropertySymbols === 'function') {ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {return Object.getOwnPropertyDescriptor(source, sym).enumerable;}));}ownKeys.forEach(function (key) {_defineProperty(target, key, source[key]);});}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

var postgresOptions = {
  sqlStartChar: '"',
  sqlEndChar: '"',
  namedValues: true,
  namedValueMarker: '$',
  markerType: 'number',
  dialect: 'pg' };exports.postgresOptions = postgresOptions;

var sqlServerOptions = {
  sqlStartChar: '[',
  sqlEndChar: ']',
  escapeLevel: ['table-alias', 'column-alias'],
  namedValues: true,
  namedValueMarker: ':',
  markerType: 'name',
  dialect: 'MS' };exports.sqlServerOptions = sqlServerOptions;


var defaultOptions = _objectSpread({}, sqlServerOptions);

function setDefaultOptions(options) {var display = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (display) console.log('options', options);
  defaultOptions = _objectSpread({}, defaultOptions, options);
  if (display) console.log('new defaults', defaultOptions);
}
function getDefaultOptions() {
  return defaultOptions;
}
function setPostgres() {
  setDefaultOptions(postgresOptions);
}
function setSqlServer() {
  setDefaultOptions(sqlServerOptions);
}
/*
   * @param {options} - either another SqlQuery object to copy options from
   *                      or an object of options
   *                      sqlStartChar - character used to escape names (default is '[')
   *                      sqlEndChar - character used to end escaped names (default is ']')
   *                      escapeLevel - array of zero or more ('table-alias', 'column-alias')
   *                                  - default is ['table-alias', 'column-alias']
   *                      namedValues - boolean, if false will use ? for the values and just
   *                                      return an array of values
   *                                  - default true
   *                      namedValueMarker - character, will use this with named values in the
   *                                      generated SQL (example: where foo = (:value0))
   *                                  - default is ':'
   */var
SqlQuery = /*#__PURE__*/function () {
  function SqlQuery(options) {var _this = this;_classCallCheck(this, SqlQuery);
    if (!(this instanceof SqlQuery ? this.constructor : void 0)) {
      return new SqlQuery(options);
    }

    if (options instanceof SqlQuery) {
      this.options = options.options;
    } else {
      this.options = Object.assign({}, defaultOptions, options);
    }

    this.Columns = [];
    this.From = [];
    this.Joins = [];
    this.Wheres = [];
    this.OrderBy = [];
    this.GroupBy = [];
    this.Having = [];
    this.variableCount = 0;

    /**
                             * @return {string}
                             */
    this.BuildWherePart = function (whereArray, values, conjunction) {
      var sql = '';
      var data;
      whereArray.forEach(function (where, idx) {
        if (idx !== 0) {
          sql += "\n".concat(conjunction.toUpperCase(), " ");
        }
        var piece = '';
        if (where.Column) {
          if (where.Value && where.Value.Literal) {
            piece = "".concat(where.Column.qualifiedName(_this), " ").concat(where.Op, " (").concat(where.Value.Literal, ")");
            if (where.Value.Values) {
              for (var attr in where.Value.Values) {
                if (where.Value.Values.hasOwnProperty(attr)) {
                  data = {};
                  data[attr] = where.Value.Values[attr];
                  values.push(data);
                }
              }
            }
          } else if (where.Value && where.Value.Table) {
            piece = "".concat(where.Column.qualifiedName(_this), " ").concat(where.Op, " (").concat(where.Value.qualifiedName(_this), ")");
          } else {
            if (where.Op === 'IS NULL' || where.Op === 'IS NOT NULL') {
              //if ((!where.Value) && where.Value !== 0 && where.Value !== false && where.Value !== '') {
              piece = "".concat(where.Column.qualifiedName(_this), " ").concat(where.Op);
            } else {
              var _data;
              piece = "".concat(where.Column.qualifiedName(_this), " ").concat(where.Op);
              if (!_this.options.namedValues || _this.options.markerType === 'number') {
                _data = where.Value;
                if (_this.options.markerType === 'number') {
                  piece += " (".concat(_this.options.namedValueMarker).concat(values.length + 1, ")");
                } else {
                  piece += ' ? ';
                }
              } else {
                var varName = where.Column.ColumnName + _this.variableCount++;
                piece += " (".concat(_this.options.namedValueMarker).concat(varName, ")");
                _data = {};
                _data[varName] = where.Value;
              }
              values.push(_data);
            }
          }
          if (where.Column.Not) {
            sql += "NOT (".concat(piece, ")");
          } else {
            sql += piece;
          }
        }
        if (where.Wheres && where.Wheres.length > 0) {
          var sub = _this.BuildWherePart(where.Wheres, values, where.type);
          if (sub && sub.length > 1) {
            sql += "(".concat(sub, ")");
          }
        }
      }, _this);
      return sql;
    };
  }
  /* eslint-disable brace-style */_createClass(SqlQuery, [{ key: "sqlEscape",













    /* eslint-enable brace-style */value: function sqlEscape(
    str, level) {
      if (level && this.options.escapeLevel.indexOf(level) > -1 || !level) {
        return this.options.sqlStartChar + str + this.options.sqlEndChar;
      }
      return str;
    } }, { key: "page", value: function page(
    _page) {
      this.pageNo = _page;
      return this;
    } }, { key: "pageSize", value: function pageSize(
    _pageSize) {
      this.itemsPerPage = _pageSize;
      return this;
    } }, { key: "top", value: function top(
    val) {
      this.topCount = val;
      return this;
    } }, { key: "addColumns", value: function addColumns()
    {var _this2 = this;for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
      _helpers.processArgs.apply(void 0, [function (v) {
        _this2.Columns.push(v);
      }].concat(args)); // eslint-disable-line brace-style
      return this;
    } }, { key: "applyOrder",
    /*
                               * @param {defaultSqlTable} - table to use if the order string does not contain qualified column names
                               * @param {orderString} - order string in the form col dir, col dir, ... col = columnName or tableName.columnName, dir = ASC or DESC
                               * @param {overrides} - columnName: [array of SqlColumns] useful when someone wants to order by 'name' but there are multiple names in the select
                               *                         or you are using a function but want to order by its parameters
                               *                         example: you are selecting buildFullNameFunc(first, last, middle) and dont want to order by the function also, use
                               *                         { 'name' : [FirstColumn, LastColumn, MiddleColumn] } and order by 'name <dir>'
                               */value: function applyOrder(
    defaultSqlTable, orderString, overrides) {var _this3 = this;
      if (orderString) {
        var col;
        var table;
        var parts;
        var dir;
        orderString.split(',').forEach(function (o) {
          parts = o.trim().split(' ');
          dir = parts.length > 1 ? parts[1] : 'ASC';
          parts = parts[0].split('.');
          if (parts.length > 1) {
            col = parts[1].toSnakeCase();
            table = new _sqlTable.default({ TableName: parts[0].toSnakeCase() });
          } else {
            col = parts[0];
            table = defaultSqlTable;
          }

          if (overrides && overrides.hasOwnProperty(col)) {
            overrides[col].forEach(function (overCol) {
              _this3.orderBy(overCol.dir(dir));
            });
          } else {
            if (!(defaultSqlTable instanceof _sqlTable.default)) {
              throw { // eslint-disable-line
                location: 'SqlQuery::applyOrder',
                message: 'defaultSqlTable is not an instance of SqlTable' };

            }
            _this3.orderBy(new _sqlColumn.default(table, col).dir(dir));
          }
        });
      }
      return this;
    } }, { key: "select", value: function select()
    {var _this4 = this;for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}
      var query = args[0];
      if (query.Columns) {
        query.Columns.forEach(function (c) {
          _this4.Columns.push(new _sqlColumn.default(c));
        });
      } else {
        _helpers.processArgs.apply(void 0, [function (a) {_this4.Columns.push(new _sqlColumn.default(a));}].concat(args)); // eslint-disable-line brace-style
      }
      return this;
    } }, { key: "from", value: function from(
    sqlTable) {
      if (!(sqlTable instanceof _sqlTable.default)) {
        throw { location: 'SqlQuery::from', message: 'from clause must be a SqlTable' }; //eslint-disable-line
      }
      this.From.push(sqlTable);
      return this;
    } }, { key: "join", value: function join(
    joinClause) {
      if (!(joinClause instanceof _sqlJoin.default)) {
        throw { location: 'SqlQuery::join', message: 'clause is not a SqlJoin' }; // eslint-disable-line
      }
      this.Joins.push(joinClause);
      return this;
    } }, { key: "left", value: function left(
    joinClause) {
      joinClause.Left = true; // eslint-disable-line no-param-reassign
      return this.join(joinClause);
    } }, { key: "right", value: function right(
    joinClause) {
      joinClause.Right = true; // eslint-disable-line no-param-reassign
      return this.join(joinClause);
    } }, { key: "where", value: function where(
    whereClause) {
      this.Wheres.push(whereClause);
      return this;
    } }, { key: "having", value: function having(
    whereClause) {
      this.Having.push(whereClause);
      return this;
    } }, { key: "orderBy", value: function orderBy()
    {var _this5 = this;for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {args[_key3] = arguments[_key3];}
      _helpers.processArgs.apply(void 0, [function (v) {_this5.OrderBy.push(new _sqlOrder.default(v));}].concat(args)); // eslint-disable-line brace-style
      return this;
    } }, { key: "distinct", value: function distinct()
    {
      this.Distinct = true;
      return this;
    } }, { key: "removeColumn", value: function removeColumn(
    sqlColumn) {
      var array = this.Columns;
      for (var i = 0; i < array.length; i++) {
        if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
          array.splice(i, 1);
        }
      }
      return this;
    } }, { key: "updateAlias", value: function updateAlias(
    sqlColumn, newAlias) {
      var array = this.Columns;
      for (var i = 0; i < array.length; i++) {
        if (array[i].ColumnName === sqlColumn.ColumnName && array[i].TableName === sqlColumn.TableName && array[i].Alias === sqlColumn.Alias) {
          array[i].Alias = newAlias;
          break;
        }
      }
      return this;
    } }, { key: "genSql",
    /*
                           * Generates the SQL from the built up query
                           * @param {decryptFunction} function that takes (SqlColumn, boolean - should this use the qualified name, usually true)
                           *                           return null if not decrypted
                           * @param {maskFunction} function that takes (SqlColumn, select term - this will include decryption from above)
                           *                          return null if not replacement
                           * @return { fetchSql, countSql, values, hasEncrypted }
                           */value: function genSql(
    decryptFunction, maskFunction) {var _this6 = this;
      if (this.From && this.From.length < 1) {
        throw { location: 'toSql', message: 'No FROM in query' }; // eslint-disable-line
      }

      var sql = {};
      var values = [];
      var groupBy = [];
      var columns = '';
      var orderString;
      var data;
      var hasEncrypted = false;
      this.Columns.forEach(function (c, idx) {
        if (c.Literal) {
          columns += "".concat(idx > 0 ? ',' : '', "\n(").concat(c.Literal, ") as ").concat(c.Alias.sqlEscape(_this6, 'column-alias'));
          // handle any columns that might have values
          if (c.Values) {
            for (var attr in c.Values) {
              if (c.Values.hasOwnProperty(attr)) {
                data = {};
                data[attr] = c.Values[attr];
                values.push(data);
              }
            }
          }
          if (c.Grouped) {
            groupBy.push("(".concat(c.Literal, ")"));
          }
        } else if (c.Aggregate) {
          var literal = decryptFunction ? decryptFunction(c, true) : null;
          hasEncrypted = literal !== null;
          literal = literal || c.qualifiedName(_this6);
          columns += "".concat(idx > 0 ? ',' : '', "\n").concat(c.Aggregate.operation, "(").concat(literal, ") as ").concat(c.Alias.sqlEscape(_this6, 'column-alias'));
          if (c.Aggregate.groupBy) {
            groupBy.push(c.Aggregate.groupBy.qualifiedName(_this6));
          }
        } else {
          var _literal = decryptFunction ? decryptFunction(c, true) : null;
          hasEncrypted = _literal !== null;
          _literal = _literal || c.qualifiedName(_this6);
          if (maskFunction) {
            _literal = maskFunction(c, _literal) || _literal;
          }

          columns += "".concat(idx > 0 ? ',' : '', "\n").concat(_literal, " as ").concat(c.Alias.sqlEscape(_this6, 'column-alias'));

          if (!orderString) {
            orderString = c.Alias.sqlEscape(_this6, 'column-alias');
          }

          if (c.Grouped) {
            groupBy.push(_literal);
          }
        }
      }, this);
      var from = '';
      this.From.forEach(function (f, idx) {
        from += "".concat(idx > 0 ? ',' : '', "\n").concat(f.getTable(), " as ").concat(f.Alias.sqlEscape(_this6, 'table-alias'));
      }, this);
      var join = '';
      this.Joins.forEach(function (j) {
        var type = j.Left ? 'LEFT ' : j.Right ? 'RIGHT ' : ''; // eslint-disable-line no-nested-ternary
        var from = j.From.Table.getTable();
        var alias = j.From.Table.Alias.sqlEscape(_this6, 'table-alias');
        var fromCol = j.From.ColumnName;
        var to = j.To.Table.Alias.sqlEscape(_this6, 'table-alias');
        var toCol = j.To.ColumnName;
        join += "\n".concat(type, "JOIN ").concat(from, " as ").concat(alias, " on ").concat(alias, ".").concat(fromCol, " = ").concat(to, ".").concat(toCol);
      }, this);

      var where = this.BuildWherePart(this.Wheres, values, 'and');

      var having = this.BuildWherePart(this.Having, values, 'and');

      var top = this.topCount ? " TOP ".concat(this.topCount) : '';
      var select;
      if (this.options.dialect !== 'MS') {
        select = "SELECT".concat(this.Distinct ? ' DISTINCT' : '').concat(columns, "\nFROM").concat(from).concat(join);
      } else {
        select = "SELECT".concat(top).concat(this.Distinct ? ' DISTINCT' : '').concat(columns, "\nFROM").concat(from).concat(join);
      }

      if (where && where !== '') {
        select += "\nWHERE ".concat(where);
      }
      if (groupBy.length > 0) {
        select += "\nGROUP BY ".concat(groupBy.join());
      }
      if (having && having !== '') {
        select += "\nHAVING ".concat(having);
      }

      var page = this.pageNo;
      var pageSize = this.itemsPerPage;

      if (page && !pageSize) {
        pageSize = 50;
      }
      if (pageSize && !page) {
        page = 1;
      }

      var countSql;
      var fetchSql;
      var order = '';
      if (page) {
        if (this.OrderBy && this.OrderBy.length > 0) {
          this.OrderBy.forEach(function (o, idx) {
            // since we know we are going to be ordering over a select, we don't need a table
            // in this, just use the column alias
            order += "".concat(idx > 0 ? ',' : '').concat(o.Column.Alias.sqlEscape(_this6, 'column-alias'), " ").concat(o.Direction);
          }, this);
          orderString = order;
        }
        countSql = "SELECT count(*) as RecordCount FROM (\n".concat(select, "\n) count_tbl");
        var baseSql = "SELECT *, row_number() OVER (ORDER BY ".concat(orderString, ") as Paging_RowNumber FROM (\n").concat(select, "\n) base_query");
        fetchSql = "SELECT * FROM (\n".concat(baseSql, "\n) as detail_query WHERE Paging_RowNumber BETWEEN ").concat((page - 1) * pageSize, " AND ").concat(page * pageSize);
      } else {
        this.OrderBy.forEach(function (o, idx) {
          order += "".concat(idx > 0 ? ',' : '').concat(o.Column.qualifiedName(_this6), " ").concat(o.Direction);
        }, this);
        if (order && order !== '') {
          fetchSql = "".concat(select, "\nORDER BY ").concat(order);
        } else {
          fetchSql = select;
        }
        if (this.options.dialect !== 'MS' && this.topCount) {
          fetchSql += "\nLIMIT ".concat(this.topCount);
        }
      }
      sql.fetchSql = fetchSql;
      sql.countSql = countSql;
      sql.hasEncrypted = hasEncrypted;
      if (!this.options.namedValues || this.options.markerType === 'number') {
        sql.values = values;
      } else {
        sql.values = {};
        values.forEach(function (v) {
          for (var attr in v) {
            if (v.hasOwnProperty(attr)) {
              sql.values[attr] = v[attr];
            }
          }
        });
      }

      return sql;
    } }, { key: "Columns", get: function get() {return this._columns;}, set: function set(v) {this._columns = v;} }, { key: "From", get: function get() {return this._from;}, set: function set(v) {this._from = v;} }, { key: "Joins", get: function get() {return this._joins;}, set: function set(v) {this._joins = v;} }, { key: "Wheres", get: function get() {return this._wheres;}, set: function set(v) {this._wheres = v;} }, { key: "OrderBy", get: function get() {return this._orderBy;}, set: function set(v) {this._orderBy = v;} }, { key: "Having", get: function get() {return this._having;}, set: function set(v) {this._having = v;} }]);return SqlQuery;}();exports.default = SqlQuery;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcWwtcXVlcnkuanMiXSwibmFtZXMiOlsicG9zdGdyZXNPcHRpb25zIiwic3FsU3RhcnRDaGFyIiwic3FsRW5kQ2hhciIsIm5hbWVkVmFsdWVzIiwibmFtZWRWYWx1ZU1hcmtlciIsIm1hcmtlclR5cGUiLCJkaWFsZWN0Iiwic3FsU2VydmVyT3B0aW9ucyIsImVzY2FwZUxldmVsIiwiZGVmYXVsdE9wdGlvbnMiLCJzZXREZWZhdWx0T3B0aW9ucyIsIm9wdGlvbnMiLCJkaXNwbGF5IiwiY29uc29sZSIsImxvZyIsImdldERlZmF1bHRPcHRpb25zIiwic2V0UG9zdGdyZXMiLCJzZXRTcWxTZXJ2ZXIiLCJTcWxRdWVyeSIsIk9iamVjdCIsImFzc2lnbiIsIkNvbHVtbnMiLCJGcm9tIiwiSm9pbnMiLCJXaGVyZXMiLCJPcmRlckJ5IiwiR3JvdXBCeSIsIkhhdmluZyIsInZhcmlhYmxlQ291bnQiLCJCdWlsZFdoZXJlUGFydCIsIndoZXJlQXJyYXkiLCJ2YWx1ZXMiLCJjb25qdW5jdGlvbiIsInNxbCIsImRhdGEiLCJmb3JFYWNoIiwid2hlcmUiLCJpZHgiLCJ0b1VwcGVyQ2FzZSIsInBpZWNlIiwiQ29sdW1uIiwiVmFsdWUiLCJMaXRlcmFsIiwicXVhbGlmaWVkTmFtZSIsIk9wIiwiVmFsdWVzIiwiYXR0ciIsImhhc093blByb3BlcnR5IiwicHVzaCIsIlRhYmxlIiwibGVuZ3RoIiwidmFyTmFtZSIsIkNvbHVtbk5hbWUiLCJOb3QiLCJzdWIiLCJ0eXBlIiwic3RyIiwibGV2ZWwiLCJpbmRleE9mIiwicGFnZSIsInBhZ2VObyIsInBhZ2VTaXplIiwiaXRlbXNQZXJQYWdlIiwidmFsIiwidG9wQ291bnQiLCJhcmdzIiwicHJvY2Vzc0FyZ3MiLCJ2IiwiZGVmYXVsdFNxbFRhYmxlIiwib3JkZXJTdHJpbmciLCJvdmVycmlkZXMiLCJjb2wiLCJ0YWJsZSIsInBhcnRzIiwiZGlyIiwic3BsaXQiLCJvIiwidHJpbSIsInRvU25ha2VDYXNlIiwiU3FsVGFibGUiLCJUYWJsZU5hbWUiLCJvdmVyQ29sIiwib3JkZXJCeSIsImxvY2F0aW9uIiwibWVzc2FnZSIsIlNxbENvbHVtbiIsInF1ZXJ5IiwiYyIsImEiLCJzcWxUYWJsZSIsImpvaW5DbGF1c2UiLCJTcWxKb2luIiwiTGVmdCIsImpvaW4iLCJSaWdodCIsIndoZXJlQ2xhdXNlIiwiU3FsT3JkZXIiLCJEaXN0aW5jdCIsInNxbENvbHVtbiIsImFycmF5IiwiaSIsIkFsaWFzIiwic3BsaWNlIiwibmV3QWxpYXMiLCJkZWNyeXB0RnVuY3Rpb24iLCJtYXNrRnVuY3Rpb24iLCJncm91cEJ5IiwiY29sdW1ucyIsImhhc0VuY3J5cHRlZCIsInNxbEVzY2FwZSIsIkdyb3VwZWQiLCJBZ2dyZWdhdGUiLCJsaXRlcmFsIiwib3BlcmF0aW9uIiwiZnJvbSIsImYiLCJnZXRUYWJsZSIsImoiLCJhbGlhcyIsImZyb21Db2wiLCJ0byIsIlRvIiwidG9Db2wiLCJoYXZpbmciLCJ0b3AiLCJzZWxlY3QiLCJjb3VudFNxbCIsImZldGNoU3FsIiwib3JkZXIiLCJEaXJlY3Rpb24iLCJiYXNlU3FsIiwiX2NvbHVtbnMiLCJfZnJvbSIsIl9qb2lucyIsIl93aGVyZXMiLCJfb3JkZXJCeSIsIl9oYXZpbmciXSwibWFwcGluZ3MiOiIyVEFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdCOztBQUVPLElBQU1BLGVBQWUsR0FBRztBQUMzQkMsRUFBQUEsWUFBWSxFQUFFLEdBRGE7QUFFM0JDLEVBQUFBLFVBQVUsRUFBRSxHQUZlO0FBRzNCQyxFQUFBQSxXQUFXLEVBQUUsSUFIYztBQUkzQkMsRUFBQUEsZ0JBQWdCLEVBQUUsR0FKUztBQUszQkMsRUFBQUEsVUFBVSxFQUFFLFFBTGU7QUFNM0JDLEVBQUFBLE9BQU8sRUFBRSxJQU5rQixFQUF4QixDOztBQVFBLElBQU1DLGdCQUFnQixHQUFHO0FBQzVCTixFQUFBQSxZQUFZLEVBQUUsR0FEYztBQUU1QkMsRUFBQUEsVUFBVSxFQUFFLEdBRmdCO0FBRzVCTSxFQUFBQSxX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QWdCcEUsQ0FBaEIsQ0FBb0IsQyx5Q0FDeEIsQ0FBRSxPQUFPLEtBQUtxRSxPQUFaLENBQXNCLEMsb0JBQzFCckUsQyxFQUFHLENBQUUsS0FBS3FFLE9BQUwsR0FBZXJFLENBQWYsQ0FBbUIsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9zdHJpbmcuanMnO1xuXG5pbXBvcnQgU3FsQ29sdW1uIGZyb20gJy4vc3FsLWNvbHVtbic7XG5pbXBvcnQgU3FsSm9pbiBmcm9tICcuL3NxbC1qb2luJztcbmltcG9ydCBTcWxPcmRlciBmcm9tICcuL3NxbC1vcmRlcic7XG5pbXBvcnQgU3FsVGFibGUgZnJvbSAnLi9zcWwtdGFibGUnO1xuLy8gaW1wb3J0IFNxbFdoZXJlIGZyb20gJy4vc3FsLXdoZXJlJztcbmltcG9ydCB7IHByb2Nlc3NBcmdzIH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7IHRydW5jYXRlIH0gZnJvbSAnZnMnO1xuXG5leHBvcnQgY29uc3QgcG9zdGdyZXNPcHRpb25zID0ge1xuICAgIHNxbFN0YXJ0Q2hhcjogJ1wiJyxcbiAgICBzcWxFbmRDaGFyOiAnXCInLFxuICAgIG5hbWVkVmFsdWVzOiB0cnVlLFxuICAgIG5hbWVkVmFsdWVNYXJrZXI6ICckJyxcbiAgICBtYXJrZXJUeXBlOiAnbnVtYmVyJyxcbiAgICBkaWFsZWN0OiAncGcnLFxufTtcbmV4cG9ydCBjb25zdCBzcWxTZXJ2ZXJPcHRpb25zID0ge1xuICAgIHNxbFN0YXJ0Q2hhcjogJ1snLFxuICAgIHNxbEVuZENoYXI6ICddJyxcbiAgICBlc2NhcGVMZXZlbDogWyd0YWJsZS1hbGlhcycsICdjb2x1bW4tYWxpYXMnXSxcbiAgICBuYW1lZFZhbHVlczogdHJ1ZSxcbiAgICBuYW1lZFZhbHVlTWFya2VyOiAnOicsXG4gICAgbWFya2VyVHlwZTogJ25hbWUnLFxuICAgIGRpYWxlY3Q6ICdNUycsXG59O1xuXG5sZXQgZGVmYXVsdE9wdGlvbnMgPSB7IC4uLnNxbFNlcnZlck9wdGlvbnMgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldERlZmF1bHRPcHRpb25zKG9wdGlvbnMsIGRpc3BsYXkgPSBmYWxzZSkge1xuICAgIGlmIChkaXNwbGF5KSBjb25zb2xlLmxvZygnb3B0aW9ucycsIG9wdGlvbnMpO1xuICAgIGRlZmF1bHRPcHRpb25zID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuICAgIGlmIChkaXNwbGF5KSBjb25zb2xlLmxvZygnbmV3IGRlZmF1bHRzJywgZGVmYXVsdE9wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRPcHRpb25zKCkge1xuICAgIHJldHVybiBkZWZhdWx0T3B0aW9ucztcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRQb3N0Z3JlcygpIHtcbiAgICBzZXREZWZhdWx0T3B0aW9ucyhwb3N0Z3Jlc09wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNldFNxbFNlcnZlcigpIHtcbiAgICBzZXREZWZhdWx0T3B0aW9ucyhzcWxTZXJ2ZXJPcHRpb25zKTtcbn1cbi8qXG4gKiBAcGFyYW0ge29wdGlvbnN9IC0gZWl0aGVyIGFub3RoZXIgU3FsUXVlcnkgb2JqZWN0IHRvIGNvcHkgb3B0aW9ucyBmcm9tXG4gKiAgICAgICAgICAgICAgICAgICAgICBvciBhbiBvYmplY3Qgb2Ygb3B0aW9uc1xuICogICAgICAgICAgICAgICAgICAgICAgc3FsU3RhcnRDaGFyIC0gY2hhcmFjdGVyIHVzZWQgdG8gZXNjYXBlIG5hbWVzIChkZWZhdWx0IGlzICdbJylcbiAqICAgICAgICAgICAgICAgICAgICAgIHNxbEVuZENoYXIgLSBjaGFyYWN0ZXIgdXNlZCB0byBlbmQgZXNjYXBlZCBuYW1lcyAoZGVmYXVsdCBpcyAnXScpXG4gKiAgICAgICAgICAgICAgICAgICAgICBlc2NhcGVMZXZlbCAtIGFycmF5IG9mIHplcm8gb3IgbW9yZSAoJ3RhYmxlLWFsaWFzJywgJ2NvbHVtbi1hbGlhcycpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIGRlZmF1bHQgaXMgWyd0YWJsZS1hbGlhcycsICdjb2x1bW4tYWxpYXMnXVxuICogICAgICAgICAgICAgICAgICAgICAgbmFtZWRWYWx1ZXMgLSBib29sZWFuLCBpZiBmYWxzZSB3aWxsIHVzZSA/IGZvciB0aGUgdmFsdWVzIGFuZCBqdXN0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuIGFycmF5IG9mIHZhbHVlc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBkZWZhdWx0IHRydWVcbiAqICAgICAgICAgICAgICAgICAgICAgIG5hbWVkVmFsdWVNYXJrZXIgLSBjaGFyYWN0ZXIsIHdpbGwgdXNlIHRoaXMgd2l0aCBuYW1lZCB2YWx1ZXMgaW4gdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVkIFNRTCAoZXhhbXBsZTogd2hlcmUgZm9vID0gKDp2YWx1ZTApKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBkZWZhdWx0IGlzICc6J1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcWxRdWVyeSB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpZiAoIW5ldy50YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3FsUXVlcnkob3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIFNxbFF1ZXJ5KSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zLm9wdGlvbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLkNvbHVtbnMgPSBbXTtcbiAgICAgICAgdGhpcy5Gcm9tID0gW107XG4gICAgICAgIHRoaXMuSm9pbnMgPSBbXTtcbiAgICAgICAgdGhpcy5XaGVyZXMgPSBbXTtcbiAgICAgICAgdGhpcy5PcmRlckJ5ID0gW107XG4gICAgICAgIHRoaXMuR3JvdXBCeSA9IFtdO1xuICAgICAgICB0aGlzLkhhdmluZyA9IFtdO1xuICAgICAgICB0aGlzLnZhcmlhYmxlQ291bnQgPSAwO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLkJ1aWxkV2hlcmVQYXJ0ID0gKHdoZXJlQXJyYXksIHZhbHVlcywgY29uanVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGxldCBzcWwgPSAnJztcbiAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgd2hlcmVBcnJheS5mb3JFYWNoKCAod2hlcmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpZHggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3FsICs9IGBcXG4ke2Nvbmp1bmN0aW9uLnRvVXBwZXJDYXNlKCl9IGA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICh3aGVyZS5Db2x1bW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdoZXJlLlZhbHVlICYmIHdoZXJlLlZhbHVlLkxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpZWNlID0gYCR7d2hlcmUuQ29sdW1uLnF1YWxpZmllZE5hbWUodGhpcyl9ICR7d2hlcmUuT3B9ICgke3doZXJlLlZhbHVlLkxpdGVyYWx9KWA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2hlcmUuVmFsdWUuVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBhdHRyIGluIHdoZXJlLlZhbHVlLlZhbHVlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2hlcmUuVmFsdWUuVmFsdWVzLmhhc093blByb3BlcnR5KGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2F0dHJdID0gd2hlcmUuVmFsdWUuVmFsdWVzW2F0dHJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAod2hlcmUuVmFsdWUgJiYgd2hlcmUuVmFsdWUuVGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpZWNlID0gYCR7d2hlcmUuQ29sdW1uLnF1YWxpZmllZE5hbWUodGhpcyl9ICR7d2hlcmUuT3B9ICgke3doZXJlLlZhbHVlLnF1YWxpZmllZE5hbWUodGhpcyl9KWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2hlcmUuT3AgPT09ICdJUyBOVUxMJyB8fCB3aGVyZS5PcCA9PT0gJ0lTIE5PVCBOVUxMJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiAoKCF3aGVyZS5WYWx1ZSkgJiYgd2hlcmUuVmFsdWUgIT09IDAgJiYgd2hlcmUuVmFsdWUgIT09IGZhbHNlICYmIHdoZXJlLlZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpZWNlID0gYCR7d2hlcmUuQ29sdW1uLnF1YWxpZmllZE5hbWUodGhpcyl9ICR7d2hlcmUuT3B9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGllY2UgPSBgJHt3aGVyZS5Db2x1bW4ucXVhbGlmaWVkTmFtZSh0aGlzKX0gJHt3aGVyZS5PcH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggIXRoaXMub3B0aW9ucy5uYW1lZFZhbHVlcyB8fCB0aGlzLm9wdGlvbnMubWFya2VyVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHdoZXJlLlZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMub3B0aW9ucy5tYXJrZXJUeXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGllY2UgKz0gYCAoJHt0aGlzLm9wdGlvbnMubmFtZWRWYWx1ZU1hcmtlcn0ke3ZhbHVlcy5sZW5ndGggKyAxfSlgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaWVjZSArPSAnID8gJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhck5hbWUgPSB3aGVyZS5Db2x1bW4uQ29sdW1uTmFtZSArIHRoaXMudmFyaWFibGVDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaWVjZSArPSBgICgke3RoaXMub3B0aW9ucy5uYW1lZFZhbHVlTWFya2VyfSR7dmFyTmFtZX0pYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3Zhck5hbWVdID0gd2hlcmUuVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh3aGVyZS5Db2x1bW4uTm90KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcWwgKz0gYE5PVCAoJHtwaWVjZX0pYDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNxbCArPSBwaWVjZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAod2hlcmUuV2hlcmVzICYmIHdoZXJlLldoZXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YiA9IHRoaXMuQnVpbGRXaGVyZVBhcnQod2hlcmUuV2hlcmVzLCB2YWx1ZXMsIHdoZXJlLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViICYmIHN1Yi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcWwgKz0gYCgke3N1Yn0pYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHNxbDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyogZXNsaW50LWRpc2FibGUgYnJhY2Utc3R5bGUgKi9cbiAgICBnZXQgQ29sdW1ucygpIHsgcmV0dXJuIHRoaXMuX2NvbHVtbnM7IH1cbiAgICBzZXQgQ29sdW1ucyh2KSB7IHRoaXMuX2NvbHVtbnMgPSB2OyB9XG4gICAgZ2V0IEZyb20oKSB7IHJldHVybiB0aGlzLl9mcm9tOyB9XG4gICAgc2V0IEZyb20odikgeyB0aGlzLl9mcm9tID0gdjsgfVxuICAgIGdldCBKb2lucygpIHsgcmV0dXJuIHRoaXMuX2pvaW5zOyB9XG4gICAgc2V0IEpvaW5zKHYpIHsgdGhpcy5fam9pbnMgPSB2OyB9XG4gICAgZ2V0IFdoZXJlcygpIHsgcmV0dXJuIHRoaXMuX3doZXJlczsgfVxuICAgIHNldCBXaGVyZXModikgeyB0aGlzLl93aGVyZXMgPSB2OyB9XG4gICAgZ2V0IE9yZGVyQnkoKSB7IHJldHVybiB0aGlzLl9vcmRlckJ5OyB9XG4gICAgc2V0IE9yZGVyQnkodikgeyB0aGlzLl9vcmRlckJ5ID0gdjsgfVxuICAgIGdldCBIYXZpbmcoKSB7IHJldHVybiB0aGlzLl9oYXZpbmc7IH1cbiAgICBzZXQgSGF2aW5nKHYpIHsgdGhpcy5faGF2aW5nID0gdjsgfVxuXG4gICAgLyogZXNsaW50LWVuYWJsZSBicmFjZS1zdHlsZSAqL1xuICAgIHNxbEVzY2FwZShzdHIsIGxldmVsKSB7XG4gICAgICAgIGlmICgobGV2ZWwgJiYgdGhpcy5vcHRpb25zLmVzY2FwZUxldmVsLmluZGV4T2YobGV2ZWwpID4gLTEpIHx8ICFsZXZlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zcWxTdGFydENoYXIgKyBzdHIgKyB0aGlzLm9wdGlvbnMuc3FsRW5kQ2hhcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH07XG4gICAgcGFnZShwYWdlKSB7XG4gICAgICAgIHRoaXMucGFnZU5vID0gcGFnZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBwYWdlU2l6ZShwYWdlU2l6ZSkge1xuICAgICAgICB0aGlzLml0ZW1zUGVyUGFnZSA9IHBhZ2VTaXplO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHRvcCh2YWwpIHtcbiAgICAgICAgdGhpcy50b3BDb3VudCA9IHZhbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBhZGRDb2x1bW5zKC4uLmFyZ3MpIHtcbiAgICAgICAgcHJvY2Vzc0FyZ3ModiA9PiB7XG4gICAgICAgICAgICB0aGlzLkNvbHVtbnMucHVzaCh2KTtcbiAgICAgICAgfSwgLi4uYXJncyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYnJhY2Utc3R5bGVcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxuICAgICAqIEBwYXJhbSB7ZGVmYXVsdFNxbFRhYmxlfSAtIHRhYmxlIHRvIHVzZSBpZiB0aGUgb3JkZXIgc3RyaW5nIGRvZXMgbm90IGNvbnRhaW4gcXVhbGlmaWVkIGNvbHVtbiBuYW1lc1xuICAgICAqIEBwYXJhbSB7b3JkZXJTdHJpbmd9IC0gb3JkZXIgc3RyaW5nIGluIHRoZSBmb3JtIGNvbCBkaXIsIGNvbCBkaXIsIC4uLiBjb2wgPSBjb2x1bW5OYW1lIG9yIHRhYmxlTmFtZS5jb2x1bW5OYW1lLCBkaXIgPSBBU0Mgb3IgREVTQ1xuICAgICAqIEBwYXJhbSB7b3ZlcnJpZGVzfSAtIGNvbHVtbk5hbWU6IFthcnJheSBvZiBTcWxDb2x1bW5zXSB1c2VmdWwgd2hlbiBzb21lb25lIHdhbnRzIHRvIG9yZGVyIGJ5ICduYW1lJyBidXQgdGhlcmUgYXJlIG11bHRpcGxlIG5hbWVzIGluIHRoZSBzZWxlY3RcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICBvciB5b3UgYXJlIHVzaW5nIGEgZnVuY3Rpb24gYnV0IHdhbnQgdG8gb3JkZXIgYnkgaXRzIHBhcmFtZXRlcnNcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICBleGFtcGxlOiB5b3UgYXJlIHNlbGVjdGluZyBidWlsZEZ1bGxOYW1lRnVuYyhmaXJzdCwgbGFzdCwgbWlkZGxlKSBhbmQgZG9udCB3YW50IHRvIG9yZGVyIGJ5IHRoZSBmdW5jdGlvbiBhbHNvLCB1c2VcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICB7ICduYW1lJyA6IFtGaXJzdENvbHVtbiwgTGFzdENvbHVtbiwgTWlkZGxlQ29sdW1uXSB9IGFuZCBvcmRlciBieSAnbmFtZSA8ZGlyPidcbiAgICAgKi9cbiAgICBhcHBseU9yZGVyKGRlZmF1bHRTcWxUYWJsZSwgb3JkZXJTdHJpbmcsIG92ZXJyaWRlcykge1xuICAgICAgICBpZiAob3JkZXJTdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBjb2w7XG4gICAgICAgICAgICBsZXQgdGFibGU7XG4gICAgICAgICAgICBsZXQgcGFydHM7XG4gICAgICAgICAgICBsZXQgZGlyO1xuICAgICAgICAgICAgb3JkZXJTdHJpbmcuc3BsaXQoJywnKS5mb3JFYWNoKCAobykgPT4ge1xuICAgICAgICAgICAgICAgIHBhcnRzID0gby50cmltKCkuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICBkaXIgPSBwYXJ0cy5sZW5ndGggPiAxID8gcGFydHNbMV0gOiAnQVNDJztcbiAgICAgICAgICAgICAgICBwYXJ0cyA9IHBhcnRzWzBdLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29sID0gcGFydHNbMV0udG9TbmFrZUNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGFibGUgPSBuZXcgU3FsVGFibGUoeyBUYWJsZU5hbWU6IHBhcnRzWzBdLnRvU25ha2VDYXNlKCkgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29sID0gcGFydHNbMF07XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlID0gZGVmYXVsdFNxbFRhYmxlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZXMgJiYgb3ZlcnJpZGVzLmhhc093blByb3BlcnR5KGNvbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcnJpZGVzW2NvbF0uZm9yRWFjaCgob3ZlckNvbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmRlckJ5KG92ZXJDb2wuZGlyKGRpcikpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShkZWZhdWx0U3FsVGFibGUgaW5zdGFuY2VvZiBTcWxUYWJsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiAnU3FsUXVlcnk6OmFwcGx5T3JkZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdkZWZhdWx0U3FsVGFibGUgaXMgbm90IGFuIGluc3RhbmNlIG9mIFNxbFRhYmxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmRlckJ5KChuZXcgU3FsQ29sdW1uKHRhYmxlLCBjb2wpKS5kaXIoZGlyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBzZWxlY3QoLi4uYXJncykge1xuICAgICAgICBjb25zdCBxdWVyeSA9IGFyZ3NbMF07XG4gICAgICAgIGlmIChxdWVyeS5Db2x1bW5zKSB7XG4gICAgICAgICAgICBxdWVyeS5Db2x1bW5zLmZvckVhY2goIChjKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5Db2x1bW5zLnB1c2gobmV3IFNxbENvbHVtbihjKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb2Nlc3NBcmdzKGEgPT4geyB0aGlzLkNvbHVtbnMucHVzaChuZXcgU3FsQ29sdW1uKGEpKTsgfSwgLi4uYXJncyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYnJhY2Utc3R5bGVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGZyb20oc3FsVGFibGUpIHtcbiAgICAgICAgaWYgKCEoc3FsVGFibGUgaW5zdGFuY2VvZiBTcWxUYWJsZSkpIHtcbiAgICAgICAgICAgIHRocm93IHsgbG9jYXRpb246ICdTcWxRdWVyeTo6ZnJvbScsIG1lc3NhZ2U6ICdmcm9tIGNsYXVzZSBtdXN0IGJlIGEgU3FsVGFibGUnIH07IC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuRnJvbS5wdXNoKHNxbFRhYmxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBqb2luKGpvaW5DbGF1c2UpIHtcbiAgICAgICAgaWYgKCEoam9pbkNsYXVzZSBpbnN0YW5jZW9mIFNxbEpvaW4pKSB7XG4gICAgICAgICAgICB0aHJvdyB7IGxvY2F0aW9uOiAnU3FsUXVlcnk6OmpvaW4nLCBtZXNzYWdlOiAnY2xhdXNlIGlzIG5vdCBhIFNxbEpvaW4nIH07IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLkpvaW5zLnB1c2goam9pbkNsYXVzZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgbGVmdChqb2luQ2xhdXNlKSB7XG4gICAgICAgIGpvaW5DbGF1c2UuTGVmdCA9IHRydWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgICAgcmV0dXJuIHRoaXMuam9pbihqb2luQ2xhdXNlKTtcbiAgICB9O1xuICAgIHJpZ2h0KGpvaW5DbGF1c2UpIHtcbiAgICAgICAgam9pbkNsYXVzZS5SaWdodCA9IHRydWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgICAgcmV0dXJuIHRoaXMuam9pbihqb2luQ2xhdXNlKTtcbiAgICB9O1xuICAgIHdoZXJlKHdoZXJlQ2xhdXNlKSB7XG4gICAgICAgIHRoaXMuV2hlcmVzLnB1c2god2hlcmVDbGF1c2UpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGhhdmluZyh3aGVyZUNsYXVzZSkge1xuICAgICAgICB0aGlzLkhhdmluZy5wdXNoKHdoZXJlQ2xhdXNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBvcmRlckJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgcHJvY2Vzc0FyZ3ModiA9PiB7IHRoaXMuT3JkZXJCeS5wdXNoKG5ldyBTcWxPcmRlcih2KSk7IH0sIC4uLmFyZ3MpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJyYWNlLXN0eWxlXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZGlzdGluY3QoKSB7XG4gICAgICAgIHRoaXMuRGlzdGluY3QgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHJlbW92ZUNvbHVtbihzcWxDb2x1bW4pIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSB0aGlzLkNvbHVtbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXS5Db2x1bW5OYW1lID09PSBzcWxDb2x1bW4uQ29sdW1uTmFtZSAmJiBhcnJheVtpXS5UYWJsZU5hbWUgPT09IHNxbENvbHVtbi5UYWJsZU5hbWUgJiYgYXJyYXlbaV0uQWxpYXMgPT09IHNxbENvbHVtbi5BbGlhcykge1xuICAgICAgICAgICAgICAgIGFycmF5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHVwZGF0ZUFsaWFzKHNxbENvbHVtbiwgbmV3QWxpYXMpIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSB0aGlzLkNvbHVtbnM7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXS5Db2x1bW5OYW1lID09PSBzcWxDb2x1bW4uQ29sdW1uTmFtZSAmJiBhcnJheVtpXS5UYWJsZU5hbWUgPT09IHNxbENvbHVtbi5UYWJsZU5hbWUgJiYgYXJyYXlbaV0uQWxpYXMgPT09IHNxbENvbHVtbi5BbGlhcykge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldLkFsaWFzID0gbmV3QWxpYXM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxuICAgICAqIEdlbmVyYXRlcyB0aGUgU1FMIGZyb20gdGhlIGJ1aWx0IHVwIHF1ZXJ5XG4gICAgICogQHBhcmFtIHtkZWNyeXB0RnVuY3Rpb259IGZ1bmN0aW9uIHRoYXQgdGFrZXMgKFNxbENvbHVtbiwgYm9vbGVhbiAtIHNob3VsZCB0aGlzIHVzZSB0aGUgcXVhbGlmaWVkIG5hbWUsIHVzdWFsbHkgdHJ1ZSlcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsIGlmIG5vdCBkZWNyeXB0ZWRcbiAgICAgKiBAcGFyYW0ge21hc2tGdW5jdGlvbn0gZnVuY3Rpb24gdGhhdCB0YWtlcyAoU3FsQ29sdW1uLCBzZWxlY3QgdGVybSAtIHRoaXMgd2lsbCBpbmNsdWRlIGRlY3J5cHRpb24gZnJvbSBhYm92ZSlcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGwgaWYgbm90IHJlcGxhY2VtZW50XG4gICAgICogQHJldHVybiB7IGZldGNoU3FsLCBjb3VudFNxbCwgdmFsdWVzLCBoYXNFbmNyeXB0ZWQgfVxuICAgICAqL1xuICAgIGdlblNxbChkZWNyeXB0RnVuY3Rpb24sIG1hc2tGdW5jdGlvbikge1xuICAgICAgICBpZiAodGhpcy5Gcm9tICYmIHRoaXMuRnJvbS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyB7IGxvY2F0aW9uOiAndG9TcWwnLCBtZXNzYWdlOiAnTm8gRlJPTSBpbiBxdWVyeScgfTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3FsID0ge307XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xuICAgICAgICBjb25zdCBncm91cEJ5ID0gW107XG4gICAgICAgIGxldCBjb2x1bW5zID0gJyc7XG4gICAgICAgIGxldCBvcmRlclN0cmluZztcbiAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgIGxldCBoYXNFbmNyeXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5Db2x1bW5zLmZvckVhY2goKGMsIGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKGMuTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgIGNvbHVtbnMgKz0gYCR7KGlkeCA+IDAgPyAnLCcgOiAnJyl9XFxuKCR7Yy5MaXRlcmFsfSkgYXMgJHtjLkFsaWFzLnNxbEVzY2FwZSh0aGlzLCAnY29sdW1uLWFsaWFzJyl9YDtcbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgYW55IGNvbHVtbnMgdGhhdCBtaWdodCBoYXZlIHZhbHVlc1xuICAgICAgICAgICAgICAgIGlmIChjLlZhbHVlcykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgaW4gYy5WYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLlZhbHVlcy5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2F0dHJdID0gYy5WYWx1ZXNbYXR0cl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGMuR3JvdXBlZCkge1xuICAgICAgICAgICAgICAgICAgICBncm91cEJ5LnB1c2goYCgke2MuTGl0ZXJhbH0pYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjLkFnZ3JlZ2F0ZSkge1xuICAgICAgICAgICAgICAgIGxldCBsaXRlcmFsID0gZGVjcnlwdEZ1bmN0aW9uID8gZGVjcnlwdEZ1bmN0aW9uKGMsIHRydWUpIDogbnVsbDtcbiAgICAgICAgICAgICAgICBoYXNFbmNyeXB0ZWQgPSBsaXRlcmFsICE9PSBudWxsO1xuICAgICAgICAgICAgICAgIGxpdGVyYWwgPSBsaXRlcmFsIHx8IGMucXVhbGlmaWVkTmFtZSh0aGlzKTtcbiAgICAgICAgICAgICAgICBjb2x1bW5zICs9IGAkeyhpZHggPiAwID8gJywnIDogJycpfVxcbiR7Yy5BZ2dyZWdhdGUub3BlcmF0aW9ufSgke2xpdGVyYWx9KSBhcyAke2MuQWxpYXMuc3FsRXNjYXBlKHRoaXMsICdjb2x1bW4tYWxpYXMnKX1gO1xuICAgICAgICAgICAgICAgIGlmIChjLkFnZ3JlZ2F0ZS5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwQnkucHVzaChjLkFnZ3JlZ2F0ZS5ncm91cEJ5LnF1YWxpZmllZE5hbWUodGhpcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGxpdGVyYWwgPSBkZWNyeXB0RnVuY3Rpb24gPyBkZWNyeXB0RnVuY3Rpb24oYywgdHJ1ZSkgOiBudWxsO1xuICAgICAgICAgICAgICAgIGhhc0VuY3J5cHRlZCA9IGxpdGVyYWwgIT09IG51bGw7XG4gICAgICAgICAgICAgICAgbGl0ZXJhbCA9IGxpdGVyYWwgfHwgYy5xdWFsaWZpZWROYW1lKHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmIChtYXNrRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbGl0ZXJhbCA9IG1hc2tGdW5jdGlvbihjLCBsaXRlcmFsKSB8fCBsaXRlcmFsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbHVtbnMgKz0gYCR7KGlkeCA+IDAgPyAnLCcgOiAnJyl9XFxuJHtsaXRlcmFsfSBhcyAke2MuQWxpYXMuc3FsRXNjYXBlKHRoaXMsICdjb2x1bW4tYWxpYXMnKX1gO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFvcmRlclN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBvcmRlclN0cmluZyA9IGMuQWxpYXMuc3FsRXNjYXBlKHRoaXMsICdjb2x1bW4tYWxpYXMnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIGMuR3JvdXBlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBCeS5wdXNoKGxpdGVyYWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGxldCBmcm9tID0gJyc7XG4gICAgICAgIHRoaXMuRnJvbS5mb3JFYWNoKChmLCBpZHgpID0+IHtcbiAgICAgICAgICAgIGZyb20gKz0gYCR7KGlkeCA+IDAgPyAnLCcgOiAnJyl9XFxuJHtmLmdldFRhYmxlKCl9IGFzICR7Zi5BbGlhcy5zcWxFc2NhcGUodGhpcywgJ3RhYmxlLWFsaWFzJyl9YDtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGxldCBqb2luID0gJyc7XG4gICAgICAgIHRoaXMuSm9pbnMuZm9yRWFjaCgoaikgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGouTGVmdCA/ICdMRUZUICcgOiAoai5SaWdodCA/ICdSSUdIVCAnIDogJycpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5lc3RlZC10ZXJuYXJ5XG4gICAgICAgICAgICBjb25zdCBmcm9tID0gai5Gcm9tLlRhYmxlLmdldFRhYmxlKCk7XG4gICAgICAgICAgICBjb25zdCBhbGlhcyA9IGouRnJvbS5UYWJsZS5BbGlhcy5zcWxFc2NhcGUodGhpcywgJ3RhYmxlLWFsaWFzJyk7XG4gICAgICAgICAgICBjb25zdCBmcm9tQ29sID0gai5Gcm9tLkNvbHVtbk5hbWU7XG4gICAgICAgICAgICBjb25zdCB0byA9IGouVG8uVGFibGUuQWxpYXMuc3FsRXNjYXBlKHRoaXMsICd0YWJsZS1hbGlhcycpO1xuICAgICAgICAgICAgY29uc3QgdG9Db2wgPSBqLlRvLkNvbHVtbk5hbWU7XG4gICAgICAgICAgICBqb2luICs9IGBcXG4ke3R5cGV9Sk9JTiAke2Zyb219IGFzICR7YWxpYXN9IG9uICR7YWxpYXN9LiR7ZnJvbUNvbH0gPSAke3RvfS4ke3RvQ29sfWBcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgY29uc3Qgd2hlcmUgPSB0aGlzLkJ1aWxkV2hlcmVQYXJ0KHRoaXMuV2hlcmVzLCB2YWx1ZXMsICdhbmQnKTtcblxuICAgICAgICBjb25zdCBoYXZpbmcgPSB0aGlzLkJ1aWxkV2hlcmVQYXJ0KHRoaXMuSGF2aW5nLCB2YWx1ZXMsICdhbmQnKTtcblxuICAgICAgICBjb25zdCB0b3AgPSAodGhpcy50b3BDb3VudCA/IGAgVE9QICR7dGhpcy50b3BDb3VudH1gIDogJycpO1xuICAgICAgICBsZXQgc2VsZWN0O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpYWxlY3QgIT09ICdNUycpIHtcbiAgICAgICAgICAgIHNlbGVjdCA9IGBTRUxFQ1Qkeyh0aGlzLkRpc3RpbmN0ID8gJyBESVNUSU5DVCcgOiAnJyl9JHtjb2x1bW5zfVxcbkZST00ke2Zyb219JHtqb2lufWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3QgPSBgU0VMRUNUJHt0b3B9JHsodGhpcy5EaXN0aW5jdCA/ICcgRElTVElOQ1QnIDogJycpfSR7Y29sdW1uc31cXG5GUk9NJHtmcm9tfSR7am9pbn1gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdoZXJlICYmIHdoZXJlICE9PSAnJykge1xuICAgICAgICAgICAgc2VsZWN0ICs9IGBcXG5XSEVSRSAke3doZXJlfWA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdyb3VwQnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2VsZWN0ICs9IGBcXG5HUk9VUCBCWSAke2dyb3VwQnkuam9pbigpfWA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhdmluZyAmJiBoYXZpbmcgIT09ICcnKSB7XG4gICAgICAgICAgICBzZWxlY3QgKz0gYFxcbkhBVklORyAke2hhdmluZ31gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBhZ2VObztcbiAgICAgICAgbGV0IHBhZ2VTaXplID0gdGhpcy5pdGVtc1BlclBhZ2U7XG5cbiAgICAgICAgaWYgKHBhZ2UgJiYgIXBhZ2VTaXplKSB7XG4gICAgICAgICAgICBwYWdlU2l6ZSA9IDUwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYWdlU2l6ZSAmJiAhcGFnZSkge1xuICAgICAgICAgICAgcGFnZSA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY291bnRTcWw7XG4gICAgICAgIGxldCBmZXRjaFNxbDtcbiAgICAgICAgbGV0IG9yZGVyID0gJyc7XG4gICAgICAgIGlmIChwYWdlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5PcmRlckJ5ICYmIHRoaXMuT3JkZXJCeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5PcmRlckJ5LmZvckVhY2goIChvLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Uga25vdyB3ZSBhcmUgZ29pbmcgdG8gYmUgb3JkZXJpbmcgb3ZlciBhIHNlbGVjdCwgd2UgZG9uJ3QgbmVlZCBhIHRhYmxlXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIHRoaXMsIGp1c3QgdXNlIHRoZSBjb2x1bW4gYWxpYXNcbiAgICAgICAgICAgICAgICAgICAgb3JkZXIgKz0gYCR7KGlkeCA+IDAgPyAnLCcgOiAnJyl9JHtvLkNvbHVtbi5BbGlhcy5zcWxFc2NhcGUodGhpcywgJ2NvbHVtbi1hbGlhcycpfSAke28uRGlyZWN0aW9ufWA7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgb3JkZXJTdHJpbmcgPSBvcmRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50U3FsID0gYFNFTEVDVCBjb3VudCgqKSBhcyBSZWNvcmRDb3VudCBGUk9NIChcXG4ke3NlbGVjdH1cXG4pIGNvdW50X3RibGA7XG4gICAgICAgICAgICBjb25zdCBiYXNlU3FsID0gYFNFTEVDVCAqLCByb3dfbnVtYmVyKCkgT1ZFUiAoT1JERVIgQlkgJHtvcmRlclN0cmluZ30pIGFzIFBhZ2luZ19Sb3dOdW1iZXIgRlJPTSAoXFxuJHtzZWxlY3R9XFxuKSBiYXNlX3F1ZXJ5YDtcbiAgICAgICAgICAgIGZldGNoU3FsID0gYFNFTEVDVCAqIEZST00gKFxcbiR7YmFzZVNxbH1cXG4pIGFzIGRldGFpbF9xdWVyeSBXSEVSRSBQYWdpbmdfUm93TnVtYmVyIEJFVFdFRU4gJHsocGFnZSAtIDEpICogcGFnZVNpemV9IEFORCAke3BhZ2UgKiBwYWdlU2l6ZX1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5PcmRlckJ5LmZvckVhY2goKG8sIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIG9yZGVyICs9IGAkeyhpZHggPiAwID8gJywnIDogJycpfSR7by5Db2x1bW4ucXVhbGlmaWVkTmFtZSh0aGlzKX0gJHtvLkRpcmVjdGlvbn1gO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgb3JkZXIgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgZmV0Y2hTcWwgPSBgJHtzZWxlY3R9XFxuT1JERVIgQlkgJHtvcmRlcn1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmZXRjaFNxbCA9IHNlbGVjdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlhbGVjdCAhPT0gJ01TJyAmJiB0aGlzLnRvcENvdW50KSB7XG4gICAgICAgICAgICAgICAgZmV0Y2hTcWwgKz0gYFxcbkxJTUlUICR7dGhpcy50b3BDb3VudH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNxbC5mZXRjaFNxbCA9IGZldGNoU3FsO1xuICAgICAgICBzcWwuY291bnRTcWwgPSBjb3VudFNxbDtcbiAgICAgICAgc3FsLmhhc0VuY3J5cHRlZCA9IGhhc0VuY3J5cHRlZDtcbiAgICAgICAgaWYgKCAhdGhpcy5vcHRpb25zLm5hbWVkVmFsdWVzIHx8IHRoaXMub3B0aW9ucy5tYXJrZXJUeXBlID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIHNxbC52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzcWwudmFsdWVzID0ge307XG4gICAgICAgICAgICB2YWx1ZXMuZm9yRWFjaCggKHYpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgaW4gdikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodi5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3FsLnZhbHVlc1thdHRyXSA9IHZbYXR0cl07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzcWw7XG4gICAgfVxufVxuIl19