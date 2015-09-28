//import expect from 'chai';
//import sprintf from 'sprintf-js';
//import {SqlQuery} from './fluent-sql.js';
//import {SqlTable} from 'fluent-sql.js';
//import {SqlColumn} from '.fluent-sql.js';
//import {SqlWhere} from 'fluent-sql.js';
//import {SqlOrder} from 'fluent-sql.js';
//import {SqlJoin} from 'fluent-sql.js';
//import {SqlBuilder} from 'fluent-sql.js';

const expect = require('chai').expect;
const sprintf = require('sprintf-js').sprintf;
const sql = require('../src/fluent-sql.js');

describe('fluent sql tests', function() {

    var businessColumns = [{ColumnName: 'id'}, {ColumnName: 'business_name'}, {ColumnName: 'tax_id'}];
    var business = new sql.SqlTable({TableName: 'business', columns: businessColumns});
    var business_dba = new sql.SqlTable('business_dba', [{ColumnName: 'id'}, {ColumnName: 'business_id'}, {ColumnName: 'dba'}]);

    function getBusinessCols() {
        var columns = '';
        businessColumns.forEach(function(ele, idx){
            if ( idx !== 0) {
                columns += ',';
            }
            columns += '\n[business].'+ele.ColumnName+' as ['+ele.ColumnName.toCamel() +']';
        });
        return columns;
    }
    describe('sqlescape test', function() {
        it('should return [name] for a string', function() {
            expect('name'.sqlEscape()).to.equal('[name]');
        });
        it('should return escape based on the passed SqlQuery', function(){
            var query =new sql.SqlQuery({sqlStartChar:'+', sqlEndChar:'*+'});
            expect('name'.sqlEscape(query)).to.equal('+name*+');
        });
    });

    describe('SqlColumn tests', function() {

        var col1 = business.id;
        var col2 = business.id.as('businessId');
        var literal = new sql.SqlColumn(null, null, '(select top 1 id from business)').as('foo');

        describe('col1', function() {
            it('should have a qualified name of tableName1.columnName1', function() {
                expect(col1.qualifiedName()).to.equal(business.Alias.sqlEscape()+'.'+business.id.ColumnName);
            });
        });
        describe('col2 compared to col1', function(){
            it('should not be the same instance as col1', function() {
                expect(col2).to.not.equal(col1);
            });
            it('should have an alias different from the column name and col1 should not', function() {
                expect(col2.Alias).to.not.equal(col2.ColumnName.toCamel());
                expect(col1.Alias).to.equal(col1.ColumnName.toCamel());
            })
        });
        describe('literal tests', function() {
            it('should not have a column name', function() {
                expect(literal.ColumnName).to.equal(null);
            });
            it('should have an alias', function() {
                expect(literal.Alias).to.equal('foo');
            })
        });
        it('should throw execption if it is constructed from somrthing other than sql.SqlColumn, SqlTable, or {Literal:<val>}', function() {
            expect(sql.SqlColumn.bind(null, {})).to.throw({ location: 'SqlColumn::constructor', message: 'must construct using a SqlTable'});
        });
        it('should generate SqlWhere clauses from operators, eq, ne, gt, gte, lt, lte, isNull, isNotNull, like, in', function() {
            var col = business.id;
            var where;
            // single args
            ['eq','ne','gt','gte','LT','lte','like'].forEach(function(op) {
                where = col.op(op, 1);
                expect(where instanceof sql.SqlWhere).to.equal(true);
            });
            // no args
            ['isNull', 'isNotNull'].forEach(function(op) {
                where = col.op(op);
                expect(where instanceof sql.SqlWhere).to.equal(true);
            });
            where = col.in(1,2,3,4,5,6);
            expect(where instanceof sql.SqlWhere).to.equal(true);
            expect(where.Value).to.eql([1,2,3,4,5,6]);
            where = col.in([1,2,3,4,5,6]);
            expect(where.Value).to.eql([1,2,3,4,5,6]);
        });
        it('should generate SqlOder clauses, using asc or desc', function() {
            var order;
            var column = business.id;
            order = column.asc();
            expect(order instanceof sql.SqlOrder).to.equal(true);
            expect(order.Direction).to.equal('ASC');
            order = column.desc();
            expect(order instanceof sql.SqlOrder).to.equal(true);
            expect(order.Direction).to.equal('DESC');
            order = column.dir('asc');
            expect(order instanceof sql.SqlOrder).to.equal(true);
            expect(order.Direction).to.equal('asc');
            order = column.direction('desc');
            expect(order instanceof sql.SqlOrder).to.equal(true);
            expect(order.Direction).to.equal('desc');
        });
        it('should have a value paramter if we call using()', function() {
            var column = business.id.using(10);
            expect(column.Values).to.equal(10);
        });
    });

	describe('SqlTable tests', function() {
        var tableName2 = 'bussiness_alias';
        var table1 = business;
        var table2 = table1.as(tableName2.toCamel());

        describe('table1', function() {
            it('should return the tablename and alias should be equal', function() {
                expect(table1.getTable()).to.equal(table1.getAlias());
            });
            it('should have two columns', function() {
                expect(table1.Columns.length).to.equal(businessColumns.length);
            });
            it('should have columns as an array of sql.SqlColumns', function() {
                for(var i = 0; i < table1.Columns.length; i++) {
                    expect(table1.Columns[i] instanceof sql.SqlColumn).to.equal(true);
                }
            })
        });
        describe('table2 compared to table1', function() {
            it('should be different objects', function() {
                expect(table1).to.not.equal(table2);
            });
            it('should have the same table name', function() {
                expect(table1.TableName).to.equal(table2.TableName);
            });
            it('should be different columns, but same names', function() {
                for(var i = 0; i < table2.Columns.length; i++) {
                    expect(table1.Columns[i]).to.not.equal(table2.Columns[i]);
                    expect(table1.Columns[i].ColumnName).to.equal(table2.Columns[i].ColumnName);
                }
            })
        });
        it('should allow an alias and have all columns', function() {
            var b = business.as('b');
            expect(b.id.ColumnName).to.equal(business.id.ColumnName);
            expect(b.id.TableName).to.equal(business.id.TableName);
            expect(b.Columns.length).to.equal(business.Columns.length);
        });
        it('should create a join', function(){
            var b = business.as('b');
            var query = b.join(business_dba.on(business_dba.businessId).using(b.id));
            query.from(b).select(b.id);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [b].id');
        });
        it('should create a left join', function(){
            var b = business.as('b');
            var query = b.left(business_dba.on(business_dba.businessId).using(b.id));
            query.from(b).select(b.id);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nLEFT JOIN business_dba as [business_dba] on [business_dba].business_id = [b].id');
        });
        it('should create a right join', function(){
            var b = business.as('b');
            var query = b.right(business_dba.on(business_dba.businessId).using(b.id));
            query.from(b).select(b.id);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nRIGHT JOIN business_dba as [business_dba] on [business_dba].business_id = [b].id');
        });
        it('should create a where', function(){
            var b = business.as('b');
            var query = b.where(b.id.eq(1000));
            query.from(b).select(b.id);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            var id = Object.keys(cmd.values)[0];
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nWHERE [b].id = :' + id);
        });
        it('should require a sql.SqlColumn when building a join using on', function() {
            expect(business.on.bind(business, {})).to.throw({ location: 'SqlTable::on', message: 'trying to build join on column not from this table'});
        });
	});

    describe('SqlJoin tests', function() {
        it('should throw error if it is not constructed from a sql.SqlColumn', function() {
            expect(sql.SqlJoin.bind(null, {})).to.throw({ location: 'SqlJoin::constructor', message: 'trying to join on something not a sql.SqlColumn'});

        });
        it('should throw error if it is not linked via using with a sql.SqlColumn', function() {
            var join = business.on(business.id);
            expect(join.using.bind(join, {})).to.throw({ location: 'SqlJoin::using', message: 'trying to join on something not a sql.SqlColumn'});

        });
    });

    describe('SqlQuery tests', function() {
        it('should have 2 columns from business when selecting star()', function () {
            var query =new sql.SqlQuery()
                .select(business.star()).from(business);

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            var columns = getBusinessCols();
            expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]');
        });
        it('should have 2 columns from business when selecting [business].id, business.businessName', function () {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business);

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]');
        });
        it('should have 2 columns from business when selecting [[business].id, business.businessName]', function () {
            var query =new sql.SqlQuery()
                .select([business.id, business.businessName]).from(business);

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]');
        });
        it('should have 1 column from business when selecting star() and removing id others', function () {
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName).from(business)
                .removeColumn(business.id)
                .removeColumn(business.taxId);

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].business_name as [businessName]\nFROM\nbusiness as [business]');
        });
        it('should be able to update an alias', function () {
            var query =new sql.SqlQuery()
                .select(business.star()).from(business)
                .updateAlias(business.id, 'bId');

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            var columns = getBusinessCols().replace('\[id\]', '[bId]');
            expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]');
            expect(business.id.Alias).to.equal('id');
        });
        it('should join business_dba on business_id to business on id', function () {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business);
            query.join(business_dba.on(business_dba.businessId).using(business.id));

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [business].id');
        });
        it('should left join business_dba on business_id to business on id', function () {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business);
            query.left(business_dba.on(business_dba.businessId).using(business.id));

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nLEFT JOIN business_dba as [business_dba] on [business_dba].business_id = [business].id');
        });
        it('should right join business_dba on business_id to business on id', function () {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business);
            query.right(business_dba.on(business_dba.businessId).using(business.id));

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nRIGHT JOIN business_dba as [business_dba] on [business_dba].business_id = [business].id');
        });
        it('should handle ordering by columns', function () {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business)
                .orderBy(business.businessName)
                .orderBy(business.id.desc());
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name ASC,[business].id DESC');
        });
        it('should handle litterals in the select', function () {
            var litString = 'select name from business_name where bid = [business].id and foo = :test';
            var literal = new sql.SqlColumn({Literal: litString, Alias: 'name'}).using({test:123});
            var query =new sql.SqlQuery()
                .select(literal).from(business);

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            var name = Object.keys(cmd.values)[0];
            expect(cmd.values[name]).to.equal(123);
            expect(name).to.equal('test');
            expect(cmd.fetchSql.trim()).to.equal(sprintf('SELECT\n(%s) as [name]\nFROM\nbusiness as [business]', litString));
        });
        it('should handle litterals in the select with value', function () {
            var query =new sql.SqlQuery()
                .select({Literal: 'select name from business_name where business_name.bid = [business].id', Alias: 'name'}).from(business);

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n(select name from business_name where business_name.bid = [business].id) as [name]\nFROM\nbusiness as [business]');
        });
        it('should select distinct', function () {
            var query =new sql.SqlQuery()
                .select(business.businessName).from(business).distinct();

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT DISTINCT\n[business].business_name as [businessName]\nFROM\nbusiness as [business]');
        });
    });

    describe('SqlQuery Where clause tests', function() {
        it('should handle a simple where clause', function() {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business)
                .where(business.id.eq(10000));
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            var id = Object.keys(cmd.values)[0];
            expect(cmd.values[id]).to.equal(10000);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].id = :' + id);
        });
        it('should handle a where clause with ands', function() {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business)
                .where(business.id.eq(10000))
                .where(business.businessName.eq('fred'));

            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(2);
            var id = Object.keys(cmd.values)[0];
            var name = Object.keys(cmd.values)[1];
            expect(cmd.values[id]).to.equal(10000);
            expect(cmd.values[name]).to.equal('fred');
            expect(cmd.fetchSql.trim()).to.equal(
                'SELECT\n'+
                '[business].id as [id],\n'+
                '[business].business_name as [businessName]\n'+
                'FROM\n'+
                'business as [business]\n'+
                'WHERE [business].id = :' + id
                + '\nAND [business].business_name = :'+ name);
        });
        it('should handle a where clause using in', function() {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business)
                .where(business.id.in(10000,10001,10002));


            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            var id = Object.keys(cmd.values)[0];
            expect(cmd.values[id]).to.eql([10000,10001,10002]);
            expect(cmd.fetchSql.trim()).to.equal(
                'SELECT\n'+
                '[business].id as [id],\n'+
                '[business].business_name as [businessName]\n'+
                'FROM\n'+
                'business as [business]\n'+
                'WHERE [business].id in (:' + id + ')');
        });
        it('should handle a where clause using between', function() {
            var query =new sql.SqlQuery()
                .select(business.id, business.businessName).from(business)
                .where(business.id.between(10000,10002));


            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(2);
            var id1 = Object.keys(cmd.values)[0];
            var id2 = Object.keys(cmd.values)[1];
            expect(cmd.values[id1]).to.eql(10000);
            expect(cmd.values[id2]).to.eql(10002);
            expect(cmd.fetchSql.trim()).to.equal(
                'SELECT\n'+
                '[business].id as [id],\n'+
                '[business].business_name as [businessName]\n'+
                'FROM\n'+
                'business as [business]\n'+
                'WHERE ([business].id >= :' + id1 +
                    '\nAND [business].id <= :' + id2 +')'
            );
        });
        it('should handle a where clause using is null', function() {
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName).from(business)
                .where(business.id.isNull())
            ;


            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal(
                'SELECT\n'+
                '[business].id as [id],\n'+
                '[business].business_name as [businessName]\n'+
                'FROM\n'+
                'business as [business]\n'+
                'WHERE [business].id IS NULL'
            );
        });
        it('should handle a where clause making it a NOT for the column test', function() {
            var query =new sql.SqlQuery()
                    .select(business.id,business.businessName).from(business)
                    .where(business.id.not().isNull())
                ;


            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal(
                'SELECT\n'+
                '[business].id as [id],\n'+
                '[business].business_name as [businessName]\n'+
                'FROM\n'+
                'business as [business]\n'+
                'WHERE NOT ([business].id IS NULL)'
            );
        });
        it('should handle a where clause using is not null', function() {
            var query =new sql.SqlQuery()
                    .select(business.id,business.businessName).from(business)
                    .where(business.id.isNotNull())
                ;


            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal(
                'SELECT\n'+
                '[business].id as [id],\n'+
                '[business].business_name as [businessName]\n'+
                'FROM\n'+
                'business as [business]\n'+
                'WHERE [business].id IS NOT NULL'
            );
        });
        it('should handle a where clause using a like and add in the %', function(){
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName).from(business)
                .where(business.businessName.like('fred'));
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            var name = Object.keys(cmd.values)[0];
            expect(cmd.values[name]).to.equal('%fred%');
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].business_name like :' + name);
        });
        it('should handle a where clause or\'ed with another where clause', function(){
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName).from(business)
                .where(business.businessName.like('fred')
                .or(business.id.eq(1)))
                .where(business.businessName.like('d'));
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(3);
            var name1 = Object.keys(cmd.values)[0];
            var id = Object.keys(cmd.values)[1];
            var name2 = Object.keys(cmd.values)[2];
            expect(cmd.values[name1]).to.equal('%fred%');
            expect(cmd.values[name2]).to.equal('%d%');
            expect(cmd.values[id]).to.equal(1);
            expect(cmd.fetchSql.trim()).to.equal('SELECT'+
                '\n[business].id as [id],'+
                '\n[business].business_name as [businessName]'+
                '\nFROM'+
                '\nbusiness as [business]'+
                '\nWHERE ([business].business_name like :' + name1 +
                '\nOR [business].id = :' + id + ')' +
                    '\nAND [business].business_name like :' + name2
            );
        });
        it('should handle a where clause linking table columns', function(){
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName).from(business).from(business_dba)
                .where(business.id.eq(business_dba.businessId));
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business],\nbusiness_dba as [business_dba]\nWHERE [business].id = ([business_dba].business_id)');
        });
        // LITERALS with values
        it('should handle a where clause with a literal with values', function(){
            var lit = new sql.SqlColumn({Literal:'SELECT business_id FROM business_dba WHERE dba_name like :foo'}).using({foo:'%foo%'});

            var query =new sql.SqlQuery()
                .select(business.id,business.businessName).from(business)
                .where(business.id.eq(lit));
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(1);
            var id = Object.keys(cmd.values)[0];
            expect(cmd.values[id]).to.equal('%foo%');
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].id = ('+lit.Literal +')');
        });
        // TODO HAVING
        // TODO GROUP BY

        it('should throw an execption trying to and/or at the same level', function(){
            var where;
            var name = business.businessName;
            where = business.id.eq(10);
            where = where.or(name.eq(10));
            expect(where.and.bind(where, name.eq( 11))).to.throw({location: 'SqlWhere::or', message: "cannot add 'or' to 'and' group"});

            where = business.id.eq(10);
            where = where.and(name.eq(10));
            expect(where.or.bind(where, name.eq( 11))).to.throw({location: 'SqlWhere::and', message: "cannot add 'and' to 'or' group"});
        });
    });

    describe('SqlQuery paging tests', function() {
        it('Should default to page size of 50, should default to ordering by the first column in the select list', function() {
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName)
                .from(business)
                .page(1);
            var cmd = query.genSql();
            var sub = 'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]';
            var baseSql = sprintf('SELECT *, row_number() OVER (ORDER BY [id]) as Paging_RowNumber FROM (\n%s\n) base_query', sub);

            expect(cmd.countSql).to.equal(sprintf('SELECT count(*) as RecordCount FROM (\n%s\n) count_tbl', sub));
            expect(cmd.fetchSql).to.equal(sprintf('SELECT * FROM (\n%s\n) as detail_query WHERE Paging_RowNumber BETWEEN 0 AND 50', baseSql));
        });
        it('Should default to page of 1', function() {
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName)
                .from(business)
                .pageSize(10);
            var cmd = query.genSql();
            var sub = 'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]';
            var baseSql = sprintf('SELECT *, row_number() OVER (ORDER BY [id]) as Paging_RowNumber FROM (\n%s\n) base_query', sub);

            expect(cmd.countSql).to.equal(sprintf('SELECT count(*) as RecordCount FROM (\n%s\n) count_tbl', sub));
            expect(cmd.fetchSql).to.equal(sprintf('SELECT * FROM (\n%s\n) as detail_query WHERE Paging_RowNumber BETWEEN 0 AND 10', baseSql));
        });
        it('Should use TOP if top is added', function() {
            var query =new sql.SqlQuery()
                .select(business.id,business.businessName)
                .from(business)
                .top(10);
            var cmd = query.genSql();
            var sub = 'SELECT TOP 10\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]';

            expect(cmd.countSql).to.equal(undefined);
            expect(cmd.fetchSql).to.equal(sub);
        });
        it('Should order by in the query', function(){
            var name = business.businessName.as('name');
            var query =new sql.SqlQuery()
                .select(business.id, name)
                .from(business)
                .orderBy(name)
                .page(1);
            var cmd = query.genSql();
            var sub = 'SELECT\n[business].id as [id],\n[business].business_name as [name]\nFROM\nbusiness as [business]';
            var baseSql = sprintf('SELECT *, row_number() OVER (ORDER BY [name] ASC) as Paging_RowNumber FROM (\n%s\n) base_query', sub);

            expect(cmd.countSql).to.equal(sprintf('SELECT count(*) as RecordCount FROM (\n%s\n) count_tbl', sub));
            expect(cmd.fetchSql).to.equal(sprintf('SELECT * FROM (\n%s\n) as detail_query WHERE Paging_RowNumber BETWEEN 0 AND 50', baseSql));
        });
    });

    describe('SqlQuery order tests', function() {
        it('should use the order when creating a simple sql statement',function() {
            var query =new sql.SqlQuery()
                .from(business)
                .select(business.id,business.businessName)
                .orderBy(business.businessName);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name ASC');
        });
        it('should allow changing sort direction',function() {
            var query =new sql.SqlQuery()
                .from(business)
                .select(business.id,business.businessName)
                .orderBy(business.businessName.desc());
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC');
        });
        it('should allow a list of columns',function() {
            var query =new sql.SqlQuery()
                .from(business)
                .select(business.id,business.businessName)
                .orderBy(business.businessName.desc(), business.id);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC,[business].id ASC');
        });
        it('should allow an array of columns',function() {
            var query =new sql.SqlQuery()
                .from(business)
                .select(business.id,business.businessName)
                .orderBy([business.businessName.desc(), business.id]);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC,[business].id ASC');
        });
        it('should allow an multiple order bys of columns',function() {
            var query =new sql.SqlQuery()
                .from(business)
                .select(business.id,business.businessName)
                .orderBy(business.businessName.desc())
                .orderBy(business.id);
            var cmd = query.genSql();
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            expect(cmd.fetchSql.trim()).to.equal('SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC,[business].id ASC');
        });
    });

    describe('SqlQuery error tests', function() {
        it('should throw if from is not a SqlTable', function() {
            var query =new sql.SqlQuery();
            expect(query.from.bind(query, {})).to.throw({ location: 'SqlQuery::from', message: 'from clause must be a SqlTable'} );
        });
        it('should throw if join is not a SqlJoin', function() {
            var query =new sql.SqlQuery();
            expect(query.join.bind(query, {})).to.throw({ location: 'SqlQuery::join', message: 'clause is not a SqlJoin'} );
        });
        it('should throw exception if it is orderby with something other than SqlOrder or sql.SqlColumn', function() {
            var query =new sql.SqlQuery();
            expect(query.orderBy.bind(query, {})).to.throw( { location: "SqlOrder::constructor", message: "did not pass a sql.SqlColumn object"});
        });
    });

    describe('SqlBuilder tests', function() {
        it('should build an insert statement given a table and an object', function(){
            var data = { id: 1234, businessName: 'some guy\'s cars'};
            var cmd = sql.SqlBuilder.insert(business, data, 4000);

            expect(Object.keys(cmd.values).length).to.equal(2);
            var name = Object.keys(cmd.values)[0];
            var id = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name, id) VALUES (:%s, :%s)', name, id));
        });
        it('should build an insert statement given a table and an object ignoring columns not in the table', function(){
            var data = { id: 1234, businessName: 'some guy\'s cars', frank: 123};
            var cmd = sql.SqlBuilder.insert(business, data, 4000);

            expect(Object.keys(cmd.values).length).to.equal(2);
            var name = Object.keys(cmd.values)[0];
            var id = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name, id) VALUES (:%s, :%s)', name, id));
        });
        it('should build an update statement given a table and an object', function(){
            var data = { id: 1234, businessName: 'some guy\'s cars'};
            var cmd = sql.SqlBuilder.update(business, data);

            expect(Object.keys(cmd.values).length).to.equal(2);
            var id = Object.keys(cmd.values)[0];
            var name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = :%s WHERE id = :%s', name, id));
        });
        it('should build an update statement given a table and an object, ignoring extra columns', function(){
            var data = { id: 1234, businessName: 'some guy\'s cars', frank: 123};
            var cmd = sql.SqlBuilder.update(business, data);

            expect(Object.keys(cmd.values).length).to.equal(2);
            var id = Object.keys(cmd.values)[0];
            var name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = :%s WHERE id = :%s', name, id));
        });
        it('should throw an exception if the first argument is not a SqlTable to insert and update', function() {
            expect(sql.SqlBuilder.update.bind(sql.SqlBuilder, {})).to.throw( { location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable'} );
            expect(sql.SqlBuilder.insert.bind(sql.SqlBuilder, {})).to.throw( { location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable'} );

        });
        it('should encrypt columns as needed for update', function(){
            var decrypt = function(column, varName) {
                if ( !(column instanceof sql.SqlColumn)) {
                    throw { msg: 'not a sql.SqlColumn'};
                }
                if ( column.ColumnName !== 'tax_id' ) {
                    return null;
                }
                return sprintf('ENCRYPT(:%s)', varName);
            };
            var data = { id: 1234, businessName: 'some guy\'s cars', taxId: 12345};
            var cmd = sql.SqlBuilder.update(business, data, decrypt);
            expect(Object.keys(cmd.values).length).to.equal(3);
            var id = Object.keys(cmd.values)[0];
            var name = Object.keys(cmd.values)[1];
            var tax = Object.keys(cmd.values)[2];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.values[tax]).to.equal(12345);
            expect(cmd.hasEncrypted).to.equal(true);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = :%s,tax_id = ENCRYPT(:%s) WHERE id = :%s', name, tax, id));

        });
        it('should encrypt columns as needed for insert', function(){
            var decrypt = function(column, varName) {
                if ( !(column instanceof sql.SqlColumn)) {
                    throw { msg: 'not a sql.SqlColumn'};
                }
                if ( column.ColumnName !== 'tax_id' ) {
                    return null;
                }
                return sprintf('ENCRYPT(:%s)', varName);
            };
            var data = { id: 1234, businessName: 'some guy\'s cars', taxId: 12345};
            var cmd = sql.SqlBuilder.insert(business, data, 4000, decrypt);
            expect(Object.keys(cmd.values).length).to.equal(3);
            var id = Object.keys(cmd.values)[2];
            var name = Object.keys(cmd.values)[0];
            var tax = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.values[tax]).to.equal(12345);
            expect(cmd.hasEncrypted).to.equal(true);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name,tax_id, id) VALUES (:%s,ENCRYPT(:%s), :%s)', name, tax, id));

        })
    });

    describe('SqlQuery extras', function() {
        it('should take a masking function and call it for every column', function() {
            var masking = function(column, literal) {
                if ( !(column instanceof sql.SqlColumn)) {
                    throw { msg: 'not a sql.SqlColumn'};
                }
                return sprintf('RIGHT(%s, 4)', literal);
            };
            var query =new sql.SqlQuery()
                .select(business.star())
                .from(business);
            var cmd = query.genSql(null, masking);
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            var columns = '';
            businessColumns.forEach(function(ele, idx){
                if ( idx !== 0) {
                    columns += ',';
                }
                columns += sprintf('\nRIGHT([business].%s, 4) as [%s]', ele.ColumnName, ele.ColumnName.toCamel());
            });
            expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]');
        });
        it('should take a decrypting function and call it for every column', function() {
            var decrypt = function(column, qualified) {
                if ( !(column instanceof sql.SqlColumn)) {
                    throw { msg: 'not a sql.SqlColumn'};
                }
                if (qualified) {
                    return sprintf('DECRYPT(%s)', column.qualifiedName());
                } else {
                    return sprintf('DECRYPT(%s)', column.ColumnName);
                }
            };
            var query =new sql.SqlQuery()
                .select(business.star())
                .from(business);
            var cmd = query.genSql(decrypt);
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            var columns = '';
            businessColumns.forEach(function(ele, idx){
                if ( idx !== 0) {
                    columns += ',';
                }
                columns += sprintf('\nDECRYPT([business].%s) as [%s]', ele.ColumnName, ele.ColumnName.toCamel());
            });
            expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]');
        });
        it('should take both a decrypting function and masking function and call them for every column', function() {
            var decrypt = function(column, qualified) {
                if ( !(column instanceof sql.SqlColumn)) {
                    throw { msg: 'not a sql.SqlColumn'};
                }
                if ( column.ColumnName !== 'tax_id' ) {
                    return null;
                }
                if (qualified) {
                    return sprintf('DECRYPT(%s)', column.qualifiedName());
                } else {
                    return sprintf('DECRYPT(%s)', column.ColumnName);
                }
            };
            var masking = function(column, literal) {
                if ( !(column instanceof sql.SqlColumn)) {
                    throw { msg: 'not a sql.SqlColumn'};
                }
                if ( column.ColumnName === 'id' ) {
                    return null;
                }
                return sprintf('RIGHT(%s, 4)', literal);
            };
            var query =new sql.SqlQuery()
                .select(business.star())
                .from(business);
            var cmd = query.genSql(decrypt, masking);
            expect(cmd.countSql).to.equal(undefined);
            expect(Object.keys(cmd.values).length).to.equal(0);
            var columns = '';
            businessColumns.forEach(function(ele, idx){
                if ( idx !== 0) {
                    columns += ',';
                }
                var name;
                if ( ele.ColumnName === 'id' ) {
                    name = "\n[business].id as [id]";
                } else if ( ele.ColumnName === 'tax_id' ) {
                    name = sprintf('\nRIGHT(DECRYPT([business].%s), 4) as [%s]', ele.ColumnName, ele.ColumnName.toCamel());
                } else {
                    name = sprintf('\nRIGHT([business].%s, 4) as [%s]', ele.ColumnName, ele.ColumnName.toCamel());
                }
                columns += name;
            });
            expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]');
        });
        describe('SqlQuery applyOrder', function() {
            it('should allow you to apply an order string to the query', function() {
                var query =new sql.SqlQuery()
                    .select(business.star()).from(business);

                var order = 'id, name DESC';
                query.applyOrder(business, order, {name: [business.businessName]});
                var cmd = query.genSql();
                expect(cmd.countSql).to.equal(undefined);
                expect(Object.keys(cmd.values).length).to.equal(0);
                var columns = getBusinessCols();
                expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]\nORDER BY [business].id ASC,[business].business_name DESC');
            });
            it('should allow you to apply an order string to the query with multiple tables', function() {
                var query =new sql.SqlQuery()
                    .select(business.star()).from(business)
                    .join(business_dba.on(business_dba.businessId).using(business.id));

                var order = 'id, name DESC, business_dba.id';
                query.applyOrder(business, order, {name: [business.businessName]});
                var cmd = query.genSql();
                expect(cmd.countSql).to.equal(undefined);
                expect(Object.keys(cmd.values).length).to.equal(0);
                var columns = getBusinessCols();
                expect(cmd.fetchSql.trim()).to.equal('SELECT' + columns + '\nFROM\nbusiness as [business]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [business].id\nORDER BY [business].id ASC,[business].business_name DESC,[business_dba].id ASC');
            });
            it('should throw an exception if the first argument is not a SqlTable to insert and update', function() {
                var query =new sql.SqlQuery()
                    .select(business.star()).from(business)
                    .join(business_dba.on(business_dba.businessId).using(business.id));

                var order = 'id, name DESC, business_dba.id';
                expect(query.applyOrder.bind(query, {}, order, null)).to.throw( { location: 'SqlQuery::applyOrder', message: 'defaultSqlTable is not an instance of SqlTable'} );

            });
        });
    });

    describe('SqlTable tests', function() {
        it('should construct correctly from a name and array of columns', function(){
            function legalColumns() {
                var arr = [
                    {name: 'business_type'},
                    {
                        name: 'business_type_formatted',
                        Literal: 'REPLACE(COALESCE(business_type, \'Unknown Business\'), \'_\', \' \')'
                    },
                    {name: 'id'}
                ];
                arr.forEach(function (a) {
                    a.Alias = a.name.toCamel();
                });
                return arr;
            }
            var table =new sql.SqlTable({TableName: 'document_templates', Columns: legalColumns()});
            expect(table.Columns.length).to.equal(3);
            expect(table.businessType.ColumnName).to.equal('business_type');
            expect(table.businessTypeFormatted.Literal).to.equal('REPLACE(COALESCE(business_type, \'Unknown Business\'), \'_\', \' \')');

        });
    });

});
