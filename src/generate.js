#!/usr/bin/env node
const { commandLineParser } = require('simple-db-migrate/command-line');
require('./string.js');

let db;

async function configure(newConfig) {
  config = {
    dialect: process.env.MIGRATE_DIALECT || 'sqlite',
    database: process.env.MIGRATE_DATABASE || 'db.sqlite',
    verbose: false,
    debug: false,
    ...newConfig
  };

  const dialect = config.dialect.toLowerCase();
  db = require(`./generate-lib/dialect-${dialect}`);

  await db.configure(config);
}

const options = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'dialect', alias: 'd', options: ['pg', 'sqlite'] },
  { name: 'database', alias: 'db', type: String },
  { name: 'user', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },
  { name: 'host', alias: 'h', type: String },
  { name: 'port', type: Number, numeric: 'int' },
];

const db_config = commandLineParser(options);

(async () => {
  await configure(db_config);
  const tables = await db.getTables();
  await tables.forEach(async t => {
    const columns = await db.getColumns(t.name);
    let sqlTable = `const ${t.name.toCamel()} = new SqlTable('${t.name}', [\n`
    columns.forEach(c => {
      const col = `  {ColumnName: '${c.name}'},`
      sqlTable += `${col}${' '.repeat(30 - col.length)}// type: '${c.type}'\n`
    });
    sqlTable += ']);\n\n';
    console.log(sqlTable);
  });
})();
