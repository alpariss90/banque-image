const Pool=require('pg').Pool;

const pool=new Pool({
username:process.env.PGUSER,
password:process.env.PGPASSWORD,
database:process.env.PGDATABASE,
host:process.env.PGHOST,
port:process.env.PGPORT
});

module.exports=pool;