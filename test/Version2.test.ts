/* global describe it */
import '../src/string.extensions';
import SqlTable from '../src/sql-table';
import SqlQuery, { setDefaultOptions, postgresOptions } from '../src/sql-query';
import { SqlBuilder } from '../src/fluent-sql';
import SqlJoin from '../src/sql-join';

describe('version2 tests', () => {
  const businessColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_name' }, { ColumnName: 'tax_id' }];
  const business = SqlTable.create({ TableName: 'business', Columns: businessColumns } as SqlTable);

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
      const expectedFetch = `SELECT
"business".id as "id",
"business".business_name as "businessName",
"business".tax_id as "taxId"
FROM\nbusiness as "business"
WHERE "business".business_name like ($1)
ORDER BY "business".id ASC
LIMIT 1 OFFSET 0`;

      setDefaultOptions(postgresOptions);
      const query = new SqlQuery()
        .from(business)
        .pageSize(1)
        .select(business.star())
        .where(business.businessName.like('foo'));
      const sql = query.genSql();
      expect(sql.fetchSql).toBe(expectedFetch);
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
      it('should throw execution when created with something not a SqlColumn', () => {
        expect(() => new SqlJoin({} as any)).toThrowErrorMatchingSnapshot();
      });
      it('should throw exception when using a non SqlColumn', () => {
        const join = new SqlJoin(business.businessName);
        expect(() => join.using({} as any)).toThrow({
          location: 'SqlJoin::constructor',
          message: 'trying to join on something not a SqlColumn',
        } as any);
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
      it('should throw an exception if there is no FROM', () => {
        const query = new SqlQuery().select(business.star());
        expect(() => query.genSql()).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
