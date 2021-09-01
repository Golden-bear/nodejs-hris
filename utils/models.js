var connection = require('../koneksi');

function Crud(query){
    return new Promise((resolve, reject) => {
        connection.query(query, (err, rows, fields) => {
            if(err){
                reject(err);
            }else{
                resolve(rows);
            }
        })
    })
}



module.exports = {Crud};