//import expect from 'chai';
//import sprintf from 'sprintf-js';
/* global describe it */
import '../src/string';
import {SqlQuery} from '../src/fluent-sql.js';
import {SqlTable} from '../src/fluent-sql.js';
import {SqlColumn} from '../src/fluent-sql.js';
//import {SqlWhere} from '../src/fluent-sql.js';
//import {SqlOrder} from '../src/fluent-sql.js';
import {SqlJoin} from '../src/fluent-sql.js';
import {SqlBuilder} from '../src/fluent-sql.js';
import {setDefaultOptions, getDefaultOptions} from '../src/fluent-sql.js';

const expect = require('chai').expect;
const sprintf = require('sprintf-js').sprintf;
//const sql = require('../src/fluent-sql.js');

describe('fluent sql tests', () => {

    const businessColumns = [{ColumnName: 'id'}, {ColumnName: 'business_name'}, {ColumnName: 'tax_id'}];
    const business = new SqlTable({TableName: 'business', columns: businessColumns});

    describe('default tests', () => {
        it('should override all the settings for default options', () => {
            const oldOptions = Object.assign({}, getDefaultOptions());
            const newOptions = Object.assign({}, getDefaultOptions(), {
                sqlStartChar: '`',
                sqlEndChar: '`',
            });
            setDefaultOptions(newOptions);
            expect(newOptions).to.deep.equal(getDefaultOptions());
            setDefaultOptions(oldOptions);
        });
    });

    describe('sqlescape test', () => {
        it('should return [name] for a string', () => {
            expect('name'.sqlEscape()).to.equal('[name]');
        });
        it('should return escape based on the passed SqlQuery', () => {
            const query = new SqlQuery({sqlStartChar:'+', sqlEndChar:'*+'});
            expect(query.sqlEscape('name')).to.equal('+name*+');
            expect('name'.sqlEscape(query)).to.equal('+name*+');
        });
    });

    describe('SqlJoin tests', () => {
        it('should throw error if it is not constructed from a SqlColumn', () => {
            expect(SqlJoin.bind(null, {})).to.throw({ location: 'SqlJoin::constructor', message: 'trying to join on something not a SqlColumn'});

        });
        it('should throw error if it is not linked via using with a SqlColumn', () => {
            const join = business.on(business.id);
            expect(join.using.bind(join, {})).to.throw({ location: 'SqlJoin::using', message: 'trying to join on something not a SqlColumn'});

        });
    });

    describe('SqlBuilder tests', () => {
        it('should build an insert statement given a table and an object', () => {
            const data = { id: 1234, businessName: 'some guy\'s cars'};
            const cmd = SqlBuilder.insert(business, data, 4000);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const name = Object.keys(cmd.values)[0];
            const id = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name, id) VALUES (:%s, :%s)', name, id));
        });
        it('should change the : to $ with overrides on insert', () => {
            const oldOptions = getDefaultOptions();
            setDefaultOptions({
                namedValueMarker: '$',
            });
            const data = { id: 1234, businessName: 'some guy\'s cars'};
            const cmd = SqlBuilder.insert(business, data, 4000);
            setDefaultOptions(oldOptions);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const name = Object.keys(cmd.values)[0];
            const id = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name, id) VALUES ($%s, $%s)', name, id));
        });
        it('should build an insert statement given a table and an object ignoring columns not in the table', () => {
            const data = { id: 1234, businessName: 'some guy\'s cars', frank: 123};
            const cmd = SqlBuilder.insert(business, data, 4000);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const name = Object.keys(cmd.values)[0];
            const id = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name, id) VALUES (:%s, :%s)', name, id));
        });
        it('should build an update statement given a table and an object', () => {
            const data = { id: 1234, businessName: 'some guy\'s cars'};
            const cmd = SqlBuilder.update(business, data);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const id = Object.keys(cmd.values)[0];
            const name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = :%s WHERE id = :%s', name, id));
        });
        it('should change the : to $ with overrides on update', () => {
            const oldOptions = getDefaultOptions();
            setDefaultOptions({
                namedValueMarker: '$',
            });
            const data = { id: 1234, businessName: 'some guy\'s cars'};
            const cmd = SqlBuilder.update(business, data);
            setDefaultOptions(oldOptions);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const id = Object.keys(cmd.values)[0];
            const name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = $%s WHERE id = $%s', name, id));
        });
        it('should build an delete statement given a table and an object', () => {
            const data = { id: 1234, businessName: 'some guy\'s cars'};
            const cmd = SqlBuilder.delete(business, data);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const id = Object.keys(cmd.values)[0];
            const name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('DELETE FROM business WHERE business_name = :%s AND id = :%s', name, id));
        });
        it('should change the : to $ with overrides on delete', () => {
            const oldOptions = getDefaultOptions();
            setDefaultOptions({
                namedValueMarker: '$',
            });
            const data = { id: 1234, businessName: 'some guy\'s cars'};
            const cmd = SqlBuilder.delete(business, data);
            setDefaultOptions(oldOptions);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const id = Object.keys(cmd.values)[0];
            const name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('DELETE FROM business WHERE business_name = $%s AND id = $%s', name, id));
        });

        it('should be able to delete with just the id', () => {
            const oldOptions = getDefaultOptions();
            setDefaultOptions({
                namedValueMarker: '$',
            });
            const data = { id: 1234};
            const cmd = SqlBuilder.delete(business, data);
            setDefaultOptions(oldOptions);

            expect(Object.keys(cmd.values).length).to.equal(1);
            const id = Object.keys(cmd.values)[0];
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('DELETE FROM business WHERE id = $%s', id));
        });

        it('should build an update statement given a table and an object, ignoring extra columns', () => {
            const data = { id: 1234, businessName: 'some guy\'s cars', frank: 123};
            const cmd = SqlBuilder.update(business, data);

            expect(Object.keys(cmd.values).length).to.equal(2);
            const id = Object.keys(cmd.values)[0];
            const name = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = :%s WHERE id = :%s', name, id));
        });
        it('should throw an exception if the first argument is not a SqlTable to insert and update', () => {
            expect(SqlBuilder.update.bind(SqlBuilder, {})).to.throw( { location: 'SqlBuilder::update', message: 'sqlTable is not an instance of SqlTable'} );
            expect(SqlBuilder.insert.bind(SqlBuilder, {})).to.throw( { location: 'SqlBuilder::insert', message: 'sqlTable is not an instance of SqlTable'} );

        });
        it('should encrypt columns as needed for update', () => {
            const decrypt = function(column, varName) {
                if ( !(column instanceof SqlColumn)) {
                    throw { msg: 'not a SqlColumn'};
                }
                if ( column.ColumnName !== 'tax_id' ) {
                    return null;
                }
                return sprintf('ENCRYPT(:%s)', varName);
            };
            const data = { id: 1234, businessName: 'some guy\'s cars', taxId: 12345};
            const cmd = SqlBuilder.update(business, data, decrypt);
            expect(Object.keys(cmd.values).length).to.equal(3);
            const id = Object.keys(cmd.values)[0];
            const name = Object.keys(cmd.values)[1];
            const tax = Object.keys(cmd.values)[2];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(1234);
            expect(cmd.values[tax]).to.equal(12345);
            expect(cmd.hasEncrypted).to.equal(true);
            expect(cmd.sql).to.equal(sprintf('UPDATE business SET business_name = :%s,tax_id = ENCRYPT(:%s) WHERE id = :%s', name, tax, id));

        });
        it('should encrypt columns as needed for insert', () => {
            const decrypt = function(column, varName) {
                if ( !(column instanceof SqlColumn)) {
                    throw { msg: 'not a SqlColumn'};
                }
                if ( column.ColumnName !== 'tax_id' ) {
                    return null;
                }
                return sprintf('ENCRYPT(:%s)', varName);
            };
            const data = { id: 1234, businessName: 'some guy\'s cars', taxId: 12345};
            const cmd = SqlBuilder.insert(business, data, 4000, decrypt);
            expect(Object.keys(cmd.values).length).to.equal(3);
            const id = Object.keys(cmd.values)[2];
            const name = Object.keys(cmd.values)[0];
            const tax = Object.keys(cmd.values)[1];
            expect(cmd.values[name]).to.equal('some guy\'s cars');
            expect(cmd.values[id]).to.equal(4000);
            expect(cmd.values[tax]).to.equal(12345);
            expect(cmd.hasEncrypted).to.equal(true);
            expect(cmd.sql).to.equal(sprintf('INSERT INTO business (business_name,tax_id, id) VALUES (:%s,ENCRYPT(:%s), :%s)', name, tax, id));

        })
    });

});
