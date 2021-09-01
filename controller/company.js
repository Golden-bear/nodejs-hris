var response = require('../res');
const {Crud} = require('../utils/models');
const moment = require('moment');
var encrypt = require('md5');

exports.registerCompany = async function(req, res){

    var password = req.body.password;
    var company_name = req.body.company_name;
    var address = req.body.address;
    var id_prov = req.body.id_prov;
    var id_kab = req.body.id_kab;
    var id_kec = req.body.id_kec;
    var national = req.body.national;
    var phone = req.body.phone;
    var email =  req.body.email;
    var tanggal = moment().format('YYYY-MM-DD'); 
    //cek inputan
    if(password == null || company_name == null ||address == null ||
        id_prov == null || id_kab == null || id_kec == null || national == null || phone == null ||
        email == null)
    {

            return response.ok("Data Tidak Lengkap",res);
    }


    //cek email
    var cek_username = await Crud(`SELECT 
    username
    FROM user 
    WHERE username = '${email}'`);

    if(cek_username.length != 0){
        return response.ok("Username Sudah Terdaftar",res);
    }

    var adds = await Crud(`INSERT INTO alamat (
        alamat,
        prov,
        kab,
        kec,
        kenegaraan,
        telephone,
        email) VALUES (
            '${address}',
            '${id_prov}',
            '${id_kab}',
            '${id_kec}',
            '${national}',
            '${phone}',
            '${email}')`);
    
    var id_address = adds.insertId;

    if(id_address){
        var comp = await Crud(`INSERT INTO company (
            name,
            id_address,
            active,
            created_date) VALUES (
                '${company_name}',
                '${id_address}',
                '1',
                '${tanggal}')`);

        var id_comp = comp.insertId;

        if(id_comp){
                var pw = encrypt(password);

                var pengguna = await Crud(`INSERT INTO user (
                    id_employee,
                    id_company,
                    username,
                    password,
                    role,
                    active) VALUES (
                        '0',
                        '${id_comp}',
                        '${email}',
                        '${pw}',
                        '2',
                        '1')`);
                 
                if(pengguna){
                    return response.ok("Registrasi Company Berhasil",res);
                }else{
                    return response.ok("Registrasi Company Gagal",res);
                }
        }else{
            return response.ok("Input Company Gagal",res);
        }
    }else{
        return response.ok("Input Address Company Gagal",res);
    }
}



exports.updateEmployee = async function(req, res){
    var id_company = req.params.id_comp
    var password = req.body.password;
    var company_name = req.body.company_name;
    var address = req.body.address;
    var id_prov = req.body.id_prov;
    var id_kab = req.body.id_kab;
    var id_kec = req.body.id_kec;
    var national = req.body.national;
    var phone = req.body.phone;
    var email =  req.body.email;
    var tanggal = moment().format('YYYY-MM-DD'); 

    var pw = encrypt(password);

    var cek_uname = await Crud(`SELECT 
    * FROM user`);

    if(cek_uname.length > 1){

    }
    var cek_comp = await Crud(`SELECT 
    * FROM company 
    WHERE id = '${id_company}'`);

    var companyLama =  cek_comp[0].id;
    var id_address = cek_comp[0].id_address;

    var updateCompany = await Crud(`UPDATE company SET 
    company_name = '${company_name}' WHERE id = '${id_company}'`);

    var adds = await Crud(`UPDATE alamat SET 
    alamat = '${address}', 
    prov = '${id_prov}', 
    kab = '${id_kab}', 
    kec = '${id_kec}', 
    kenegaraan = '${national}', 
    telephone = '${phone}', 
    email = '${email}' WHERE id_address = '${id_address}'`);

    return response.ok("Berhasil Update Company",res);
}

exports.deleteEmployee = async function(req, res){
    var id_employee = req.params.id_emp

    var cek_emp = await Crud(`SELECT 
    * FROM employee 
    WHERE id_employee = '${id_employee}'`);

    var id_address = cek_emp[0].address;

    var adds = await Crud(`DELETE 
    FROM alamat 
    WHERE id_address = '${id_address}'`);

    var gaji = await Crud(`DELETE 
    FROM gaji 
    WHERE employee = '${id_employee}'`);

    var user = await Crud(`DELETE 
    FROM user 
    WHERE id_employee = '${id_employee}'`);

    var emp = await Crud(`DELETE 
    FROM employee 
    WHERE id_employee = '${id_employee}'`);

    return response.ok("Employee berhasil dihapus",res)
}

exports.getByid = async function(req, res){
    var id_employee = req.params.id_emp

    var emp = await Crud(`SELECT 
    *, wilayah_kecamatan.nama as nama_kecamatan, wilayah_kabupaten.nama as nama_kabupaten, wilayah_provinsi.nama as nama_provinsi
    FROM employee 
    JOIN alamat 
    ON employee.address = alamat.id_address 
    JOIN wilayah_kecamatan
    ON alamat.kec = wilayah_kecamatan.id
    JOIN wilayah_kabupaten 
    ON alamat.kab = wilayah_kabupaten.id
    JOIN wilayah_provinsi 
    ON alamat.prov = wilayah_provinsi.id
    WHERE employee.id_employee = '${id_employee}'`);

    return response.ok(emp,res)
}

exports.getByCompany = async function(req, res){
    var id_company = req.params.id_company

    var emp = await Crud(`SELECT 
    *, wilayah_kecamatan.nama as nama_kecamatan, wilayah_kabupaten.nama as nama_kabupaten, wilayah_provinsi.nama as nama_provinsi
    FROM employee 
    JOIN alamat 
    ON employee.address = alamat.id_address 
    JOIN wilayah_kecamatan
    ON alamat.kec = wilayah_kecamatan.id
    JOIN wilayah_kabupaten 
    ON alamat.kab = wilayah_kabupaten.id
    JOIN wilayah_provinsi 
    ON alamat.prov = wilayah_provinsi.id
    WHERE employee.company = '${id_company}'`);

    return response.ok(emp,res)
}