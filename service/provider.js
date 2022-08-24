const Pool=require('pg').Pool;

const pool=new Pool({
user: 'postgres',
password: 'pass',
database: 'banque',
host: 'localhost',
port: 5432
});
pool.connect();

module.exports=pool;
