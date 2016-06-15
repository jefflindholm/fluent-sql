'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./string.js');

var _sqlTable = require('./sql-table');

var _sqlTable2 = _interopRequireDefault(_sqlTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SqlBuilder = function () {
    /*
     * @depreicated
     */

    function SqlBuilder() {
        _classCallCheck(this, SqlBuilder);

        console.log('SqlBuilder object is deprecated, please use static SqlBuilder methods directly');
    }
    /*
     * @depreicated
     */


    _createClass(SqlBuilder, [{
        key: 'update',
        value: function update(sqlTable, details, encryptFunction) {
            console.log('update from a SqlBuilder object is deprecated, please use static SqlBuilder.update');
            return SqlBuilder.update(sqlTable, details, encryptFunction);
        }
        /*
         * @depreicated
         */

    }, {
        key: 'insert',
        value: function insert(sqlTable, details, newId, encryptFunction) {
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

    }], [{
        key: 'update',
        value: function update(sqlTable, details, encryptFunction) {
            if (!(sqlTable instanceof _sqlTable2.default)) {
                throw { location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable' };
            }
            var item = 1;
            var data = { id: details.id };
            var update = '';
            var attr = void 0;
            var variable = void 0;
            var encrypted = void 0;
            var column = void 0;
            var hasEncryptedValues = false;
            for (attr in details) {
                if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                    column = sqlTable[attr];
                    variable = attr + item.toString();
                    data[variable] = details[attr];
                    encrypted = encryptFunction ? encryptFunction(column, variable) : null;
                    variable = encrypted || ':' + variable;
                    if (encrypted != null) {
                        hasEncryptedValues = true;
                    }
                    update += '' + (item === 1 ? '' : ',') + attr.toSnakeCase() + ' = ' + variable;
                    item += 1;
                }
            }
            return {
                sql: 'UPDATE ' + sqlTable.getTable() + ' SET ' + update + ' WHERE id = :id',
                values: data,
                hasEncrypted: hasEncryptedValues
            };
        }
    }, {
        key: 'insert',
        value: function insert(sqlTable, details, newId, encryptFunction) {
            if (!(sqlTable instanceof _sqlTable2.default)) {
                throw { location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable' };
            }
            var item = 1;
            var data = {};
            var variable = void 0;
            var encrypted = void 0;
            var column = void 0;
            var columnList = '';
            var variableList = '';
            var hasEncryptedValues = false;
            for (var attr in details) {
                if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
                    column = sqlTable[attr];
                    variable = attr + item.toString();
                    data[variable] = details[attr];
                    columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
                    encrypted = encryptFunction ? encryptFunction(column, variable) : null;
                    variable = encrypted || ':' + variable;
                    if (encrypted != null) {
                        hasEncryptedValues = true;
                    }
                    variableList += '' + (item === 1 ? '' : ',') + variable;
                    item += 1;
                }
            }
            if (newId) {
                columnList += ', id';
                variableList += ', :id';
                data.id = newId;
            }

            return {
                sql: 'INSERT INTO ' + sqlTable.getTable() + ' (' + columnList + ') VALUES (' + variableList + ')',
                values: data,
                hasEncrypted: hasEncryptedValues
            };
        }
    }]);

    return SqlBuilder;
}();

exports.default = SqlBuilder;