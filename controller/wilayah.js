'use strict';

var response = require('../res');
var connection = require('../koneksi');

exports.index = function(req, res){
    response.ok("Rest api berjalan",res);
};

exports.tampilKabupaten = function(req, res){
    connection.query('SELECT * FROM wilayah_kabupaten', function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    })
};

exports.tampilKecamatan = function(req, res){
    connection.query('SELECT * FROM wilayah_kecamatan', function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    })
};

exports.tampilDesa = function(req, res){
    connection.query('SELECT * FROM wilayah_desa', function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    })
};

exports.tampilProvinsi = function(req, res){
    connection.query('SELECT * FROM wilayah_provinsi', function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    })
};

//menampilkan semua data berdasarkan id
exports.tampilKabupatenByProv = function(req, res){
    let id = req.params.id;
    connection.query('SELECT * FROM wilayah_kabupaten WHERE id_prov = ?', [id], function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    });
};

//menampilkan semua data berdasarkan id
exports.tampilKecamatanByKab = function(req, res){
    let id = req.params.id;
    connection.query('SELECT * FROM wilayah_kecamatan WHERE id_kab = ?', [id], function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    });
};

//menampilkan semua data berdasarkan id
exports.tampilID = function(req, res){
    let id = req.params.id;
    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id], function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.ok(rows, res);
        }
    });
};




//menampilkan matakuliah grup/join
exports.tampilGroup = function(req, res){
    connection.query('SELECT mahasiswa.id_mahasiswa, mahasiswa.nim, mahasiswa.nama, mahasiswa.jurusan, matakuliah.matakuliah, matakuliah.sks from krs JOIN matakuliah JOIN mahasiswa WHERE krs.id_matakuliah = matakuliah.id_matakuliah AND krs.id_mahasiswa = mahasiswa.id_mahasiswa ORDER BY mahasiswa.id_mahasiswa',
    function(error, rows, fields){
        if(error){
            connection.log(error);
        }else{
            response.jsonnested(rows, res)
        }
    }
    )
}