"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./string.js");
var helpers_1 = require("./helpers");
var sql_table_1 = require("./sql-table");
var sql_where_1 = require("./sql-where");
var sql_query_1 = require("./sql-query");
function updateDelete(operation, sqlTable, details, encryptFunction) {
    if (!(sqlTable instanceof sql_table_1.default)) {
        throw {
            location: 'SqlBuilder::update',
            message: 'sqlTable is not an instance of SqlTable'
        }; // eslint-disable-line
    }
    var options = sql_query_1.getDefaultOptions();
    var data = details.id ? {
        id: details.id
    } : {};
    var sep = operation === 'update' ? ',' : ' AND ';
    var hasEncryptedValues = false;
    var item = 1;
    var columns = '';
    var attr;
    var variable;
    var encrypted;
    var column;
    for (attr in details) {
        if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
            column = sqlTable[attr];
            variable = attr + item.toString();
            data[variable] = details[attr];
            encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
            variable = encrypted || "" + options.namedValueMarker + variable;
            if (encrypted != null) {
                hasEncryptedValues = true;
            }
            columns += "" + (item === 1 ? '' : sep) + attr.toSnakeCase() + " = " + variable;
            item += 1;
        }
    }
    var sql;
    if (operation === 'update') {
        sql = "UPDATE " + sqlTable.getTable() + " SET " + columns + " WHERE id = " + options.namedValueMarker + "id";
    }
    else if (operation === 'delete') {
        if (details.id) {
            columns += (item === 1 ? '' : sep) + "id = " + options.namedValueMarker + "id";
        }
        sql = "DELETE FROM " + sqlTable.getTable() + " WHERE " + columns;
    }
    else {
        throw new helpers_1.SqlError('updateDelet', "Invalid operation " + operation);
    }
    return {
        sql: sql,
        values: data,
        hasEncrypted: hasEncryptedValues,
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
                    }
                    else {
                        whereClause = tmpClause;
                    }
                }
                else {
                    throw { location: 'SqlBuilder:buildWhere', message: ("unknown column " + attr + " in table " + sqlTable.TableName + " from where clause") };
                }
            });
            if (where) {
                where = where.or(whereClause);
            }
            else {
                where = whereClause;
            }
        });
    }
    return where;
}
var SqlBuilder = (function () {
    function SqlBuilder() {
    }
    /*
    * @param {sqlTable} - SqlTable instance for the table to build the update for
    * @param {details} - object with columns and values
    * @param {encryptFunction} - function(SqlColumn, variableName) - where SqlColumn is the instance of the column from the table
    *                              being updated, variableName is the sql replacement name (ie. businessName1)
    *                              should return null if not encrypted
    * @return { sql, values, hasEncrypted }
    */
    SqlBuilder.update = function (sqlTable, details, encryptFunction) {
        return updateDelete('update', sqlTable, details, encryptFunction);
    };
    SqlBuilder.delete = function (sqlTable, details, encryptFunction) {
        return updateDelete('delete', sqlTable, details, encryptFunction);
    };
    SqlBuilder.insert = function (sqlTable, details, newId, encryptFunction) {
        if (!(sqlTable instanceof sql_table_1.default)) {
            throw {
                location: 'SqlBuilder::insert',
                message: 'sqlTable is not an instance of SqlTable'
            }; //eslint-disable-line
        }
        var options = sql_query_1.getDefaultOptions();
        var item = 1;
        var data = {};
        var variable;
        var encrypted;
        var column;
        var columnList = '';
        var variableList = '';
        var hasEncryptedValues = false;
        for (var attr in details) {
            if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                column = sqlTable[attr];
                variable = attr + item.toString();
                data[variable] = details[attr];
                columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
                encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
                variable = encrypted || "" + options.namedValueMarker + variable;
                if (encrypted != null) {
                    hasEncryptedValues = true;
                }
                variableList += "" + (item === 1 ? '' : ',') + variable;
                item += 1;
            }
        }
        if (newId) {
            columnList += ', id';
            variableList += ", " + options.namedValueMarker + "id";
            data.id = newId;
        }
        return {
            sql: "INSERT INTO " + sqlTable.getTable() + " (" + columnList + ") VALUES (" + variableList + ")",
            values: data,
            hasEncrypted: hasEncryptedValues,
        };
    };
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
    SqlBuilder.search = function (sqlTable, searchDetails) {
        var query = new sql_query_1.default();
        query.from(sqlTable);
        var searchColumns = searchDetails.columns || searchDetails.select;
        if (searchColumns) {
            var columns = null;
            if (Array.isArray(searchColumns)) {
                columns = searchColumns;
            }
            else {
                columns = searchColumns.split(',');
            }
            columns.forEach(function (c) {
                if (sqlTable.hasOwnProperty(c.toCamel())) {
                    query.select(sqlTable[c.toCamel()]);
                }
                else {
                    throw { location: 'SqlBuilder:search - columns', message: ("(columns) unknown column for table " + sqlTable.TableName + " - " + c) };
                }
            });
        }
        else {
            query.select(sqlTable.star());
        }
        var whereClause = new sql_where_1.default();
        if (searchDetails.filter) {
            if (Array.isArray(searchDetails.filter)) {
                searchDetails.filter.forEach(function (filter) {
                    whereClause.or(buildWhere(filter, sqlTable));
                });
            }
            else {
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
                    }
                    else {
                        throw { location: 'SqlBuilder:Search - orderBy', message: ("unknown column for table " + sqlTable.TableName + " - " + c) };
                    }
                });
            }
            else {
                searchDetails.orderBy.split(',').forEach(function (c) {
                    var columnDetails = c.split(';');
                    var name = columnDetails[0];
                    if (sqlTable.hasOwnProperty(name)) {
                        query.orderBy(sqlTable[name].dir(columnDetails[1] || 'ASC'));
                    }
                    else {
                        throw { location: 'SqlBuilder:Search - orderBy2', message: ("unknown column for table " + sqlTable.TableName + " - " + c) };
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
    };
    return SqlBuilder;
}());
exports.default = SqlBuilder;
//# sourceMappingURL=sql-builder.js.map