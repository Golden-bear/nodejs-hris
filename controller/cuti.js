var response = require('../res');
const {Crud} = require('../utils/models');
const moment = require('moment');


exports.createCuti =  async function(req, res){
    var id_employee = req.body.id_employee;
    var id_jenis_cuti = req.body.id_jenis_cuti
    var tgl_mulai = req.body.tgl_mulai;
    var tgl_selesai = req.body.tgl_selesai;
    var keterangan = req.body.keterangan;
    var address = req.body.address;
    var jumlah_pakai = req.body.jumlah_pakai;
    var tingkat_approval = req.body.tingkat_approval;

    var cek_job = await Crud(`SELECT 
    divisi,
    job_level,
    company FROM employee 
    WHERE id_employee = '${id_employee}'`);

    if(cek_job.length == 0){
        return response.ok("Pegawai Tidak ditemukan",res);
    }

    var divisi = cek_job[0].divisi;
    var job_level = cek_job[0].job_level;
    var company = cek_job[0].company;

    var cek_atasan = await Crud(`SELECT 
    approval_id,
    disposisi FROM level_approval 
    WHERE divisi = '${divisi}' 
    AND job_level = '${job_level}' 
    AND tingkat = '${tingkat_approval}' 
    AND company = '${company}'`);

    if(cek_atasan.length == 0){
       return response.ok("Atasan Tidak ditemukan",res);
    }

    //apakah atasan mengalihkan ke disposisi atau tidak
    if(cek_atasan[0].disposisi == 0 || cek_atasan[0].disposisi == null){
        var approv = cek_atasan[0].approval_id;
    }else{
        var approv = cek_atasan[0].disposisi;
    }

    var cek_atasanDua = await Crud(`SELECT status FROM employee WHERE id_employee = '${approv}'`);
    if(cek_atasanDua[0].status == 0 || cek_atasanDua[0].status == "0"){
        return response.ok("Atasan Tidak aktif",res);
    }

    //cek stock cuti karyawan
    var cekStock = await Crud(`SELECT 
    jumlah_sisa_pemakaian,
    histori FROM employee_cuti WHERE 
    id_employee = '${id_employee}' AND id_jenis_cuti = '${id_jenis_cuti}'`);
    
    if(cekStock.length == 0){
        return response.ok("Pegawai Tidak Memiliki Stock Cuti Dengan Jenis Cuti Tersebut",res);
    }

    //cek apakah pengajuan tidak melebihi stock cuti
    if(cekStock[0].jumlah_sisa_pemakaian - jumlah_pakai < 0){
        //jika jumlah sisa kurang, cek ke histori
        if(cekStock[0].histori != null || cekStock[0].histori != 0){
            if(cekStock[0].histori - jumlah_pakai < 0){
                return response.ok("Jumlah pengajuan cuti melebihi batas",res);
            }
        }
    }

    //input ke table
    var getid_pesan = await Crud(`INSERT INTO absen_cuti (
        id_employee,
        id_jenis_cuti,
        tgl_mulai,
        tgl_selesai,
        keterangan,
        address,
        status_cuti,
        jumlah_pakai,
        tingkat_approval,
        approval_id) VALUES (
            '${id_employee}',
            '${id_jenis_cuti}',
            '${tgl_mulai}',
            '${tgl_selesai}',
            '${keterangan}',
            '${address}',
            '0',
            '${jumlah_pakai}',
            '${tingkat_approval}',
            '${approv}')`);


    var id_pesan = getid_pesan.insertId;

    var status_pesan = 0;
    var tanggal = moment().format('YYYY-MM-DD'); 

    if(id_pesan){
        var kirimPesan = await Crud(`INSERT INTO pesan (
            id_pesan,
            status,
            dari,
            kepada,
            flag,
            tanggal,
            tingkat,
            tipe) VALUES (
                '${id_pesan}',
                '${status_pesan}',
                '${id_employee}',
                '${approv}',
                '0',
                '${tanggal}',
                '${tingkat_approval}',
                '4')`);

        return response.ok("berhasil mengajukan cuti", res); 
    }else{
        return response.ok("gagal mengajukan cuti", res);
    }
};


exports.getByCompany = async function(req, res){
    var id_company = req.params.id; 
    
    var datas = await Crud(`SELECT 
    * FROM absen_cuti 
    JOIN employee 
    ON absen_cuti.id_employee = employee.id_employee 
    WHERE employee.company = '${id_company}'`);

    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};

exports.getByTingkatApproval = async function(req, res){
    var id_approval = req.params.id;

    var datas = await Crud(`SELECT 
    *, absen_cuti.address as address_cuti 
    FROM absen_cuti 
    JOIN employee 
    ON absen_cuti.id_employee = employee.id_employee 
    JOIN divisi 
    ON employee.divisi = divisi.id_divisi 
    WHERE absen_cuti.approval_id = '${id_approval}' 
    AND absen_cuti.status_cuti = 0`);
  
    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};

exports.getByDay = async function(req, res){
    var id_company = req.params.id;
    var dateStart = req.body.date_start;
    var dateEnd = req.body.date_end;

    if(dateStart != null && dateEnd != null){
        
        var datas = await Crud(`SELECT 
        *, absen_cuti.address as address_cuti 
        FROM absen_cuti 
        JOIN employee 
        ON absen_cuti.id_employee = employee.id_employee 
        JOIN divisi 
        ON employee.divisi = divisi.id_divisi 
        WHERE absen_cuti.tgl_mulai  
        BETWEEN '${dateStart}' AND '${dateEnd}'
        AND employee.company = '${id_company}'`);

        if(datas){
            return response.ok(datas, res);
        }else{
            return response.ok("error", res);
        }
    }else if(dateStart != null){
        var data = await Crud(`SELECT 
        *, absen_cuti.address as address_cuti 
        FROM absen_cuti 
        JOIN employee 
        ON absen_cuti.id_employee = employee.id_employee 
        JOIN divisi 
        ON employee.divisi = divisi.id_divisi 
        WHERE absen_cuti.tgl_mulai = '${dateStart}'
        AND employee.company = '${id_company}'`);

        if(data){
            return response.ok(data, res);
        }else{
            return response.ok("error", res);
        }
    }
  
        return response.ok("error", res);
    
};

exports.getAll = async function(req, res){
    var datas = await Crud(`SELECT * 
    FROM absen_cuti 
    JOIN employee ON absen_cuti.id_employee = employee.id_employee 
    JOIN divisi ON employee.divisi = divisi.id_divisi`);
  
    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};


exports.getPribadi = async function(req, res){
    var id_employee = req.params.id;
    var datas = await Crud(`SELECT 
    *, absen_cuti.address as address_cuti, e2.first_name as approval_fn, e2.last_name as approval_ln, employee.first_name,employee.last_name
    FROM absen_cuti 
    JOIN employee 
    ON absen_cuti.id_employee = employee.id_employee 
    JOIN employee as e2 
    ON absen_cuti.approval_id = e2.id_employee
    JOIN divisi 
    ON employee.divisi = divisi.id_divisi
    WHERE absen_cuti.id_employee = '${id_employee}'`);
  
    if(datas){
        return response.ok(datas, res);
    }else{
        return response.ok("error", res);
    }
};


exports.updateTingkatApprovalCuti = async function(req, res){
    var id_cuti = req.params.id_cuti;
    var status_cuti = req.body.status_cuti;
    var tanggal = moment().format('YYYY-MM-DD'); 

    if(status_cuti == null){
        return response.ok("Status Cuti Harus Di Isi", res)
    }

    var tampungData = await Crud(`SELECT * 
    FROM absen_cuti 
    JOIN employee 
    ON absen_cuti.id_employee = employee.id_employee 
    WHERE absen_cuti.id_absen_cuti = '${id_cuti}'`);

    
    //jika izin ditolak
    if(status_cuti != 1 || status_cuti != "1"){
        var upstatus = await Crud(`UPDATE 
        absen_cuti 
        SET status_cuti = '${status_cuti}' 
        WHERE id_absen_cuti = '${id_cuti}'`);

        var sendPesan = await Crud(`INSERT 
        INTO pesan (
            id_pesan,
            status,
            dari,
            kepada,
            flag,
            tanggal,
            tingkat,
            tipe) 
            VALUES (
                '${id_cuti}',
                '${status_cuti}',
                '${tampungData[0].approval_id}',
                '${tampungData[0].id_employee}',
                '0',
                '${tanggal}',
                '${tampungData[0].tingkat_approval}',
                '4')`);

        return response.ok("Cuti Ditolak", res)
    }

    var divisi = tampungData[0].divisi;
    var joblevel = tampungData[0].job_level;
    var company = tampungData[0].company;
    var jumlah_pakai = tampungData[0].jumlah_pakai;
    var id_jenis_cuti = tampungData[0].id_jenis_cuti;
    var approvLama = tampungData[0].approval_id;
    var id_emp = tampungData[0].id_employee;
    var incrementTingkat = tampungData[0].tingkat_approval + 1;

    
    var cekLevelApprovment = await Crud(`SELECT * 
    FROM level_approval 
    WHERE divisi = '${divisi}' 
    AND job_level = '${joblevel}' 
    AND company = '${company}' 
    AND tingkat = '${incrementTingkat}'`);

    
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

        var updateCuti = await Crud(`UPDATE absen_cuti 
        SET tingkat_approval = '${incrementTingkat}', approval_id = '${approv}' 
        WHERE id_absen_cuti = '${id_cuti}'`);

        var kirimPesan = await Crud(`INSERT 
        INTO pesan (
            id_pesan,
            status,
            dari,
            kepada,
            flag,
            tanggal,
            tingkat,
            tipe) VALUES (
                '${id_cuti}',
                '0',
                '${approvLama}',
                '${approv}',
                '0',
                '${tanggal}',
                '${incrementTingkat}',
                '4')`);

        return response.ok("Pengajuan Cuti Berhasil Di Update dan Dilanjutkan ke pihak selanjutnya", res);

    }


    //jika sudah sampai approval terakhir

    //kurangi stock cuti
    var cekStockCuti = await Crud(`SELECT jumlah_sisa_pemakaian, histori 
    FROM employee_cuti 
    WHERE id_employee = '${id_emp}' 
    AND id_jenis_cuti = '${id_jenis_cuti}'`);

    if(cekStockCuti[0].jumlah_sisa_pemakaian - jumlah_pakai >= 0){
        var sisaJsp = cekStockCuti[0].jumlah_sisa_pemakaian - jumlah_pakai

        var updateStockJsp = await Crud(`UPDATE employee_cuti 
        SET jumlah_sisa_pemakaian = '${sisaJsp}'
        WHERE id_employee = '${id_emp}'
        AND id_jenis_cuti = '${id_jenis_cuti}'`);

    }else if(cekStockCuti[0].histori - jumlah_pakai >= 0){
        var sisaHis = cekStockCuti[0].histori - jumlah_pakai

        var updateHis =  await Crud(`UPDATE employee_cuti 
        SET histori = '${sisaHis}'
        WHERE id_employee = '${id_emp}'
        AND id_jenis_cuti = '${id_jenis_cuti}'`);
    }

    var updateStatusCuti =  await Crud(`UPDATE absen_cuti 
    SET status_cuti = '${status_cuti}'
    WHERE id_absen_cuti = '${id_cuti}'`);

    var kirimPesanToEmployee = await Crud(`INSERT 
    INTO pesan (
        id_pesan,
        status,
        dari,
        kepada,
        flag,
        tanggal,
        tingkat,
        tipe) VALUES (
            '${id_cuti}',
            '${status_cuti}',
            '${approvLama}',
            '${id_emp}',
            '0',
            '${tanggal}',
            '${tampungData[0].tingkat_approval}',
            '4')`);

    return response.ok("Cuti disetujui", res);

}


