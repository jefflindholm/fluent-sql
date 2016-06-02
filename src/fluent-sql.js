import './string.js';

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
        const sqlEscape = function (sqlQuery, level) {
            let query;
            if (!sqlQuery || !sqlQuery.sqlEscape || typeof sqlQuery.sqlEscape !== 'function') {
                query = new SqlQuery();
            } else {
                query = sqlQuery;
            }
            return query.sqlEscape(this, level);
        };
        String.prototype.sqlEscape = sqlEscape;
    })();
}

