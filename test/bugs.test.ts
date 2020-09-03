/* global describe it */
import '../src/string.extensions';
import { BaseTable } from '../src/base-sql';
import SqlTable from '../src/sql-table';
import SqlColumn from '../src/sql-column';
import SqlQuery from '../src/sql-query';

describe('reported bugs', () => {
  describe('or select generating wrong thing', () => {
    it('should handle an or in the where clause fine', () => {
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

      const email = '';
      const username = 'jlindholm';
      const query = new SqlQuery(null)
        .from(User)
        .select(User.star())
        .where(User.email.eq(email)
            .or(User.username.eq(username)));
      const sql = query.genSql();
      const expected = 'SELECT\n[account].id as [id],\n[account].username as [username],\n[account].password as [password],\n[account].email as [email]\nFROM\naccount as [account]\nWHERE ([account].email = (:email0)\nOR [account].username = (:username1))';
      expect(sql.fetchSql).toBe(expected);
    });
  });
});
