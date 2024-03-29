const jwt = require('jsonwebtoken');
const config = require('../config/secret');

function verifikasi(){
    return function(req, rest, next){
        //cek authorization header
        var tokenWithBearer = req.headers['appsession'];
        if(tokenWithBearer){
            var token = tokenWithBearer.split(' ')[1];
            
            //verifikasi
            jwt.verify(token, config.secret, function(err, decoded){
                
                if(err){
                    return rest.status(401).send({auth: false, message: err});
                }else{
                    console.log(decoded.rows[0].id); //untuk mengambil salah satu data dalam object
                    req.auth= decoded;
                    next();
                }
            });
        }else{
            return rest.status(401).send({auth: false, message:"Token tidak tersedia"});
        }
    }
}

module.exports = verifikasi;