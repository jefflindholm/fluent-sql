# README

This library basically takes your fluent SQL and generates SQL strings and replacement

### What is this repository for?

- Quick summary
  I needed a javascript version of the same library I wrote for java (mainly because I just liked the flow)
- Examples

Create your table

```javascript
const users = new SqlTable({
  TableName: 'users',
  columns: [{ ColumnName: 'id' }, { ColumnName: 'username' }, { ColumnName: 'password' }],
});
const bank = new SqlTable({
  TableName: 'bank_account',
  columns: [{ ColumnName: 'id' }, { ColumnName: 'user_id' }, { ColumnName: 'account_no' }, { ColumnName: 'balance' }],
});
```

#### NOTE: column names will be changed to camelCase from snake_case

Create your query. SqlQuery takes an options object.

- SqlQuery object to copy options from
  OR
- an object of options
  - sqlStartChar - character used to escape names
    - default is '['
  - sqlEndChar - character used to end escaped names
    - default is ']'
  - escapeLevel - array of zero or more ('table-alias', 'column-alias')
    - default is ['table-alias', 'column-alias']
  - namedValues - boolean, if false will use ? for the values and just return an array of values
    - default true
  - namedValueMarker - character, will use this with named values in the generated SQL (example: where foo = (:value0))
    - default is ':'
  - markerType - 'number' or 'name' if number will generate :1, ..., :n number is 1 based
    - default is 'name'
  - dialect - 'pg' = postgreSQL, 'MS' = SQLServer subtle changes to the generated SQL (TOP vs. LIMIT for
    example)
    - default is 'MS'

```javascript
import { setPostgres, setSqlServer } from 'fluent-sql';

setPostgres(); // from here forward sqlQuery will use postgres options
```

#### the following are the options set by setPostgres/setSqlServer

```javascript
export const postgresOptions = {
  sqlStartChar: '"',
  sqlEndChar: '"',
  namedValues: true,
  namedValueMarker: '$',
  markerType: 'number',
  dialect: 'pg',
};
export const sqlServerOptions = {
  sqlStartChar: '[',
  sqlEndChar: ']',
  escapeLevel: ['table-alias', 'column-alias'],
  namedValues: true,
  namedValueMarker: ':',
  markerType: 'name',
  dialect: 'MS',
};
```

```javascript
const query = new SqlQuery()
  .select(users.id, users.username, users.password)
  .from(users)
  .where(users.username.eq('jsmith'));
```

Get your SQL

```javascript
const sql = query.getSql(decryptFunction, maskingFunction);
```

Decrypt & Masking functions are just a function that takes 2 parameters, SqlColumn and boolean on weather or not to use a fully qualified column name (ie. table.col), you can do anything in these and return null or a SQL literal to insert for that column in the generated SQL. Both functions can be NULL

The sql returned is an object

- fetchSql - the actual sql statement to fetch the data
- countSql - a count(\*) with the same where statement
- hasEncrypted - boolean to say if the encrypted function ever returned something other than null
- values - object of the values you used in the query

Aggregate example

```javascript
const query = new SqlQuery().select(bank.balance.sum().by(bank.userId)).from(bank);
```

generates:

```sql
SELECT SUM(bank_account.balance) as balance_sum
FROM bank_account as bank_account
GROUP BY bank_account.user_id
```

Update/Insert

```javascript
const insert = bank.insert({ id: 1, userId: 1, accountNo: 1, balance: 1000.0 });
const update = bank.update({ id: 1, balance: 1000.0 });
```

- insert/update structure
  - sql - sql for INSERT/UPDATE
  - values - object of the values used in the sql

Look through the tests for more examples, the tests should have every possible option exercised

### How do I get set up?

npm install fluent-sql
