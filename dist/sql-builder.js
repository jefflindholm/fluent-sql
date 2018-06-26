'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./string.js');

var _sqlTable = require('./sql-table');

var _sqlTable2 = _interopRequireDefault(_sqlTable);

var _sqlWhere = require('./sql-where');

var _sqlWhere2 = _interopRequireDefault(_sqlWhere);

var _sqlQuery = require('./sql-query');

var _sqlQuery2 = _interopRequireDefault(_sqlQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function updateDelete(operation, sqlTable, details, encryptFunction) {
    if (!(sqlTable instanceof _sqlTable2.default)) {
        throw {
            location: 'SqlBuilder::update',
            message: 'sqlTable is not an instance of SqlTable'
        }; // eslint-disable-line
    }
    var options = (0, _sqlQuery.getDefaultOptions)();
    var isArray = !options.namedValues || options.markerType === 'number';
    var data = isArray ? [] : {};
    if (details.id) {
        if (!isArray) {
            data.id = details.id;
        } else {
            data.push(details.id);
        }
    }
    var sep = operation === 'update' ? ',' : ' AND ';
    var hasEncryptedValues = false;
    var item = 1;
    var columns = '';
    var attr = void 0;
    var variable = void 0;
    var encrypted = void 0;
    var column = void 0;
    for (attr in details) {
        // eslint-disable-line no-restricted-syntax
        if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
            column = sqlTable[attr];
            if (isArray) {
                variable = (item + 1).toString();
                data.push(details[attr]);
            } else {
                variable = attr + item.toString();
                data[variable] = details[attr];
            }
            encrypted = encryptFunction ? encryptFunction(column, variable) : null;
            variable = encrypted || '' + options.namedValueMarker + variable;
            if (encrypted != null) {
                hasEncryptedValues = true;
            }
            columns += '' + (item === 1 ? '' : sep) + attr.toSnakeCase() + ' = ' + variable;
            item += 1;
        }
    }
    var sql = void 0;
    if (operation === 'update') {
        if (isArray) {
            sql = 'UPDATE ' + sqlTable.getTable() + ' SET ' + columns + ' WHERE id = ' + options.namedValueMarker + '1';
        } else {
            sql = 'UPDATE ' + sqlTable.getTable() + ' SET ' + columns + ' WHERE id = ' + options.namedValueMarker + 'id';
        }
    } else if (operation === 'delete') {
        if (details.id) {
            if (isArray) {
                columns += (item === 1 ? '' : sep) + 'id = ' + options.namedValueMarker + '1';
            } else {
                columns += (item === 1 ? '' : sep) + 'id = ' + options.namedValueMarker + 'id';
            }
        }
        sql = 'DELETE FROM ' + sqlTable.getTable() + ' WHERE ' + columns;
    } else {
        throw new {
            msg: 'Invalid operation ' + operation
        }(); //eslint-disable-line
    }
    return {
        sql: sql,
        values: data,
        hasEncrypted: hasEncryptedValues
    };
}

function buildWhere(filterString, sqlTable) {
    var where = null;
    if (filterString) {
        var ors = filterString.split(';');

        ors.forEach(function (orFilter) {
            var filters = orFilter.split(',');
            var whereClause = null;
            filters.forEach(function (filter) {
                var parts = filter.split('.');
                var attr = parts[0];
                var op = parts[1];
                var val1 = parts[2];
                var val2 = parts.length > 3 ? parts[3] : null;
                if (sqlTable.hasOwnProperty(attr)) {
                    var tmpClause = sqlTable[attr].op(op, val1, val2);
                    if (whereClause) {
                        whereClause = whereClause.and(tmpClause);
                    } else {
                        whereClause = tmpClause;
                    }
                } else {
                    throw { location: 'SqlBuilder:buildWhere', message: 'unknown column ' + attr + ' in table ' + sqlTable.TableName + ' from where clause' };
                }
            });
            if (where) {
                where = where.or(whereClause);
            } else {
                where = whereClause;
            }
        });
    }
    return where;
}

var SqlBuilder = function () {
    function SqlBuilder() {
        _classCallCheck(this, SqlBuilder);
    }

    _createClass(SqlBuilder, null, [{
        key: 'update',
        value: function update(sqlTable, details, encryptFunction) {
            return updateDelete('update', sqlTable, details, encryptFunction);
        }
    }, {
        key: 'delete',
        value: function _delete(sqlTable, details, encryptFunction) {
            return updateDelete('delete', sqlTable, details, encryptFunction);
        }
    }, {
        key: 'insert',
        value: function insert(sqlTable, details, newId, encryptFunction) {
            if (!(sqlTable instanceof _sqlTable2.default)) {
                throw {
                    location: 'SqlBuilder::insert',
                    message: 'sqlTable is not an instance of SqlTable'
                }; //eslint-disable-line
            }
            var options = (0, _sqlQuery.getDefaultOptions)();
            var isArray = !options.namedValues || options.markerType === 'number';
            var item = 1;
            var data = isArray ? [] : {};
            var variable = void 0;
            var encrypted = void 0;
            var column = void 0;
            var columnList = '';
            var variableList = '';
            var hasEncryptedValues = false;
            for (var attr in details) {
                // eslint-disable-line no-restricted-syntax
                if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                    column = sqlTable[attr];
                    if (isArray) {
                        variable = item.toString();
                        data.push(details[attr]);
                    } else {
                        variable = attr + item.toString();
                        data[variable] = details[attr];
                    }
                    columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
                    encrypted = encryptFunction ? encryptFunction(column, variable) : null;
                    variable = encrypted || '' + options.namedValueMarker + variable;
                    if (encrypted != null) {
                        hasEncryptedValues = true;
                    }
                    variableList += '' + (item === 1 ? '' : ',') + variable;
                    item += 1;
                }
            }
            if (newId) {
                columnList += ', id';
                if (isArray) {
                    variableList += ', ' + options.namedValueMarker + item;
                    data.push(newId);
                } else {
                    variableList += ', ' + options.namedValueMarker + 'id';
                    data.id = newId;
                }
            }

            return {
                sql: 'INSERT INTO ' + sqlTable.getTable() + ' (' + columnList + ') VALUES (' + variableList + ')',
                values: data,
                hasEncrypted: hasEncryptedValues
            };
        }
        /*
         * @param {sqlTable} - SqlTable instance for the table to build the update for
         * @param {searchDetails} - object
         *  - select = columns to select from the table (comma separated)
         *  - filter =
         *      = string - where clause column.OP.value,... comma = AND'ed semi-colon = OR'ed
         *          example:
         *                 { select: 'key.gt.9;key.lt.2' } = key > 9 OR key < 2
         *                 { select: 'key.gt.9,name.like.foo;key.lt2 } = (key > 9 AND name like '%foo%') OR (key < 2)
         *      = array of string - column.OP.value... will be OR'ed with each other string
         *  - orderBy = column;[ASC|DESC],...
         *  - pageNo = which page to fetch of paged data defaults to 1st
         *  - pageSize = how much data per page defaults to 50
         */

    }, {
        key: 'search',
        value: function search(sqlTable, searchDetails) {
            var query = new _sqlQuery2.default();
            query.from(sqlTable);
            var searchColumns = searchDetails.columns || searchDetails.select;
            if (searchColumns) {
                var columns = null;
                if (Array.isArray(searchColumns)) {
                    columns = searchColumns;
                } else {
                    columns = searchColumns.split(',');
                }
                columns.forEach(function (c) {
                    if (sqlTable.hasOwnProperty(c.toCamel())) {
                        query.select(sqlTable[c.toCamel()]);
                    } else {
                        throw { location: 'SqlBuilder:search - columns', message: '(columns) unknown column for table ' + sqlTable.TableName + ' - ' + c };
                    }
                });
            } else {
                query.select(sqlTable.star());
            }

            var whereClause = new _sqlWhere2.default();
            if (searchDetails.filter) {
                if (Array.isArray(searchDetails.filter)) {
                    searchDetails.filter.forEach(function (filter) {
                        whereClause.or(buildWhere(filter, sqlTable));
                    });
                } else {
                    whereClause = buildWhere(searchDetails.filter, sqlTable);
                }
            }
            if (whereClause) {
                query.where(whereClause);
            }
            if (searchDetails.orderBy) {
                if (Array.isArray(searchDetails.orderBy)) {
                    searchDetails.orderBy.forEach(function (c) {
                        if (sqlTable.hasOwnProperty(c)) {
                            query.orderBy(sqlTable[c]);
                        } else {
                            throw { location: 'SqlBuilder:Search - orderBy', message: 'unknown column for table ' + sqlTable.TableName + ' - ' + c };
                        }
                    });
                } else {
                    searchDetails.orderBy.split(',').forEach(function (c) {
                        var columnDetails = c.split(';');
                        var name = columnDetails[0];
                        if (sqlTable.hasOwnProperty(name)) {
                            query.orderBy(sqlTable[name].dir(columnDetails[1] || 'ASC'));
                        } else {
                            throw { location: 'SqlBuilder:Search - orderBy2', message: 'unknown column for table ' + sqlTable.TableName + ' - ' + c };
                        }
                    });
                }
            }
            if (searchDetails.pageNo) {
                query.page(searchDetails.pageNo);
            }
            if (searchDetails.pageSize) {
                query.pageSize(searchDetails.pageSize);
            }
            if (!searchDetails.pageNo && !searchDetails.pageSize) {
                query.pageSize(50);
            }
            return query;
        }
    }]);

    return SqlBuilder;
}();

exports.default = SqlBuilder;