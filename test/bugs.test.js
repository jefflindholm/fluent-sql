/* global describe it */
import '../src/string';
import { SqlQuery } from '../src/fluent-sql.js';
import { SqlTable } from '../src/fluent-sql.js';
import { SqlColumn } from '../src/fluent-sql.js';
//import {SqlWhere} from '../src/fluent-sql.js';
//import {SqlOrder} from '../src/fluent-sql.js';
import { SqlJoin } from '../src/fluent-sql.js';
import { SqlBuilder } from '../src/fluent-sql.js';
import { setDefaultOptions, getDefaultOptions } from '../src/fluent-sql.js';

describe('reported bugs', () => {
  describe('or select generating wrong thing', () => {
    it('should handle an or in the where clause fine', () => {
      const User = new SqlTable({
        TableName: 'account',
        columns: [{ ColumnName: 'id' }, { ColumnName: 'username' }, { ColumnName: 'password' }, { ColumnName: 'email' }],
      });
      const email = '';
      const username = 'jlindholm';
      const query = new SqlQuery()
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
