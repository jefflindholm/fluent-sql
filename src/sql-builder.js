import './string.js';

import SqlTable from './sql-table';
import {getDefaultOptions} from './sql-query';

function updateDelete (operation, sqlTable, details, encryptFunction) {
    if (!(sqlTable instanceof SqlTable)) {
        throw {location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable'};
    }
    const options = getDefaultOptions();
    const data = details.id ? {id: details.id} : {};
    const sep = operation === 'update' ? ',' : ' AND ';
    let hasEncryptedValues = false;
    let item = 1;
    let columns = '';
    let attr;
    let variable;
    let encrypted;
    let column;
    for (attr in details) {
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
    if ( operation === 'update' ) {
        sql = `UPDATE ${sqlTable.getTable()} SET ${columns} WHERE id = ${options.namedValueMarker}id`;
    } else if ( operation === 'delete' ) {
        if ( details.id ) {
            columns += ` AND id = ${options.namedValueMarker}id`;
        }
        sql = `DELETE FROM ${sqlTable.getTable()} WHERE ${columns}`;
    } else {
        throw new {msg: `Invalid operation ${operation}`};
    }
    return {
        sql,
        values: data,
        hasEncrypted: hasEncryptedValues,
    };
};

export default class SqlBuilder {
    /*
     * @depreicated
     */
    constructor() {
        console.log('SqlBuilder object is deprecated, please use static SqlBuilder methods directly')
    }
    /*
     * @depreicated
     */
    update(sqlTable, details, encryptFunction) {
        console.log('update from a SqlBuilder object is deprecated, please use static SqlBuilder.update')
        return SqlBuilder.update(sqlTable, details, encryptFunction);
    }
    /*
     * @depreicated
     */
    insert(sqlTable, details, newId, encryptFunction) {
        console.log('insert from a SqlBuilder object is deprecated, please use static SqlBuilder.insert')
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
    static update (sqlTable, details, encryptFunction) {
        return updateDelete('update', sqlTable, details, encryptFunction);
    }
    static delete (sqlTable, details, encryptFunction) {
        return updateDelete('delete', sqlTable, details, encryptFunction);
    }
    static insert (sqlTable, details, newId, encryptFunction) {
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable'};
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
        for (const attr in details) {
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
    };
}
