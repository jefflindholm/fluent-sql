//import expect from 'chai';
/* global describe it */
import '../src/string.extensions';
import SqlTable from '../src/sql-table';
import SqlColumn from '../src/sql-column';

describe('fluent sql tests', () => {
  const businessColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_name' }, { ColumnName: 'tax_id' }];
  const business = SqlTable.create({ TableName: 'business', Columns: businessColumns } as SqlTable);
  const business_dba = SqlTable.create({
    TableName: 'business_dba', Columns: [
      { ColumnName: 'id' },
      { ColumnName: 'business_id' },
      { ColumnName: 'dba' },
    ]
  } as SqlTable);
  const financeColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_id' }, { ColumnName: 'balance' }, { ColumnName: 'finance_type' }];
  const finance = SqlTable.create({ TableName: 'finance', Columns: financeColumns } as SqlTable);

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
        expect(table1.getTable()).toBe(table1.getAlias());
      });
      it('should have two columns', () => {
        expect(table1.Columns.length).toBe(businessColumns.length);
      });
      it('should have columns as an array of SqlColumns', () => {
        for (let i = 0; i < table1.Columns.length; i++) {
          expect(table1.Columns[i] instanceof SqlColumn).toBe(true);
        }
      });
    });
    describe('table2 compared to table1', () => {
      it('should be different objects', () => {
        expect(table1).not.toBe(table2);
      });
      it('should have the same table name', () => {
        expect(table1.TableName).toBe(table2.TableName);
      });
      it('should be different columns, but same names', () => {
        for (let i = 0; i < table2.Columns.length; i++) {
          expect(table1.Columns[i]).not.toBe(table2.Columns[i]);
          expect(table1.Columns[i].ColumnName).toBe(table2.Columns[i].ColumnName);
        }
      });
    });
    it('should allow an alias and have all columns', () => {
      const b = business.as('b');
      expect(b.id.ColumnName).toBe(business.id.ColumnName);
      expect(b.id.TableName).toBe(business.id.TableName);
      expect(b.Columns.length).toBe(business.Columns.length);
    });
    it('should create a join', () => {
      const b = business.as('b');
      const query = b.join(business_dba.on(business_dba.businessId).using(b.id));
      query.from(b).select(b.id);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nJOIN business_dba as [business_dba] on [business_dba].business_id = [b].id',
      );
    });
    it('should create a left join', () => {
      const b = business.as('b');
      const query = b.left(business_dba.on(business_dba.businessId).using(b.id));
      query.from(b).select(b.id);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nLEFT JOIN business_dba as [business_dba] on [business_dba].business_id = [b].id',
      );
    });
    it('should create a right join', () => {
      const b = business.as('b');
      const query = b.right(business_dba.on(business_dba.businessId).using(b.id));
      query.from(b).select(b.id);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(0);
      expect(cmd.fetchSql.trim()).toBe(
        'SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nRIGHT JOIN business_dba as [business_dba] on [business_dba].business_id = [b].id',
      );
    });
    it('should create a where', () => {
      const b = business.as('b');
      const query = b.where(b.id.eq(1000));
      query.from(b).select(b.id);
      const cmd = query.genSql();
      expect(cmd.countSql).toBe(undefined);
      expect(Object.keys(cmd.values).length).toBe(1);
      const id = Object.keys(cmd.values)[0];
      expect(cmd.fetchSql.trim()).toBe(`SELECT\n[b].id as [id]\nFROM\nbusiness as [b]\nWHERE [b].id = (:${id})`);
    });
    it('should require a SqlColumn when building a join using on', () => {
      expect(business.on.bind(business, {})).toThrow({
        location: 'SqlTable::on',
        message: 'trying to build join on column not from this table',
      } as any);
    });
  });

  describe('SqlTable tests second round', () => {
    it('should construct correctly from a name and array of columns', () => {
      function legalColumns(): any[] {
        const arr = [
          { name: 'business_type' },
          {
            name: 'business_type_formatted',
            Literal: "REPLACE(COALESCE(business_type, 'Unknown Business'), '_', ' ')",
          },
          { name: 'id' },
        ];
        arr.forEach((a: any) => {
          a.Alias = a.name.toCamel(); // eslint-disable-line no-param-reassign
          a.ColumnName = a.name;
        });
        return arr;
      }
      const table = SqlTable.create({
        TableName: 'document_templates',
        Columns: legalColumns(),
      } as SqlTable);
      expect(table.Columns.length).toBe(3);
      expect(table.businessType.ColumnName).toBe('business_type');
      expect(table.businessTypeFormatted.Literal).toBe("REPLACE(COALESCE(business_type, 'Unknown Business'), '_', ' ')");
    });
  });

  describe('SqlTable insert/update generation tests', () => {
    it('should construct a valid insert statement given an object with matching columns', () => {
      const expected = 'INSERT INTO business (id, business_name, tax_id) VALUES (:id, :businessName, :taxId)';
      const sql = business.insert({ id: 1, businessName: 'DDS', taxId: '12345-67' });
      expect(sql.sql).toBe(expected);
      expect(sql.values.id).toBe(1);
      expect(sql.values.businessName).toBe('DDS');
      expect(sql.values.taxId).toBe('12345-67');
    });
    it('should construct a valid update statement given an object with matching columns', () => {
      const expected = 'UPDATE business SET businessName = :businessName, taxId = :taxId WHERE id = :id';
      const sql = business.update({ id: 1, businessName: 'DDS', taxId: '12345-67' });
      expect(sql.sql).toBe(expected);
      expect(sql.values.id).toBe(1);
      expect(sql.values.businessName).toBe('DDS');
      expect(sql.values.taxId).toBe('12345-67');
    });
  });
});
