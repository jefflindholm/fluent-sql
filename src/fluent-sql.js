"use strict";

import './string.js';
import sliced from 'sliced';
import util from 'util';
import {sprintf} from 'sprintf-js';

import SqlQuery from './sql-query';

export { default as  SqlBuilder } from './sql-builder';
export { default as  SqlColumn } from './sql-column';
export { default as  SqlJoin } from './sql-join';
export { default as  SqlOrder } from './sql-order';
export { default as  SqlTable } from './sql-table';
export { default as  SqlWhere } from './sql-where';
export { default as  SqlQuery } from './sql-query';

if (!String.prototype.sqlEscape) {
    (function () {
        'use strict';
        var sqlEscape = function (sqlQuery, level) {

            if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== "function") {
                sqlQuery = new SqlQuery();
            }
            return sqlQuery.sqlEscape(this, level);
        }
        String.prototype.sqlEscape = sqlEscape;
    })();
}
