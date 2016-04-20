import './string.js';
import sliced from 'sliced';
import util from 'util';
import {sprintf} from 'sprintf-js';

import SqlColumn from './sql-column';
import SqlJoin from './sql-join';
import SqlOrder from './sql-order';
import SqlQuery from './sql-query';
import SqlTable from './sql-table';
import SqlWhere from './sql-where';

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
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable'};
        }
        var item = 1;
        var data = {id: details.id};
        var update = '';
        var attr;
        var variable;
        var encrypted;
        var column;
        var hasEncryptedValues = false;
        for (attr in details) {
            if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                column = sqlTable[attr];
                variable = attr + item.toString();
                data[variable] = details[attr];
                encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
                variable = encrypted || ':' + variable;
                if (encrypted != null) {
                    hasEncryptedValues = true;
                }
                update += (item === 1 ? '' : ',') + sprintf("%s = %s", attr.toSnakeCase(), variable);
                item += 1;
            }
        }
        return {
            sql: sprintf('UPDATE %s SET %s WHERE id = :id', sqlTable.getTable(), update),
            values: data,
            hasEncrypted: hasEncryptedValues
        };
    };
    static insert (sqlTable, details, newId, encryptFunction) {
        if (!(sqlTable instanceof SqlTable)) {
            throw {location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable'};
        }
        var item = 1;
        var data = {};
        var attr;
        var variable;
        var encrypted;
        var column;
        var columnList = '';
        var variableList = '';
        var hasEncryptedValues = false;
        for (attr in details) {
            if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                column = sqlTable[attr];
                variable = attr + item.toString();
                data[variable] = details[attr];
                columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
                encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
                variable = encrypted || ':' + variable;
                if (encrypted != null) {
                    hasEncryptedValues = true;
                }
                variableList += (item === 1 ? '' : ',') + variable;
                item += 1;
            }
        }
        if (newId) {
            columnList += ', id';
            variableList += ', :id';
            data.id = newId;
        }

        return {
            sql: sprintf('INSERT INTO %s (%s) VALUES (%s)', sqlTable.getTable(), columnList, variableList),
            values: data,
            hasEncrypted: hasEncryptedValues
        };
    };
}
