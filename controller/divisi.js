var response = require('../res');
var connection = require('../koneksi');
const {Crud} = require('../utils/models');

//get semua divisi
exports.tampilDivisi = async function(req, res){
    var tess = await Crud('SELECT * FROM divisi');
    response.ok(tess, res);    
};


//get divisi by id
exports.tampilDivisiById = function(req, res){
    let id = req.params.id;
    connection.query('SELECT * FROM divisi WHERE id_divisi = ?', [id], function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    });
};

//update divisi
exports.updateDivisi = function(req, res){
    var id = req.params.id;
    var name_division = req.body.name_division;
    
    connection.query('UPDATE divisi SET name_division = ?  WHERE id_divisi = ?',[name_division,id], function(error, rows, fields){
        if(error){
            console.log(error);
        }else{
            response.ok("Divisi Berhasil Diubah", res)
        }
    });
  
};

//menambahkan divisi
exports.tambahDivisi = async function(req, res){
    var name = req.body.name_division;
    var id_company = req.body.id_company;

    var tes = await Crud(`INSERT INTO divisi (name_division,company) VALUES ('${name}','${id_company}')`);
    
    response.ok("berhasil disimpan", res);
};

//delete division
exports.deleteDivisi = function(req, res){
    let id = req.params.id;
    connection.query('DELETE FROM divisi WHERE id_divisi = ?', [id], function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok("Data Berhasil Dihapus", res);
        }
    });
};