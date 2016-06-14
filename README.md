# README #

This library basically takes your fluent SQL and generates SQL strings and replacement

### What is this repository for? ###

* Quick summary
I needed a javascript version of the same library I wrote for java (mainly because I just liked the flow)
* Examples

Create your table
```
	var users = new SqlTable({
		TableName: 'users',
		columns: [{ColumnName: 'id'}, {ColumnName: 'username'}, {ColumnName: 'password'}]
	});
	var bank = new SqlTable({
		TableName: 'bank_account',
		columns: [{ColumnName: 'id'}, {ColumnName: 'user_id'}, {ColumnName: 'account_no'}, {ColumnName: 'balance'}]
	});
```
NOTE: column names will be changed to camelCase from snake_case

Create you query
```
	var query = new SqlQuery()
				.select(users.id, users.username, users.password)
				.from(users)
				.where(users.username.eq('jsmith'));
```
Get your SQL
```
	var sql = query.getSql(decryptFunction, maskingFunction);
```
Decrypt & Masking functions are just a function that takes 2 parameters, SqlColumn and boolean on weather or not to use a fully qualified column name (ie. table.col), you can do anything in these and return null or a SQL literal to insert for that column in the generated SQL. Both functions can be NULL

The sql returned is an object

* fetchSql - the actual sql statement to fetch the data
* countSql - a count(*) with the same where statement
* hasEncrypted - boolean to say if the encrypted function ever returned something other than null
* values - object of the values you used in the query

Aggregate example
```
    const query = new SqlQuery()
                   .select(bank.balance.sum().by(bank.userId)
                   .from(bank);
```
generates:
```
    SELECT SUM(bank_account.balance) as balance_sum
    FROM bank_account as bank_account
    GROUP BY bank_account.user_id
```
Look through the tests for more examples, the tests should have every possible option exercised

### How do I get set up? ###

npm install fluent-sql
