var express = require('express');
var auth = require('./auth');
var router = express.Router();
var verifikasi = require('./verifikasi');
//menu registrasi
router.post('/registrasi', auth.registrasi);

//endpoint login
router.post('/v1/login', auth.Login);

//alamat yang perlu authorizazion
router.get('/api/rahasia', verifikasi(2), auth.halamanRahasia);

module.exports = router;