var connection = require('../koneksi');
var mysql = require('mysql');
var md5 = require('md5');
var response = require('../res');
var jwt = require('jsonwebtoken');
var config =  require('../config/secret');
var ip = require('ip');
const { connect } = require('../koneksi');
const conn = require('../koneksi');

//controller untuk register
exports.registrasi = function(req, res){
    var post = {
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password),
        role: req.body.role,
        tanggal_daftar: new Date()
    }

    var query = "SELECT email FROM ?? WHERE ?? = ?";
    var table = ["user", "email",post.email];

    query = mysql.format(query,table);

    connection.query(query, function(error, rows){
        if(error){
            console.log(error)
        }else{
            if(rows.length == 0){
                var query = "INSERT INTO ?? SET ?";
                var table = ["user"];
                query = mysql.format(query, table);
                connection.query(query, post, function(error, rows){
                    if(error){
                        console.log(error);
                    }else{
                        response.ok("Berhasil Menambahkan Data User", res);
                    }
                });
            }else{
                response.ok("Email Sudah Terdaftar", res)
            }
        }
    })
}

//controller login
exports.Login = function(req, res){
    var post = {
        password: req.body.password,
        username: req.body.username
    }

    var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    var table = ["user", "password", md5(post.password), "username", post.username];

    query = mysql.format(query,table);

    connection.query(query, function(error, rows){
        if(error){
            console.log(error);
        }else{
            if(rows != null || rows != 0){
                var token = jwt.sign({rows}, config.secret, {
                    expiresIn: 60*60*24
                });
    
                res.json({
                    success: true,
                    message: "Token tergenerate",
                    token: token
                });
            }else{
                 res.json({
                     "Error": true, 
                     "message":"Username atau Password salah"
                    });
            }
        }
    });
}

exports.halamanRahasia = function(req, res){
    response.ok("Halaman dengan akses role = 2", res);
}