'use strict';



module.exports = function(app){
  const formidable = require('formidable');
    var wilayah = require('./controller/wilayah');
    var divisi = require('./controller/divisi');
    var izin = require('./controller/izin');
    var cuti = require('./controller/cuti');
    var auth = require('./middleware/auth');
    var absen = require('./controller/absen');
    var user = require('./controller/user');
    var company = require('./controller/company');
    var verifikasi = require('./middleware/verifikasi');
    const { upload } = require('./middleware/upload');

    app.route('/').get(wilayah.index);

    app.route('/wilayahkab').get(wilayah.tampilKabupaten);
    app.route('/kabupatenbyprov/:id').get(wilayah.tampilKabupatenByProv);

    app.route('/wilayahkec').get(wilayah.tampilKecamatan);
    app.route('/kecamatanbykab/:id').get(wilayah.tampilKecamatanByKab);

    app.route('/wilayahprov').get(wilayah.tampilProvinsi);

    app.route('/wilayahdes').get(wilayah.tampilDesa);

    app.route('/tampilid/:id').get(wilayah.tampilID);

    app.route('/tampiljoin').get(wilayah.tampilGroup);

 
    app.route('/registrasi').post(auth.registrasi);
    app.route('/v1/login').post(auth.Login);

    app.route('/generate').get(absen.generateAbsen);

    //MENGGUNAKAN JWT
    //tes halaman by jwt
    app.route('/api/rahasia').get(verifikasi(),auth.halamanRahasia);

    //divisi
    app.route('/divisi').get(verifikasi(),divisi.tampilDivisi);
    app.route('/divisibyid/:id').get(verifikasi(),divisi.tampilDivisiById);
    app.route('/divisi').post(verifikasi(),divisi.tambahDivisi);
    app.route('/divisidelete/:id').delete(verifikasi(),divisi.deleteDivisi);
    app.route('/divisiupdate/:id').put(verifikasi(),divisi.updateDivisi);

    //izin
    app.route('/izin/:id').post(verifikasi(),izin.createIzin);

    app.route('/izinbycompany/:id').get(verifikasi(),izin.getByCompany);
    app.route('/updateizin/:id_izin').post(verifikasi(),izin.updateTingkatApproval);
    app.route('/izinbytingkat/:id').get(verifikasi(),izin.getByApproval);

    //absen
    app.route('/masuk').post(verifikasi(),upload('photo'),absen.absenIN);

    //cuti
    app.route('/cuti').post(verifikasi(),cuti.createCuti); 
    app.route('/cuti').get(verifikasi(),cuti.getAll);
    app.route('/cuti/:id').get(verifikasi(),cuti.getByCompany);
    app.route('/cuti/bytingkat/:id').get(verifikasi(),cuti.getByTingkatApproval);
    app.route('/cuti/filter/:id').post(verifikasi(),cuti.getByDay);
    app.route('/cuti/bypribadi/:id').get(verifikasi(),cuti.getPribadi);
    app.route('/cuti/updateapproval/:id_cuti').put(verifikasi(),cuti.updateTingkatApprovalCuti);

    //registrasi user
    app.route('/employeeid/:id_emp').get(verifikasi(),user.getByid);
    app.route('/employeebycompany/:id_company').get(verifikasi(),user.getByCompany);
    app.route('/daftaremployee').post(verifikasi(),user.registerEmployee);
    app.route('/employeeupdate/:id_emp').put(verifikasi(),user.updateEmployee);  
    app.route('/employeedelete/:id_emp').delete(verifikasi(),user.deleteEmployee); 
    
    //company
    app.route('/regcompany').post(verifikasi(),company.registerCompany);
}




