/* global describe it */
import '../src/string';
import { SqlQuery } from '../src/fluent-sql.js';
import { SqlTable } from '../src/fluent-sql.js';
import { SqlColumn } from '../src/fluent-sql.js';
//import {SqlWhere} from '../src/fluent-sql.js';
//import {SqlOrder} from '../src/fluent-sql.js';
import { SqlJoin } from '../src/fluent-sql.js';
import { SqlBuilder } from '../src/fluent-sql.js';
import { setDefaultOptions, getDefaultOptions, postgresOptions, sqlServerOptions } from '../src/fluent-sql.js';

describe('version2 tests', () => {
  const businessColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_name' }, { ColumnName: 'tax_id' }];
  const business = new SqlTable({ TableName: 'business', columns: businessColumns });

  describe('Postgres options', () => {
    it('should build a query with $# for params for simple sql', () => {
      setDefaultOptions(postgresOptions);
      const query = new SqlQuery()
        .from(business)
        .select(business.star())
        .where(business.businessName.like('foo'));
      const sql = query.genSql();
      expect(sql.fetchSql).toBe(
        'SELECT\n"business".id as "id",\n"business".business_name as "businessName",\n"business".tax_id as "taxId"\nFROM\nbusiness as "business"\nWHERE "business".business_name like ($1)',
      );
      expect(sql.values[0]).toBe('%foo%');
    });
    it('should build a query with $# for params for paging', () => {
      setDefaultOptions(postgresOptions);
      const query = new SqlQuery()
        .from(business)
        .pageSize(1)
        .select(business.star())
        .where(business.businessName.like('foo'));
      const sql = query.genSql();
      expect(sql.fetchSql).toBe(
        'SELECT * FROM (' +
          '\nSELECT *, row_number() OVER (ORDER BY "id") as Paging_RowNumber FROM (' +
          '\nSELECT' +
          '\n"business".id as "id",' +
          '\n"business".business_name as "businessName",' +
          '\n"business".tax_id as "taxId"' +
          '\nFROM\nbusiness as "business"' +
          '\nWHERE "business".business_name like ($1)' +
          '\n) base_query' +
          '\n) as detail_query WHERE Paging_RowNumber BETWEEN 0 AND 1',
      );
      expect(sql.values[0]).toBe('%foo%');
    });
    it('should build a query with LIMIT not TOP', () => {
      setDefaultOptions(postgresOptions);
      const query = new SqlQuery()
        .from(business)
        .top(10)
        .select(business.star())
        .orderBy(business.id)
        .where(business.businessName.like('foo'));
      const sql = query.genSql();
      expect(sql.fetchSql).toBe(
        'SELECT' +
          '\n"business".id as "id",' +
          '\n"business".business_name as "businessName",' +
          '\n"business".tax_id as "taxId"' +
          '\nFROM' +
          '\nbusiness as "business"' +
          '\nWHERE "business".business_name like ($1)' +
          '\nORDER BY "business".id ASC' +
          '\nLIMIT 10',
      );
      expect(sql.values[0]).toBe('%foo%');
    });
    it('should generate update with $#', () => {
      setDefaultOptions(postgresOptions);
      const update = SqlBuilder.update(business, { businessName: 'Test', id: 1 });
      expect(update).toMatchObject({
        sql: 'UPDATE business SET business_name = $2 WHERE id = $1',
        values: [1, 'Test'],
        hasEncrypted: false,
      });
    });
    it('should generate delete with $#', () => {
      const del = SqlBuilder.delete(business, { businessName: 'Test', id: 1 });
      expect(del).toMatchObject({
        sql: 'DELETE FROM business WHERE business_name = $2 AND id = $1',
        values: [1, 'Test'],
        hasEncrypted: false,
      });
    });
    it('should generate insert with $#', () => {
      const insert = SqlBuilder.insert(business, { businessName: 'Test', id: 1 });
      expect(insert).toMatchObject({
        sql: 'INSERT INTO business (business_name) VALUES ($1)',
        values: ['Test'],
        hasEncrypted: false,
      });
    });
    it('should generate insert with $# and new id', () => {
      const insert = SqlBuilder.insert(business, { businessName: 'Test', id: 1 }, 4000);
      expect(insert).toMatchObject({
        sql: 'INSERT INTO business (business_name, id) VALUES ($1, $2)',
        values: ['Test', 4000],
        hasEncrypted: false,
      });
    });
  });

  describe('missing tests', () => {
    describe('missing SqlJoin', () => {
      it('should throw execption when created with something not a SqlColumn', () => {
        expect(() => new SqlJoin({})).toThrowErrorMatchingSnapshot();
      });
      it('should throw execption when using a non SqlColumn', () => {
        const join = new SqlJoin(business.businessName);
        expect(() => join.using({})).toThrowErrorMatchingSnapshot();
      });
    });
    describe('missing SqlColumn', () => {
      it('should allow a starts for a column where', () => {
        setDefaultOptions(postgresOptions);
        const query = new SqlQuery()
          .from(business)
          .select(business.star())
          .where(business.businessName.starts('foo'));
        const sql = query.genSql();
        expect(sql.fetchSql).toBe(
          'SELECT\n"business".id as "id",\n"business".business_name as "businessName",\n"business".tax_id as "taxId"\nFROM\nbusiness as "business"\nWHERE "business".business_name like ($1)',
        );
        expect(sql.values[0]).toBe('foo%');
      });
      it('should allow a ends for a column where', () => {
        setDefaultOptions(postgresOptions);
        const query = new SqlQuery()
          .from(business)
          .select(business.star())
          .where(business.businessName.ends('foo'));
        const sql = query.genSql();
        expect(sql.fetchSql).toBe(
          'SELECT\n"business".id as "id",\n"business".business_name as "businessName",\n"business".tax_id as "taxId"\nFROM\nbusiness as "business"\nWHERE "business".business_name like ($1)',
        );
        expect(sql.values[0]).toBe('%foo');
      });
    });
    describe('missing SqlQuery', () => {
      it('should throw an execption if there is no FROM', () => {
        const query = new SqlQuery().select(business.star());
        expect(() => query.genSql()).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
