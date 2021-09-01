var mysql = require('mysql');

//membuat koneksi database
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hris',
});

conn.connect((err) => {
    if(err) throw err;
    console.log('databse berhasil terkoneksi');
});

module.exports = conn;