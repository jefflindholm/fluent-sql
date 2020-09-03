/* global describe it */
import '../src/string.extensions';
import { BaseTable } from '../src/base-sql';
import SqlQuery, { DbOptions, getDefaultOptions, setDefaultOptions } from '../src/sql-query';
import SqlTable from '../src/sql-table';
import SqlJoin from '../src/sql-join';
import SqlColumn from '../src/sql-column';

describe('fluent sql tests', () => {
  const businessColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_name' }, { ColumnName: 'tax_id' }];
  const business: BaseTable = SqlTable.create({ TableName: 'business', Columns: businessColumns } as SqlTable);

  describe('default tests', () => {
    it('should override all the settings for default options', () => {
      const oldOptions = Object.assign({}, getDefaultOptions());
      const newOptions = Object.assign({}, getDefaultOptions(), {
        sqlStartChar: '`',
        sqlEndChar: '`',
      });
      setDefaultOptions(newOptions);
      expect(newOptions).toStrictEqual(getDefaultOptions());
      setDefaultOptions(oldOptions);
    });
  });

  describe('sqlescape test', () => {
    it('should return [name] for a string', () => {
      expect('name'.sqlEscape(null, null)).toEqual('[name]');
    });

    it('should return escape based on the passed SqlQuery', () => {
      const query = new SqlQuery({ sqlStartChar: '+', sqlEndChar: '*+' } as DbOptions);
      expect(query.sqlEscape('name')).toEqual('+name*+');
      expect('name'.sqlEscape(query, null)).toEqual('+name*+');
    });
  });

  describe('SqlJoin tests', () => {
    it('should throw error if it is not constructed from a SqlColumn', () => {
      expect(() => new SqlJoin({} as any)).toThrowErrorMatchingSnapshot();
    });
    it('should throw error if it is not linked via using with a SqlColumn', () => {
      const join = business.on(business.id);
      expect(() => join.using({} as any)).toThrowErrorMatchingSnapshot();
    });
  });
});
