import './string.js';

import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import SqlQuery, {
    getDefaultOptions
} from './sql-query';

function updateDelete(operation, sqlTable, details, encryptFunction) {
    if (!(sqlTable instanceof SqlTable)) {
        throw {
            location: 'SqlBuilder::update',
            message: 'sqlTable is not an instance of SqlTable'
        }; // eslint-disable-line
    }
    const options = getDefaultOptions();
    const data = details.id ? {
        id: details.id
    } : {};
    const sep = operation === 'update' ? ',' : ' AND ';
    let hasEncryptedValues = false;
    let item = 1;
    let columns = '';
    let attr;
    let variable;
    let encrypted;
    let column;
    for (attr in details) { // eslint-disable-line no-restricted-syntax
        if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
            column = sqlTable[attr];
            variable = attr + item.toString();
            data[variable] = details[attr];
            encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
            variable = encrypted || `${options.namedValueMarker}${variable}`;
            if (encrypted != null) {
                hasEncryptedValues = true;
            }
            columns += `${(item === 1 ? '' : sep)}${attr.toSnakeCase()} = ${variable}`;
            item += 1;
        }
    }
    let sql;
    if (operation === 'update') {
        sql = `UPDATE ${sqlTable.getTable()} SET ${columns} WHERE id = ${options.namedValueMarker}id`;
    } else if (operation === 'delete') {
        if (details.id) {
            columns += `${(item === 1 ? '' : sep)}id = ${options.namedValueMarker}id`;
        }
        sql = `DELETE FROM ${sqlTable.getTable()} WHERE ${columns}`;
    } else {
        throw new {
            msg: `Invalid operation ${operation}`
        }; //eslint-disable-line
    }
    return {
        sql,
        values: data,
        hasEncrypted: hasEncryptedValues,
    };
}

function buildWhere(filterString, sqlTable) {
    let where = null
    if (filterString) {
        const ors = filterString.split(';');

        ors.forEach((orFilter) => {
            const filters = orFilter.split(',');
            let whereClause = null
            filters.forEach((filter) => {
                const parts = filter.split('.');
                const attr = parts[0];
                const op = parts[1];
                const val1 = parts[2];
                const val2 = parts.length > 3 ? parts[3] : null;
                if (sqlTable.hasOwnProperty(attr)) {
                    const tmpClause = sqlTable[attr].op(op, val1, val2);
                    if (whereClause) {
                        whereClause = whereClause.and(tmpClause);
                    } else {
                        whereClause = tmpClause;
                    }
                } else {
                    throw { location: 'SqlBuilder:buildWhere', message: (`unknown column ${attr} in table ${sqlTable.TableName} from where clause`) }
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

export default class SqlBuilder {
    /*
     * @depreicated
     */
    constructor() {
            console.log('SqlBuilder object is deprecated, please use static SqlBuilder methods directly');
        }
        /*
         * @depreicated
         */
    update(sqlTable, details, encryptFunction) {
            console.log('update from a SqlBuilder object is deprecated, please use static SqlBuilder.update');
            return SqlBuilder.update(sqlTable, details, encryptFunction);
        }
        /*
         * @depreicated
         */
    insert(sqlTable, details, newId, encryptFunction) {
            console.log('insert from a SqlBuilder object is deprecated, please use static SqlBuilder.insert');
            return SqlBuilder.insert(sqlTable, details, newId, encryptFunction);
        }
        /*
         * @param {sqlTable} - SqlTable instance for the table to build the update for
         * @param {details} - object with columns and values
         * @param {encryptFunction} - function(SqlColumn, variableName) - where SqlColumn is the instance of the column from the table
         *                              being updated, variableName is the sql replacement name (ie. businessName1)
         *                              should return null if not encrypted
         * @return { sql, values, hasEncrypted }
         */
    static update(sqlTable, details, encryptFunction) {
        return updateDelete('update', sqlTable, details, encryptFunction);
    }
    static delete(sqlTable, details, encryptFunction) {
        return updateDelete('delete', sqlTable, details, encryptFunction);
    }
    static insert(sqlTable, details, newId, encryptFunction) {
            if (!(sqlTable instanceof SqlTable)) {
                throw {
                    location: 'SqlBuilder::insert',
                    message: 'sqlTable is not an instance of SqlTable'
                }; //eslint-disable-line
            }
            const options = getDefaultOptions();
            let item = 1;
            const data = {};
            let variable;
            let encrypted;
            let column;
            let columnList = '';
            let variableList = '';
            let hasEncryptedValues = false;
            for (const attr in details) { // eslint-disable-line no-restricted-syntax
                if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                    column = sqlTable[attr];
                    variable = attr + item.toString();
                    data[variable] = details[attr];
                    columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
                    encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
                    variable = encrypted || `${options.namedValueMarker}${variable}`;
                    if (encrypted != null) {
                        hasEncryptedValues = true;
                    }
                    variableList += `${(item === 1 ? '' : ',')}${variable}`;
                    item += 1;
                }
            }
            if (newId) {
                columnList += ', id';
                variableList += `, ${options.namedValueMarker}id`;
                data.id = newId;
            }

            return {
                sql: `INSERT INTO ${sqlTable.getTable()} (${columnList}) VALUES (${variableList})`,
                values: data,
                hasEncrypted: hasEncryptedValues,
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

    static search(sqlTable, searchDetails) {
        const query = new SqlQuery();
        query.from(sqlTable);
        const searchColumns = searchDetails.columns || searchDetails.select;
        if (searchColumns) {
            let columns = null;
            if (Array.isArray(searchColumns)) {
                columns = searchColumns;
            } else {
                columns = searchColumns.split(',');
            }
            columns.forEach((c) => {
                if (sqlTable.hasOwnProperty(c.toCamel())) {
                    query.select(sqlTable[c.toCamel()]);
                } else {
                    throw { location: 'SqlBuilder:search - columns', message: (`(columns) unknown column for table ${sqlTable.TableName} - ${c}`) }
                }
            });
        } else {
            query.select(sqlTable.star());
        }

        let whereClause = new SqlWhere();
        if (searchDetails.filter) {
            if (Array.isArray(searchDetails.filter)) {
                searchDetails.filter.forEach((filter) => {
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
                searchDetails.orderBy.forEach((c) => {
                    if (sqlTable.hasOwnProperty(c)) {
                        query.orderBy(sqlTable[c]);
                    } else {
                        throw { location: 'SqlBuilder:Search - orderBy', message: (`unknown column for table ${sqlTable.TableName} - ${c}`) }
                    }
                });
            } else {
                searchDetails.orderBy.split(',').forEach((c) => {
                    const columnDetails = c.split(';');
                    const name = columnDetails[0];
                    if (sqlTable.hasOwnProperty(name)) {
                        query.orderBy(sqlTable[name].dir(columnDetails[1] || 'ASC'));
                    } else {
                        throw { location: 'SqlBuilder:Search - orderBy2', message: (`unknown column for table ${sqlTable.TableName} - ${c}`) }
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
        return query
    }
}
