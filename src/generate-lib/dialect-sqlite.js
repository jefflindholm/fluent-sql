const sqlite3 = require('sqlite3').verbose();
let connection;

function connect(dbname) {
  return new Promise(resolve => {
    connection = new sqlite3.Database(dbname, err => {
      if (err) console.log(err.message);
      resolve();
    });
  });
}

function runCommand(sql, args = []) {
  return new Promise(resolve => {
    connection.all(sql, args, (err, rows) => {
      if (err) throw err;
      resolve(rows);
    });
  });
}

async function getTables() {
  const results = await command(`select name from sqlite_master where type='table'`);
  return results;
}

async function getColumns(name) {
  const results = await command(`pragma table_info(${name})`);
  return results;
}

async function configure(newConfig) {
  await connect(newConfig.database);

  process.on('SIGINT', async () => {
    console.log('calling db close');
    await connection.close();
  });
}
async function close() {
  await connection.close();
}
async function command(sql, args = []) {
  sql = sql.replace(/\$\d/, '?');
  return await runCommand(sql, args);
}

async function select(sql, args = []) {
  const result = await command(sql, args);
  return result;
}


module.exports = {
  configure,
  command,
  select,
  close,
  getTables,
  getColumns,
};
