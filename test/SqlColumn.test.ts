/* global describe it */
import { BaseTable } from '../src/base-sql';
import SqlColumn from '../src/sql-column';
import SqlOrder from '../src/sql-order';
import SqlTable from '../src/sql-table';
import SqlWhere from '../src/sql-where';
import '../src/string.extensions';

describe('fluent sql tests', () => {

  // 3 ways to create SqlTables
  const businessColumns = [
    { ColumnName: 'id' },
    { ColumnName: 'business_name' },
    { ColumnName: 'tax_id' }
  ];
  const business: BaseTable = new SqlTable({ TableName: 'business', Columns: businessColumns });

  const business_dba: BaseTable = new SqlTable({
    name: 'business_dba',
    columns: [
      { ColumnName: 'id' },
      { ColumnName: 'business_id' },
      { ColumnName: 'dba' },
    ]
  });

  const financeColumns = [
    { ColumnName: 'id' },
    { ColumnName: 'business_id' },
    { ColumnName: 'balance' },
    { ColumnName: 'finance_type' }
  ];
  const finance = SqlTable.create({
    TableName: 'finance',
    Columns: financeColumns
  } as SqlTable);

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
    const literal = SqlColumn.create({ literal: '(select top 1 id from business)' }).as('foo');

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
      });
    });
    describe('literal tests', () => {
      it('should not have a column name', () => {
        expect(literal.ColumnName).toBe(undefined);
      });
      it('should have an alias', () => {
        expect(literal.Alias).toBe('foo');
      });
    });

    it('should throw exception if it is constructed from something other than SqlTable, or {Literal:<val>, alias: <val>}', () => {
      expect(() => new SqlColumn({} as any)).toThrow('SqlColumn::constructor: must construct using a SqlTable or literal');
    });

    it('should generate SqlWhere clauses from operators, eq, ne, gt, gte, lt, lte, isNull, isNotNull, like, in', () => {
      const col = business.id;
      let where;
      // single args
      ['eq', 'ne', 'gt', 'gte', 'LT', 'lte', 'like'].forEach(op => {
        where = col.op(op, 1);
        expect(where instanceof SqlWhere).toBe(true);
      });
      // no args
      ['isNull', 'isNotNull'].forEach(op => {
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
