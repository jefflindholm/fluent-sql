/* global describe it */
import '../src/string.extensions';
import { BaseTable, eEscapeLevels } from '../src/base-sql';
import SqlTable from '../src/sql-table';
import SqlQuery from '../src/sql-query';
import { getDefaultOptions, setPostgres, setDefaultOptions, DbOptions } from '../src/sql-query';

describe('sql escaping of column/table names testing', () => {
    it('should escape column names and table names', () => {
      const columns = [
        { ColumnName: 'id' },
        { ColumnName: 'username' },
        { ColumnName: 'password' },
        { ColumnName: 'email' },
      ];
      const User: BaseTable = SqlTable.create({
        TableName: 'account',
        Columns: columns,
      } as SqlTable)

      const ops = getDefaultOptions();
      setPostgres();
      setDefaultOptions({
        namedValueMarker: ':',
        markerType: 'name',
        escapeLevel: [eEscapeLevels.columnName, eEscapeLevels.tableName]
      } as DbOptions);
      expect(User.as('foo').id.qualifiedName()).toBe('foo."id"');
      const query = new SqlQuery().from(User).select(User.id).where(User.id.eq(1));
      const sql = query.genSql();
      expect(sql.fetchSql).toBe('SELECT\naccount."id" as id\nFROM\n"account" as account\nWHERE account."id" = (:id0)')
    });
  });
