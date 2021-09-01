var response = require('../res');
const {Crud} = require('../utils/models');
const moment = require('moment');


exports.createIzin =  async function(req, res){
    var id_company = req.params.id;
    var id_employee = req.body.id_employee;
    var jam_izin = req.body.jam_izin;
    var tgl_izin = req.body.tgl_izin;
    var keterangan = req.body.keterangan;
    var tingkat_approval = req.body.tingkat_approval;

    console.log(id_company,id_employee,jam_izin,tgl_izin,keterangan)

    var cek_job = await Crud(`SELECT divisi,job_level,company FROM employee WHERE id_employee = '${id_employee}' AND company = '${id_company}'`);
    if(cek_job.length == 0){
        return response.ok("Pegawai Tidak ditemukan",res);
    }

    var divisi = cek_job[0].divisi;
    var job_level = cek_job[0].job_level;
    var company = cek_job[0].company;

    var cek_atasan = await Crud(`SELECT approval_id,disposisi FROM level_approval WHERE divisi = '${divisi}' AND job_level = '${job_level}' AND tingkat = '${tingkat_approval}' AND company = '${company}'`);
    if(cek_atasan.length == 0){
       return response.ok("Atasan Tidak ditemukan",res);
    }

    if(cek_atasan[0].disposisi == 0 || cek_atasan[0].disposisi == null){
        var approv = cek_atasan[0].approval_id;
    }else{
        var approv = cek_atasan[0].disposisi;
    }

    var cek_atasanDua = await Crud(`SELECT status FROM employee WHERE id_employee = '${approv}'`);
    if(cek_atasanDua[0].status == 0 || cek_atasanDua[0].status == "0"){
        return response.ok("Atasan Tidak aktif",res);
    }

    var getid_pesan = await Crud(`INSERT INTO izin (id_employee,jam_izin,tgl_izin,keterangan,status_izin,tingkat_approval,approval_id,id_company) VALUES ('${id_employee}','${jam_izin}','${tgl_izin}','${keterangan}','0','${tingkat_approval}','${approv}','${id_company}')`);
    
    var id_pesan = getid_pesan.insertId;

    var status_pesan = 0;

    if(id_pesan){
        var kirimPesan = await Crud(`INSERT INTO pesan (id_pesan,status,dari,kepada,flag,tanggal,tingkat,tipe) VALUES ('${id_pesan}','${status_pesan}','${id_employee}','${approv}','0','${tgl_izin}','${tingkat_approval}','3')`);
        return response.ok("berhasil izin", res); 
    }else{
        return response.ok("gagal izin", res);
    }
};


exports.getByCompany = async function(req, res){
    var id_company = req.params.id; 
    
    var datas = await Crud(`SELECT * FROM izin JOIN employee ON izin.id_employee = employee.id_employee WHERE izin.id_company = '${id_company}'`);

    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};

exports.updateTingkatApproval = async function(req, res){
    var id_izin = req.params.id_izin;
    var status_izin = req.body.status_izin;
    var tampungData = await Crud(`SELECT * FROM izin JOIN employee ON izin.id_employee = employee.id_employee WHERE izin.id_izin = '${id_izin}'`);

    
    var tanggal = moment().format('YYYY-MM-DD'); 
    //jika izin ditolak
    if(status_izin != 1 || status_izin != "1"){
        var upstatus = await Crud(`UPDATE izin SET status_izin = '${status_izin}' WHERE id_izin = '${id_izin}'`);

        var sendPesan = await Crud(`INSERT INTO pesan (id_pesan,status,dari,kepada,flag,tanggal,tingkat,tipe) VALUES ('${id_izin}','${status_izin}','${tampungData[0].approval_id}','${tampungData[0].id_employee}','0','${tanggal}','${tampungData[0].tingkat_approval}','3')`);

        return response.ok("Izin Ditolak", res)
    }

    var divisi = tampungData[0].divisi;
    var joblevel = tampungData[0].job_level;
    var company = tampungData[0].company;
    var incrementTingkat = tampungData[0].tingkat_approval + 1;

    var cekLevelApprovment = await Crud(`SELECT * FROM level_approval WHERE divisi = '${divisi}' AND job_level = '${joblevel}' AND company = '${company}' AND tingkat = '${incrementTingkat}'`);

    
    if(cekLevelApprovment.length != 0){
        //jika pengapprove mengaktifkan disposisi
        if(cekLevelApprovment[0].disposisi == 0 || cekLevelApprovment[0].disposisi == "0" || cekLevelApprovment[0].disposisi == null){
            var approv = cekLevelApprovment[0].approval_id
        }else{
            var approv = cekLevelApprovment[0].disposisi
        }

        var cekStatus = await Crud(`SELECT status FROM employee WHERE id_employee = '${approv}'`);

        //jika status atasan tidak aktif
        if(cekStatus[0].status == 0){
            return response.ok("Atasan Tidak Aktif", res);
        }

        var updateIzin = await Crud(`UPDATE izin SET tingkat_approval = '${incrementTingkat}', approval_id = '${approv}' WHERE id_izin = '${id_izin}'`);

        var kirimPesan = await Crud(`INSERT INTO pesan (id_pesan,status,dari,kepada,flag,tanggal,tingkat,tipe) VALUES ('${id_izin}','0','${tampungData[0].approval_id}','${approv}','0','${tanggal}','${incrementTingkat}','3')`);

        return response.ok("Pengajuan Izin Berhasil Di Update dan Dilanjutkan ke pihak selanjutnya", res);

    }

    //jika sudah sampai approval terakhir
    var updateStatusIzin = await Crud(`UPDATE izin SET status_izin = '${status_izin}' WHERE id_izin = '${id_izin}'`);

    var kirimPesanToEmployee = await Crud(`INSERT INTO pesan (id_pesan,status,dari,kepada,flag,tanggal,tingkat,tipe) VALUES ('${id_izin}','${status_izin}','${tampungData[0].approval_id}','${tampungData[0].id_employee}','0','${tanggal}','${tampungData[0].tingkat_approval}','3')`);

    return response.ok("Izin di setujui", res);

}


exports.getByApproval = async function(req, res){
    var id_approval = req.params.id;
    var datas = await Crud(`SELECT * FROM izin JOIN employee ON izin.id_employee = employee.id_employee JOIN divisi ON employee.divisi = divisi.id_divisi WHERE izin.approval_id = '${id_approval}' AND izin.status_izin = 0`);
  
    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};

exports.getAll = async function(req, res){
    var datas = await Crud(`SELECT * FROM izin JOIN employee ON izin.id_employee = employee.id_employee JOIN divisi ON employee.divisi = divisi.id_divisi`);
  
    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};