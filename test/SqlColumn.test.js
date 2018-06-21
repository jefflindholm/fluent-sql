//import expect from 'chai';
//import sprintf from 'sprintf-js';
/* global describe it */
import '../src/string';
import {SqlQuery} from '../src/fluent-sql.js';
import {SqlTable} from '../src/fluent-sql.js';
import {SqlColumn} from '../src/fluent-sql.js';
import {SqlWhere} from '../src/fluent-sql.js';
import {SqlOrder} from '../src/fluent-sql.js';
import {SqlJoin} from '../src/fluent-sql.js';
import {SqlBuilder} from '../src/fluent-sql.js';
import {setDefaultOptions, getDefaultOptions} from '../src/fluent-sql.js';

const sprintf = require('sprintf-js').sprintf;
//const sql = require('../src/fluent-sql.js');

describe('fluent sql tests', () => {

    const businessColumns = [{ColumnName: 'id'}, {ColumnName: 'business_name'}, {ColumnName: 'tax_id'}];
    const business = new SqlTable({TableName: 'business', columns: businessColumns});
    const business_dba = new SqlTable('business_dba', [{ColumnName: 'id'}, {ColumnName: 'business_id'}, {ColumnName: 'dba'}]);
    const financeColumns = [{name: 'id'}, {name: 'business_id'}, {name: 'balance'}, {name: 'finance_type'}];
    const finance = new SqlTable({name: 'finance', columns: financeColumns});

    function getBusinessCols() {
        let columns = '';
        businessColumns.forEach((ele, idx) => {
            if (idx !== 0) {
                columns += ',';
            }
            //columns += '\n[business].'+ele.ColumnName+' as ['+ele.ColumnName.toCamel() +']';
            columns += `\n[business].${ele.ColumnName} as [${ele.ColumnName.toCamel()}]`;
        });
        return columns;
    }

    describe('SqlColumn tests', () => {

        const col1 = business.id;
        const col2 = business.id.as('businessId');
        const literal = new SqlColumn(null, null, '(select top 1 id from business)').as('foo');

        describe('col1', () => {
            it('should have a qualified name of tableName1.columnName1', () => {
                expect(col1.qualifiedName()).toBe(`${business.Alias.sqlEscape()}.${business.id.ColumnName}`);
            });
        });
        describe('col2 compared to col1', () => {
            it('should not be the same instance as col1', () => {
                expect(col2).not.toBe(col1);
            });
            it('should have an alias different from the column name and col1 should not', () => {
                expect(col2.Alias).not.toBe(col2.ColumnName.toCamel());
                expect(col1.Alias).toBe(col1.ColumnName.toCamel());
            })
        });
        describe('literal tests', () => {
            it('should not have a column name', () => {
                expect(literal.ColumnName).toBe(null);
            });
            it('should have an alias', () => {
                expect(literal.Alias).toBe('foo');
            })
        });
        it('should throw execption if it is constructed from somrthing other than SqlColumn, SqlTable, or {Literal:<val>}', () => {
            expect(() => new SqlColumn({})).toThrow({
                location: 'SqlColumn::constructor',
                message: 'must construct using a SqlTable'
            });
        });
        it('should generate SqlWhere clauses from operators, eq, ne, gt, gte, lt, lte, isNull, isNotNull, like, in', () => {
            const col = business.id;
            let where;
            // single args
            ['eq', 'ne', 'gt', 'gte', 'LT', 'lte', 'like'].forEach((op) => {
                where = col.op(op, 1);
                expect(where instanceof SqlWhere).toBe(true);
            });
            // no args
            ['isNull', 'isNotNull'].forEach((op) => {
                where = col.op(op);
                expect(where instanceof SqlWhere).toBe(true);
            });
            where = col.in(1, 2, 3, 4, 5, 6);
            expect(where instanceof SqlWhere).toBe(true);
            expect(where.Value).toMatchObject([1, 2, 3, 4, 5, 6]);
            where = col.in([1, 2, 3, 4, 5, 6]);
            expect(where.Value).toMatchObject([1, 2, 3, 4, 5, 6]);
        });
        it('should generate SqlOder clauses, using asc or desc', () => {
            let order;
            const column = business.id;
            order = column.asc();
            expect(order instanceof SqlOrder).toBe(true);
            expect(order.Direction).toBe('ASC');
            order = column.desc();
            expect(order instanceof SqlOrder).toBe(true);
            expect(order.Direction).toBe('DESC');
            order = column.dir('asc');
            expect(order instanceof SqlOrder).toBe(true);
            expect(order.Direction).toBe('asc');
            order = column.direction('desc');
            expect(order instanceof SqlOrder).toBe(true);
            expect(order.Direction).toBe('desc');
        });
        it('should have a value paramter if we call using()', () => {
            const column = business.id.using(10);
            expect(column.Values).toBe(10);
        });
    });

});
