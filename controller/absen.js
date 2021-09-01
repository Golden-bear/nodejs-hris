var response = require('../res');
const {Crud} = require('../utils/models');
const moment = require('moment');

// const getIdAbsen = async (id_pegawai) =>{
//     var tanggal = moment().format('YYYY-MM-DD'); 

//     var idAbsen = await Crud(`SELECT * FROM absen WHERE id_pegawai = '${id_pegawai}' AND tanggal_in = '${tanggal}' `);

//     return idAbsen;
// }

exports.generateAbsen = async function(req, res){
    var employee = await Crud('SELECT * FROM employee');
    var tanggal = moment().format('YYYY-MM-DD'); 
    // employee.forEach(e => {
    //     const add = await Crud(`INSERT INTO absen (id_pegawai,company,tanggal_in,keterangan) VALUES ('${e.id_employee}','${e.company}','${tanggal}','a')`)
    // });

    for (let e of employee) {
        const add = await Crud(`INSERT INTO absen (id_pegawai,company,tanggal_in,keterangan) VALUES ('${e.id_employee}','${e.company}','${tanggal}','a')`);     
    }

    response.ok("absen berhasil di generate", res)
}

exports.uploadFile = function(req, res){
    const image = req.file.path

    response.ok(image, res);
}

exports.absenIN = async function(req, res){
    var tanggal = moment().format('YYYY-MM-DD'); 
    var id_employee = req.body.id_employee;
    var caption_in = req.body.caption_in;
    var long_in = req.body.long_in;
    var lat_in = req.body.lat_in;
    var waktu = moment().format('h:mm:ss');
    var status = 0;
    var tingkat_approval = 1;
    var tipe = 1;
    const image = req.file.filename

    // console.log(req.body);
    return console.log(image, id_employee, caption_in, long_in);
    
    if(!id_employee || !caption_in || !long_in || !lat_in || !image){
         return res.json({
             status: 404,
             message: "data tidak lengkap"
         });
    }

    var emp = await Crud(`SELECT * FROM employee WHERE id_employee = '${id_employee}'`);

    var idAbsen = await Crud(`SELECT * FROM absen WHERE id_pegawai = '${id_pegawai}' AND tanggal_in = '${tanggal}' `);

    var id_absen = idAbsen[0].id;
    var divisi = emp[0].divisi;
    var joblevel = emp[0].job_level;
    var company = emp[0].company;

    var cek_atasan = await Crud(`SELECT approval_id,disposisi FROM level_approval WHERE divisi = '${divisi}' AND job_level = '${joblevel}' AND tingkat = '${tingkat_approval}' AND company = '${company}'`); 
    
    if(cek_atasan.length == 0){
        return response.ok("Atasan Tidak ditemukan",res);
     }

     if(cek_atasan[0].disposisi == 0 || cek_atasan[0].disposisi == null){
        var approv = cek_atasan[0].approval_id;
    }else{
        var approv = cek_atasan[0].disposisi;
    }

    //cek atasan aktif atau tidak
    var cek_atasanDua = await Crud(`SELECT status FROM employee WHERE id_employee = '${approv}'`);
    if(cek_atasanDua[0].status == 0 || cek_atasanDua[0].status == "0"){
        return response.ok("Atasan Tidak aktif",res);
    }

    var updateAbsen = await Crud(`UPDATE absen SET 
    absen_in = '${waktu}', 
    caption_in = '${caption_in}', 
    lat_in = '${lat_in}', 
    long_in = '${long_in}', 
    status_in = '${status}', 
    tingkat_approval_in = '${tingkat_approval}', 
    approval_id_in = '${approv}',
    foto_in = '${image}' WHERE id = '${id_absen}'`);
    

    if(updateAbsen){
        var kirimPesan = await Crud(
            `INSERT INTO pesan (id_pesan,status,dari,kepada,flag,tanggal,tingkat,tipe)
             VALUES ('${id_absen}','${status}','${id_employee}','${approv}','0','${tanggal}','${tingkat_approval}','${tipe}')`);
        return response.ok("berhasil absen masuk", res); 
    }else{
        return response.ok("gagal absen masuk", res);
    }


}