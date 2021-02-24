/* global describe it */
import '../src/string.extensions';
import SqlTable from '../src/sql-table';
import { BaseTable } from '../src/base-sql';
import SqlQuery, { setDefaultOptions, setPostgres, setSqlServer, DbOptions } from '../src/sql-query';


const User: BaseTable = SqlTable.create({
  TableName: 'users',
  Columns: [
    { ColumnName: 'id' },
    { ColumnName: 'gender' },
    { ColumnName: 'title' },
    { ColumnName: 'first' },
    { ColumnName: 'last' },
    { ColumnName: 'city' },
    { ColumnName: 'state' },
    { ColumnName: 'zip' },
    { ColumnName: 'email' },
    { ColumnName: 'dob' },
  ],
} as SqlTable);

describe('test record set paging', () => {
  describe('sql query', () => {
    it('should create paging with the old record set format MS Schema', () => {
      const baseSql = `SELECT
[users].id as [id],
[users].gender as [gender],
[users].title as [title],
[users].first as [first],
[users].last as [last],
[users].city as [city],
[users].state as [state],
[users].zip as [zip],
[users].email as [email],
[users].dob as [dob]
FROM
users as [users]
WHERE [users].email = (:email0)`;
      const expected = `SELECT * FROM (
SELECT *, row_number() OVER (ORDER BY id ASC) as Paging_RowNumber FROM (
${baseSql}
) base_query
) as detail_query WHERE Paging_RowNumber BETWEEN 0 AND 20`;

      setDefaultOptions({ recordSetPaging: true } as DbOptions);
      const email = 'jeff@foo.com';
      const query = new SqlQuery(null)
        .from(User)
        .select(User.star())
        .where(User.email.eq(email))
        .pageSize(20);

      const sql = query.genSql();
      expect(sql.fetchSql).toBe(expected);
      setDefaultOptions({ recordSetPaging: false } as DbOptions);
    });

    it('should create paging with the old record set format pg Schema', () => {
      const baseSql = `SELECT
"users".id as "id",
"users".gender as "gender",
"users".title as "title",
"users".first as "first",
"users".last as "last",
"users".city as "city",
"users".state as "state",
"users".zip as "zip",
"users".email as "email",
"users".dob as "dob"
FROM
users as "users"
WHERE "users".email = ($1)`;
      const expected = `SELECT * FROM (
SELECT *, row_number() OVER (ORDER BY id ASC) as Paging_RowNumber FROM (
${baseSql}
) base_query
) as detail_query WHERE Paging_RowNumber BETWEEN 0 AND 20`;
      setPostgres();
      setDefaultOptions({ recordSetPaging: true } as DbOptions);
      const email = 'jeff@foo.com';
      const query = new SqlQuery(null)
        .from(User)
        .select(User.star())
        .where(User.email.eq(email))
        .pageSize(20);

      const sql = query.genSql();
      expect(sql.fetchSql).toBe(expected);
      setSqlServer();
    });
  });
});
