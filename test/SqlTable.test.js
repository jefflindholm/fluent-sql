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

const expect = require('chai').expect;
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

    describe('SqlTable tests', () => {
        const tableName2 = 'bussiness_alias';
        const table1 = business;
        const table2 = table1.as(tableName2.toCamel());

        describe('table1', () => {
            it('should return the tablename and alias should be equal', () => {
                expect(table1.getTable()).to.equal(table1.getAlias());
            });
            it('should have two columns', () => {
                expect(table1.Columns.length).to.equal(businessColumns.length);
            });
            it('should have columns as an array of SqlColumns', () => {
                for (let i = 0; i < table1.Columns.length; i++) {
                    expect(table1.Columns[i] instanceof SqlColumn).to.equal(true);
                }
            })
        });
        describe('table2 compared to table1', () => {
            it('should be different objects', () => {
                expect(table1).to.not.equal(table2);
            });
            it('should have the same table name', () => {
                expect(table1.TableName).to.equal(table2.TableName);
            });
            it('should be different columns, but same names', () => {
                for (let i = 0; i < table2.Columns.length; i++) {
                    expect(table1.Columns[i]).to.not.equal(table2.Columns[i]);
                    expect(table1.Columns[i].ColumnName).to.equal(table2.Columns[i].ColumnName);
                }
            })
        });
        it('should allow an alias and have all columns', () => {
            const b = business.as('b');
            expect(b.id.ColumnName).to.equal(business.id.ColumnName);
            expect(b.id.TableName).to.equal(business.id.TableName);
            expect(b.Columns.length).to.equal(business.Columns.length);
        });
        it('should create a join', () => {
            const b = business.as('b');
            const query = b.join(business_dba.on(business_dba.businessId).using(b.id));
            query.from(b).select(b.id);
            const cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [b].id');
        });
        it('should create a left join', () => {
            const b = business.as('b');
            const query = b.left(business_dba.on(business_dba.businessId).using(b.id));
            query.from(b).select(b.id);
            const cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nLEFT JOIN business_dba as [business_dba] on [business_dba].business_id = [b].id');
        });
        it('should create a right join', () => {
            const b = business.as('b');
            const query = b.right(business_dba.on(business_dba.businessId).using(b.id));
            query.from(b).select(b.id);
            const cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nRIGHT JOIN business_dba as [business_dba] on [business_dba].business_id = [b].id');
        });
        it('should create a where', () => {
            const b = business.as('b');
            const query = b.where(b.id.eq(1000));
            query.from(b).select(b.id);
            const cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            const id = Object.keys(cmd.values)[0];
            expect(cmd.fetchSql.trim()).to.equal(`SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nWHERE [b].id = (:${id})`);
        });
        it('should require a SqlColumn when building a join using on', () => {
            expect(business.on.bind(business, {})).to.throw({
                location: 'SqlTable::on',
                message: 'trying to build join on column not from this table'
            });
        });
    });

    describe('SqlTable tests second round', () => {
        it('should construct correctly from a name and array of columns', () => {
            function legalColumns() {
                const arr = [
                    {name: 'business_type'},
                    {
                        name: 'business_type_formatted',
                        Literal: 'REPLACE(COALESCE(business_type, \'Unknown Business\'), \'_\', \' \')',
                    },
                    {name: 'id'},
                ];
                arr.forEach((a) => {
                    a.Alias = a.name.toCamel(); // eslint-disable-line no-param-reassign
                });
                return arr;
            }
            const table = new SqlTable({
                TableName: 'document_templates',
                Columns: legalColumns(),
            });
            expect(table.Columns.length).to.equal(3);
            expect(table.businessType.ColumnName).to.equal('business_type');
            expect(table.businessTypeFormatted.Literal).to.equal('REPLACE(COALESCE(business_type, \'Unknown Business\'), \'_\', \' \')');

        });
    });


});