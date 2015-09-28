# README #

This library basically takes your fluent SQL and generates SQL strings and replacement

### What is this repository for? ###

* Quick summary
I needed a javascript version of the same library I wrote for java (mainly because I just liked the flow)
* Examples

Create your table

	var users = new SqlTable({
		TableName: 'users',
		columns: [{ColumnName: 'id'}, {ColumnName: 'username'}, {ColumnName: 'password'}]
	});

Create you query

	var query = new SqlQuery()
				.select(users.id, users.username, users.password)
				.from(users)
				.where(users.username.eq('jsmith'));

Get your SQL

	var sql = query.getSql(decryptFunction, maskingFunction);

Decrypt & Masking functions are just a function that takes 2 parameters, SqlColumn and boolean on weather or not to use a fully qualified column name (ie. table.col), you can do anything in these and return null or a SQL literal to insert for that column in the generated SQL. Both functions can be NULL

The sql returned is an object

* fetchSql - the actual sql statement to fetch the data
* countSql - a count(*) with the same where statement
* hasEncrypted - boolean to say if the encrypted function ever returned something other than null
* values - object of the values you used in the query

Look through the tests for more examples, the tests should have every possible option exercised

### How do I get set up? ###

npm install fluent-sql
