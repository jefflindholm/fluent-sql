/* global describe it */
import circularJSON from 'flatted';
import '../src/string';
import { SqlQuery } from '../src/fluent-sql';
import { SqlTable } from '../src/fluent-sql';
import { SqlColumn } from '../src/fluent-sql';
import { SqlWhere } from '../src/fluent-sql';
import { SqlOrder } from '../src/fluent-sql';
import { SqlJoin } from '../src/fluent-sql';
import { SqlBuilder } from '../src/fluent-sql';
import { SqlError } from '../src/fluent-sql';
import { setDefaultOptions, getDefaultOptions, setPostgres, setSqlServer } from '../src/fluent-sql';

describe('fluent sql tests', () => {
  const businessColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_name' }, { ColumnName: 'tax_id' }];
  const business = new SqlTable({ TableName: 'business', columns: businessColumns });
  const business_dba = new SqlTable('business_dba', [
    { ColumnName: 'id' },
    { ColumnName: 'business_id' },
    { ColumnName: 'dba' },
  ]);
  const financeColumns = [{ name: 'id' }, { name: 'business_id' }, { name: 'balance' }, { name: 'finance_type' }];
  const finance = new SqlTable({ name: 'finance', columns: financeColumns });

  function getBusinessCols(tableName = 'business') {
    let columns = '';
    businessColumns.forEach((ele, idx) => {
      if (idx !== 0) {
        columns += ',';
      }
      columns += `\n[${tableName}].${ele.ColumnName} as [${ele.ColumnName.toCamel()}]`;
    });
    return columns;
  }

  describe('SqlQuery tests', () => {
    it('should have 2 columns from business with a schema when selecting star()', () => {
      let ipBusiness = business.as('b');
      // console.log(circularJSON.stringify(ipBusiness, null, 2))
      ipBusiness.Schema = 'ip';
      const query = new SqlQuery().select(ipBusiness.star()).from(ipBusiness);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      const columns = getBusinessCols('b');
      expect(cmd.fetchSql.trim()).toBe(`SELECT${columns}\nFROM\nip.business as [b]`);
    });

    it('should have 2 columns from business when selecting star()', () => {
      const query = new SqlQuery().select(business.star()).from(business);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      const columns = getBusinessCols();
      expect(cmd.fetchSql.trim()).toBe(`SELECT${columns}\nFROM\nbusiness as [business]`);
    });

    it('should have 2 columns from business when selecting [business].id, business.businessName', () => {
      const query = new SqlQuery().select(business.id, business.businessName).from(business);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]',
      );
    });

    it('should have 2 columns from business when selecting [[business].id, business.businessName]', () => {
      const query = new SqlQuery().select([business.id, business.businessName]).from(business);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]',
      );
    });

    it('should have 1 column from business when selecting star() and removing id others', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .removeColumn(business.id)
        .removeColumn(business.taxId);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe('SELECT\n[business].business_name as [businessName]\nFROM\nbusiness as [business]');
    });

    it('should be able to update an alias', () => {
      const query = new SqlQuery()
        .select(business.star())
        .from(business)
        .updateAlias(business.id, 'bId');

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      const columns = getBusinessCols().replace('[id]', '[bId]');
      expect(cmd.fetchSql.trim()).toBe(`SELECT${columns}\nFROM\nbusiness as [business]`);
      expect(business.id.Alias).toBe('id');
    });

    it('should join business_dba on business_id to business on id', () => {
      const query = new SqlQuery().select(business.id, business.businessName).from(business);
      query.join(business_dba.on(business_dba.businessId).using(business.id));

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [business].id',
      );
    });

    it('should left join business_dba on business_id to business on id', () => {
      const query = new SqlQuery().select(business.id, business.businessName).from(business);
      query.left(business_dba.on(business_dba.businessId).using(business.id));

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nLEFT JOIN business_dba as [business_dba] on [business_dba].business_id = [business].id',
      );
    });

    it('should right join business_dba on business_id to business on id', () => {
      const query = new SqlQuery().select(business.id, business.businessName).from(business);
      query.right(business_dba.on(business_dba.businessId).using(business.id));

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nRIGHT JOIN business_dba as [business_dba] on [business_dba].business_id = [business].id',
      );
    });

    it('should handle ordering by columns', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .orderBy(business.businessName)
        .orderBy(business.id.desc());
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name ASC,[business].id DESC',
      );
    });

    it('should handle literals in the select', () => {
      const litString = 'select name from business_name where bid = [business].id and foo = :test';
      const literal = new SqlColumn({ Literal: litString, Alias: 'name' }).using({ test: 123 });
      const query = new SqlQuery().select(literal).from(business);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const name = Object.keys(cmd.values)[0];
      expect(cmd.values[name]).toBe(123);
      expect(name).toBe('test');
      expect(cmd.fetchSql.trim()).toBe(`SELECT\n(${litString}) as [name]\nFROM\nbusiness as [business]`);
    });

    it('should handle literals in the select with value', () => {
      const query = new SqlQuery()
        .select({
          Literal: 'select name from business_name where business_name.bid = [business].id',
          Alias: 'name',
        })
        .from(business);

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n(select name from business_name where business_name.bid = [business].id) as [name]\nFROM\nbusiness as [business]',
      );
    });

    it('should select distinct', () => {
      const query = new SqlQuery()
        .select(business.businessName)
        .from(business)
        .distinct();

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT DISTINCT\n[business].business_name as [businessName]\nFROM\nbusiness as [business]',
      );
    });
  });

  describe('SqlQuery simple agregate tests', () => {
    it('should allow a aggregate without specific group by at the aggregate', () => {
      const query = new SqlQuery().from(finance).select(finance.id.count().on(null));
      const cmd = query.genSql();
      const expected = 'SELECT' + '\nCOUNT([finance].id) as [id_count]' + '\nFROM' + '\nfinance as [finance]';
      expect(expected).toBe(cmd.fetchSql);
    });
  });

  describe('SqlQuery Group By clause tests', () => {
    it('should allow you to aggregate selected columns with group by', () => {
      const aggregates = [
        'AVG',
        'CHECKSUM',
        'COUNT',
        'COUNT_BIG',
        'GROUPING',
        'GROUPING_ID',
        'MAX',
        'MIN',
        'SUM',
        'STDEV',
        'STDEVP',
        'VAR',
        'VARP',
        'SPECIAL',
      ];
      for (let i = 0; i < aggregates.length; i++) {
        let query = new SqlQuery().from(finance);
        let aggregate = aggregates[i];
        switch (aggregates[i]) {
          case 'AVG':
            query = query.select(finance.balance.avg().on(finance.businessId));
            break;
          case 'CHECKSUM':
            aggregate = 'CHECKSUM_AGG';
            query = query.select(finance.balance.checksum().on(finance.businessId));
            break;
          case 'COUNT':
            query = query.select(finance.balance.count().on(finance.businessId));
            break;
          case 'COUNT_BIG':
            query = query.select(finance.balance.countBig().on(finance.businessId));
            break;
          case 'GROUPING':
            query = query.select(finance.balance.grouping().on(finance.businessId));
            break;
          case 'GROUPING_ID':
            query = query.select(finance.balance.groupingId().on(finance.businessId));
            break;
          case 'MAX':
            query = query.select(finance.balance.max().on(finance.businessId));
            break;
          case 'MIN':
            query = query.select(finance.balance.min().on(finance.businessId));
            break;
          case 'SUM':
            query = query.select(finance.balance.sum().on(finance.businessId));
            break;
          case 'STDEV':
            query = query.select(finance.balance.stdev().on(finance.businessId));
            break;
          case 'STDEVP':
            query = query.select(finance.balance.stdevp().on(finance.businessId));
            break;
          case 'VARP':
            query = query.select(finance.balance.varp().by(finance.businessId));
            break;
          case 'VAR':
          case 'SPECIAL':
            query = query.select(finance.balance.aggregate(aggregates[i]).by(finance.businessId));
            break;
        }

        const cmd = query.genSql();
        const expected =
          'SELECT' +
          `\n${aggregate}([finance].balance) as [balance_${aggregate.toLowerCase()}]` +
          '\nFROM' +
          '\nfinance as [finance]' +
          '\nGROUP BY [finance].business_id';
        expect(expected).toBe(cmd.fetchSql);
      }
    });

    it('should allow you to group by the selected columns', () => {
      let query = new SqlQuery()
        .select(business.taxId.groupBy())
        .select(new SqlColumn(null, null, 'count(*)').as('count'))
        .from(business);

      let cmd = query.genSql();
      const expected =
        'SELECT' +
        '\n[business].tax_id as [taxId],' +
        '\n(count(*)) as [count]' +
        '\nFROM' +
        '\nbusiness as [business]' +
        '\nGROUP BY [business].tax_id';
      expect(expected).toBe(cmd.fetchSql);

      query = query.pageSize(2).orderBy(business.taxId);
      cmd = query.genSql();

      const expectedFetch = `SELECT
[business].tax_id as [taxId],
(count(*)) as [count]
FROM
business as [business]
GROUP BY [business].tax_id
ORDER BY [business].tax_id ASC
OFFSET 0 ROWS
FETCH NEXT 2 ROWS ONLY`;

      const expectedCount = `SELECT count(*) as RecordCount FROM (
SELECT
[business].tax_id as [taxId],
(count(*)) as [count]
FROM
business as [business]
GROUP BY [business].tax_id
) count_tbl`;

      expect(cmd.fetchSql).toBe(expectedFetch);
      expect(cmd.countSql).toBe(expectedCount);
    });
  });

  describe('SqlQuery Where clause tests', () => {
    it('should handle a simple where clause', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.eq(10000));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const id = Object.keys(cmd.values)[0];
      expect(cmd.values[id]).toBe(10000);
      expect(cmd.fetchSql.trim()).toBe(
        `SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].id = (:${id})`,
      );
    });

    it('should handle a where clause with 0 as value', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.eq(0));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const id = Object.keys(cmd.values)[0];
      expect(cmd.values[id]).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        `SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].id = (:${id})`,
      );
    });

    it('should handle a where clause with false as value', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.eq(false));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const id = Object.keys(cmd.values)[0];
      expect(cmd.values[id]).toBe(false);
      expect(cmd.fetchSql.trim()).toBe(
        `SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].id = (:${id})`,
      );
    });

    it('should handle a where clause with ands', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.eq(10000))
        .where(business.businessName.eq('fred'));

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(2);
      const id = Object.keys(cmd.values)[0];
      const name = Object.keys(cmd.values)[1];
      expect(cmd.values[id]).toBe(10000);
      expect(cmd.values[name]).toBe('fred');
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n' +
          '[business].id as [id],\n' +
          '[business].business_name as [businessName]\n' +
          'FROM\n' +
          'business as [business]\n' +
          `WHERE [business].id = (:${id})` +
          `\nAND [business].business_name = (:${name})`,
      );
    });

    it('should handle a where clause using in', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.in(10000, 10001, 10002));

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const id = Object.keys(cmd.values)[0];
      expect(cmd.values[id]).toMatchObject([10000, 10001, 10002]);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n' +
          '[business].id as [id],\n' +
          '[business].business_name as [businessName]\n' +
          'FROM\n' +
          'business as [business]\n' +
          `WHERE [business].id in (:${id})`,
      );
    });

    it('should handle a where clause using between', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.between(10000, 10002));

      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(2);
      const id1 = Object.keys(cmd.values)[0];
      const id2 = Object.keys(cmd.values)[1];
      expect(cmd.values[id1]).toBe(10000);
      expect(cmd.values[id2]).toBe(10002);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n' +
          '[business].id as [id],\n' +
          '[business].business_name as [businessName]\n' +
          'FROM\n' +
          'business as [business]\n' +
          `WHERE ([business].id >= (:${id1})` +
          `\nAND [business].id <= (:${id2}))`,
      );
    });

    it('should handle a where clause using is null', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.isNull());
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n' +
          '[business].id as [id],\n' +
          '[business].business_name as [businessName]\n' +
          'FROM\n' +
          'business as [business]\n' +
          'WHERE [business].id IS NULL',
      );
    });

    it('should handle a where clause making it a NOT for the column test', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.not().isNull());
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n' +
          '[business].id as [id],\n' +
          '[business].business_name as [businessName]\n' +
          'FROM\n' +
          'business as [business]\n' +
          'WHERE NOT ([business].id IS NULL)',
      );
    });

    it('should handle a where clause using is not null', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.isNotNull());
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n' +
          '[business].id as [id],\n' +
          '[business].business_name as [businessName]\n' +
          'FROM\n' +
          'business as [business]\n' +
          'WHERE [business].id IS NOT NULL',
      );
    });

    it('should handle a where clause using a like and add in the %', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.businessName.like('fred'));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const name = Object.keys(cmd.values)[0];
      expect(cmd.values[name]).toBe('%fred%');
      expect(cmd.fetchSql.trim()).toBe(
        `SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].business_name like (:${name})`,
      );
    });

    it("should handle a where clause or'ed with another where clause", () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.businessName.like('fred').or(business.id.eq(1)))
        .where(business.businessName.like('d'));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(3);
      const name1 = Object.keys(cmd.values)[0];
      const id = Object.keys(cmd.values)[1];
      const name2 = Object.keys(cmd.values)[2];
      expect(cmd.values[name1]).toBe('%fred%');
      expect(cmd.values[name2]).toBe('%d%');
      expect(cmd.values[id]).toBe(1);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT' +
          '\n[business].id as [id],' +
          '\n[business].business_name as [businessName]' +
          '\nFROM' +
          '\nbusiness as [business]' +
          `\nWHERE ([business].business_name like (:${name1})` +
          `\nOR [business].id = (:${id}))` +
          `\nAND [business].business_name like (:${name2})`,
      );
    });

    it('should handle a where clause linking table columns', () => {
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .from(business_dba)
        .where(business.id.eq(business_dba.businessId));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business],\nbusiness_dba as [business_dba]\nWHERE [business].id = ([business_dba].business_id)',
      );
    });

    it('should handle a where clause with a literal with values', () => {
      const lit = new SqlColumn({ Literal: 'SELECT business_id FROM business_dba WHERE dba_name like :foo' }).using({
        foo: '%foo%',
      });

      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .where(business.id.eq(lit));
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const id = Object.keys(cmd.values)[0];
      expect(cmd.values[id]).toBe('%foo%');
      expect(cmd.fetchSql.trim()).toBe(
        `SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nWHERE [business].id = (${
          lit.Literal
        })`,
      );
    });
    // TODO HAVING
    // TODO GROUP BY

    it('should throw an exception trying to AND at the same level as OR', () => {
      let where;
      const name = business.businessName;
      where = business.id.eq(10);
      where = where.or(name.eq(10));
      // expect(() => where.and(name.eq(11))).toThrow(SqlError)
      expect(() => where.and(name.eq(11))).toThrowErrorMatchingSnapshot();
    });

    it('should throw an exception trying to OR at the same level as AND', () => {
      let where;
      const name = business.businessName;

      where = business.id.eq(10);
      where = where.and(name.eq(10));
      expect(() => where.or(name.eq(11))).toThrowErrorMatchingSnapshot();
    });
  });

  describe('SqlQuery paging tests', () => {
    it('Should default to page size of 50, should default to ordering by the first column in the select list', () => {
      const baseSql = `SELECT
[business].id as [id],
[business].business_name as [businessName]
FROM
business as [business]`;
      const expectedCount = `SELECT count(*) as RecordCount FROM (
${baseSql}
) count_tbl`;
      const expectedFetch = `${baseSql}
ORDER BY [business].id ASC
OFFSET 0 ROWS
FETCH NEXT 50 ROWS ONLY`;

      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .page(1);
      const cmd = query.genSql();

      expect(cmd.countSql).toBe(expectedCount);
      expect(cmd.fetchSql).toBe(expectedFetch);
    });

    it('Should default to page of 1', () => {
      const baseSql = `SELECT\n[business].id as [id],
[business].business_name as [businessName]
FROM
business as [business]`;
      const expectedCount = `SELECT count(*) as RecordCount FROM (
${baseSql}
) count_tbl`;
      const expectedFetch = `${baseSql}
ORDER BY [business].id ASC
OFFSET 0 ROWS
FETCH NEXT 10 ROWS ONLY`;

      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .pageSize(10);
      const cmd = query.genSql();

      expect(cmd.countSql).toBe(expectedCount);
      expect(cmd.fetchSql).toBe(expectedFetch);
    });

    it('Should use TOP if top is added in MS dialect', () => {
      const expectedFetch = `SELECT TOP 10
[business].id as [id],
[business].business_name as [businessName]
FROM
business as [business]`;

      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .top(10);
      const cmd = query.genSql();

      expect(cmd.countSql).toBe(undefined);
      expect(cmd.fetchSql).toBe(expectedFetch);
    });

    it('Should use LIMIT if top is added in !MS dialect', () => {
      const expectedFetch = `SELECT
"business".id as "id",
"business".business_name as "businessName"
FROM
business as "business"
LIMIT 10`;

      setPostgres();
      const query = new SqlQuery()
        .select(business.id, business.businessName)
        .from(business)
        .top(10);
      const cmd = query.genSql();

      expect(cmd.countSql).toBe(undefined);
      expect(cmd.fetchSql).toBe(expectedFetch);

      setSqlServer();
    });

    it('Should order by in the query', () => {
      const baseSql = `SELECT
[business].id as [id],
[business].business_name as [name]
FROM
business as [business]`;
      const countSql = `SELECT count(*) as RecordCount FROM (
${baseSql}
) count_tbl`;
      const fetchSql = `${baseSql}
ORDER BY [business].business_name ASC
OFFSET 0 ROWS
FETCH NEXT 50 ROWS ONLY`;

      const name = business.businessName.as('name');
      const query = new SqlQuery()
        .select(business.id, name)
        .from(business)
        .orderBy(name)
        .page(1);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(countSql);
      expect(cmd.fetchSql).toBe(fetchSql);
    });
  });

  describe('SqlQuery order tests', () => {
    it('should use the order when creating a simple sql statement', () => {
      const query = new SqlQuery()
        .from(business)
        .select(business.id, business.businessName)
        .orderBy(business.businessName);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name ASC',
      );
    });

    it('should allow changing sort direction', () => {
      const query = new SqlQuery()
        .from(business)
        .select(business.id, business.businessName)
        .orderBy(business.businessName.desc());
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC',
      );
    });

    it('should allow a list of columns', () => {
      const query = new SqlQuery()
        .from(business)
        .select(business.id, business.businessName)
        .orderBy(business.businessName.desc(), business.id);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC,[business].id ASC',
      );
    });

    it('should allow an array of columns', () => {
      const query = new SqlQuery()
        .from(business)
        .select(business.id, business.businessName)
        .orderBy([business.businessName.desc(), business.id]);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC,[business].id ASC',
      );
    });

    it('should allow an multiple order bys of columns', () => {
      const query = new SqlQuery()
        .from(business)
        .select(business.id, business.businessName)
        .orderBy(business.businessName.desc())
        .orderBy(business.id);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[business].id as [id],\n[business].business_name as [businessName]\nFROM\nbusiness as [business]\nORDER BY [business].business_name DESC,[business].id ASC',
      );
    });
  });

  describe('SqlQuery error tests', () => {
    it('should throw if from is not a SqlTable', () => {
      const query = new SqlQuery();
      expect(query.from.bind(query, {})).toThrow({
        location: 'SqlQuery::from',
        message: 'from clause must be a SqlTable',
      });
    });

    it('should throw if join is not a SqlJoin', () => {
      const query = new SqlQuery();
      expect(query.join.bind(query, {})).toThrow({
        location: 'SqlQuery::join',
        message: 'clause is not a SqlJoin',
      });
    });

    it('should throw exception if it is orderby with something other than SqlOrder or SqlColumn', () => {
      const query = new SqlQuery();
      expect(query.orderBy.bind(query, {})).toThrow({
        location: 'SqlOrder::constructor',
        message: 'did not pass a SqlColumn object',
      });
    });
  });

  describe('SqlQuery extras', () => {
    it('should take a masking function and call it for every column', () => {
      const masking = function(column, literal) {
        if (!(column instanceof SqlColumn)) {
          throw { msg: 'not a SqlColumn' };
        }
        return `RIGHT(${literal}, 4)`;
      };
      const query = new SqlQuery().select(business.star()).from(business);
      const cmd = query.genSql(null, masking);
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      let columns = '';
      businessColumns.forEach((ele, idx) => {
        if (idx !== 0) {
          columns += ',';
        }
        columns += `\nRIGHT([business].${ele.ColumnName}, 4) as [${ele.ColumnName.toCamel()}]`;
      });
      expect(cmd.fetchSql.trim()).toBe(`SELECT${columns}\nFROM\nbusiness as [business]`);
    });

    it('should take a decrypting function and call it for every column', () => {
      const decrypt = function(column, qualified) {
        if (!(column instanceof SqlColumn)) {
          throw { msg: 'not a SqlColumn' };
        }
        if (qualified) {
          return `DECRYPT(${column.qualifiedName()})`;
        } else {
          return `DECRYPT(${column.ColumnName})`;
        }
      };
      const query = new SqlQuery().select(business.star()).from(business);
      const cmd = query.genSql(decrypt);
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      let columns = '';
      businessColumns.forEach((ele, idx) => {
        if (idx !== 0) {
          columns += ',';
        }
        columns += `\nDECRYPT([business].${ele.ColumnName}) as [${ele.ColumnName.toCamel()}]`;
      });
      expect(cmd.fetchSql.trim()).toBe(`SELECT${columns}\nFROM\nbusiness as [business]`);
    });
    it('should take a decrypting function and call it for every column setting hasEncrypted to true if any are encrypted', () => {
      const decrypt = function(column, qualified) {
        if (!(column instanceof SqlColumn)) {
          throw { msg: 'not a SqlColumn' };
        }
        if (column.columName === 'id') {
          return null;
        }
        if (qualified) {
          return `DECRYPT(${column.qualifiedName()})`;
        } else {
          return `DECRYPT(${column.ColumnName})`;
        }
      };
      const query = new SqlQuery().select(business.star()).from(business);
      const cmd = query.genSql(decrypt);
      expect(cmd.hasEncrypted).toBe(true);
    });
    it('should take a decrypting function and call it for every column setting hasEncrypted to false if none are encrypted', () => {
      const decrypt = function(column, qualified) {
        if (!(column instanceof SqlColumn)) {
          throw { msg: 'not a SqlColumn' };
        }
        return null;
      };
      const query = new SqlQuery().select(business.star()).from(business);
      const cmd = query.genSql(decrypt);
      expect(cmd.hasEncrypted).toBe(false);
    });
    it('should take both a decrypting function and masking function and call them for every column', () => {
      const decrypt = function(column, qualified) {
        if (!(column instanceof SqlColumn)) {
          throw { msg: 'not a SqlColumn' };
        }
        if (column.ColumnName !== 'tax_id') {
          return null;
        }
        if (qualified) {
          return `DECRYPT(${column.qualifiedName()})`;
        } else {
          return `DECRYPT(${column.ColumnName})`;
        }
      };
      const masking = function(column, literal) {
        if (!(column instanceof SqlColumn)) {
          throw { msg: 'not a SqlColumn' };
        }
        if (column.ColumnName === 'id') {
          return null;
        }
        return `RIGHT(${literal}, 4)`;
      };
      const query = new SqlQuery().select(business.star()).from(business);
      const cmd = query.genSql(decrypt, masking);
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      let columns = '';
      businessColumns.forEach((ele, idx) => {
        if (idx !== 0) {
          columns += ',';
        }
        let name;
        if (ele.ColumnName === 'id') {
          name = '\n[business].id as [id]';
        } else if (ele.ColumnName === 'tax_id') {
          name = `\nRIGHT(DECRYPT([business].${ele.ColumnName}), 4) as [${ele.ColumnName.toCamel()}]`;
        } else {
          name = `\nRIGHT([business].${ele.ColumnName}, 4) as [${ele.ColumnName.toCamel()}]`;
        }
        columns += name;
      });
      expect(cmd.fetchSql.trim()).toBe(`SELECT${columns}\nFROM\nbusiness as [business]`);
    });
    describe('SqlQuery applyOrder', () => {
      it('should allow you to apply an order string to the query', () => {
        const query = new SqlQuery().select(business.star()).from(business);

        const order = 'id, name DESC';
        query.applyOrder(business, order, { name: [business.businessName] });
        const cmd = query.genSql();
        expect(cmd.countSql).toBe(undefined);
        expect(Object.keys(cmd.values).length).toBe(0);
        const columns = getBusinessCols();
        expect(cmd.fetchSql.trim()).toBe(
          `SELECT${columns}\nFROM\nbusiness as [business]\nORDER BY [business].id ASC,[business].business_name DESC`,
        );
      });

      it('should allow you to apply an order string to the query with multiple tables', () => {
        const query = new SqlQuery()
          .select(business.star())
          .from(business)
          .join(business_dba.on(business_dba.businessId).using(business.id));

        const order = 'id, name DESC, business_dba.id';
        query.applyOrder(business, order, { name: [business.businessName] });
        const cmd = query.genSql();
        expect(cmd.countSql).toBe(undefined);
        expect(Object.keys(cmd.values).length).toBe(0);
        const columns = getBusinessCols();
        expect(cmd.fetchSql.trim()).toBe(
          `SELECT${columns}\nFROM\nbusiness as [business]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [business].id\nORDER BY [business].id ASC,[business].business_name DESC,[business_dba].id ASC`,
        );
      });

      it('should throw an exception if the first argument is not a SqlTable to insert and update', () => {
        const query = new SqlQuery()
          .select(business.star())
          .from(business)
          .join(business_dba.on(business_dba.businessId).using(business.id));

        const order = 'id, name DESC, business_dba.id';
        expect(query.applyOrder.bind(query, {}, order, null)).toThrow({
          location: 'SqlQuery::applyOrder',
          message: 'defaultSqlTable is not an instance of SqlTable',
        });
      });
    });
  });

  describe('SqlQuery options', () => {
    it('should allow you to override the namedValueMarker for variables', () => {
      const columns = getBusinessCols();
      const query = new SqlQuery({ namedValueMarker: '@' })
        .select(business.star())
        .from(business)
        .where(business.id.eq('12345'));
      const cmd = query.genSql();
      const expected = `SELECT${columns}\nFROM\nbusiness as [business]\nWHERE [business].id = (@id0)`;
      expect(cmd.fetchSql.trim()).toBe(expected);
    });

    it('should allow you to turn off namedValues for variables', () => {
      const columns = getBusinessCols();
      const query = new SqlQuery({ namedValues: false })
        .select(business.star())
        .from(business)
        .where(business.id.eq('12345'));
      const cmd = query.genSql();
      const expected = `SELECT${columns}\nFROM\nbusiness as [business]\nWHERE [business].id = ?`;
      expect(cmd.fetchSql.trim()).toBe(expected);
    });
  });
});
