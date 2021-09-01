var response = require('../res');
const {Crud} = require('../utils/models');
const moment = require('moment');
var encrypt = require('md5');

exports.registerEmployee = async function(req, res){

    var first_name = req.body.first_name;
    var last_name = req.body.last_name
    var npwp = req.body.npwp;
    var id_company = req.body.id_company;
    var id_divisi = req.body.id_divisi;
    var id_hour = req.body.id_hour;
    var id_grade = req.body.id_grade;
    var id_struktur = req.body.id_struktur;
    var id_job_level = req.body.id_job_level;
    var nik = req.body.nik;
    var address = req.body.address;
    var id_prov = req.body.id_prov;
    var id_kab = req.body.id_kab;
    var id_kec = req.body.id_kec;
    var national = req.body.national;
    var phone = req.body.phone;
    var email =  req.body.email;
    var status = req.body.status;
    var role = req.body.role;
    var gaji = req.body.gaji;

    //cek inputan
    if(first_name == null || last_name == null || 
        npwp == null || id_company == null || id_divisi == null || 
        id_hour == null || id_grade == null ||
        id_struktur == null || id_job_level == null || nik == null || address == null ||
        id_prov == null || id_kab == null || id_kec == null || national == null || phone == null ||
        email == null || status == null || role == null || gaji == null)
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
        var emp = await Crud(`INSERT INTO employee (
            company,
            address,
            first_name,
            last_name,
            npwp,
            nik,
            divisi,
            grade,
            struktur,
            job_level,
            status,
            work_hour) VALUES (
                '${id_company}',
                '${id_address}',
                '${first_name}',
                '${last_name}',
                '${npwp}',
                '${nik}',
                '${id_divisi}',
                '${id_grade}',
                '${id_struktur}',
                '${id_job_level}',
                '${status}',
                '${id_hour}')`);

        var id_emp = emp.insertId;

        if(id_emp){
            var salary = await Crud(`INSERT INTO gaji (
                nilai,
                employee) VALUES (
                    '${gaji}',
                    '${id_emp}')`);
            
            if(salary){
                const password = 12345;
                var pw = encrypt(password);

                var pengguna = await Crud(`INSERT INTO user (
                    id_employee,
                    id_company,
                    username,
                    password,
                    role,
                    active) VALUES (
                        '${id_emp}',
                        '${id_company}',
                        '${email}',
                        '${pw}',
                        '${role}',
                        '${status}')`);
                 
                if(pengguna){
                    return response.ok("Registrasi Pengguna Berhasil",res);
                }else{
                    return response.ok("Registrasi Pengguna Gagal",res);
                }
            }else{
                return response.ok("Input Gaji Gagal",res);
            }
        }else{
            return response.ok("Input Employee Gagal",res);
        }
    }else{
        return response.ok("Input Address Employee Gagal",res);
    }
}



exports.updateEmployee = async function(req, res){
    var id_employee = req.params.id_emp
    var first_name = req.body.first_name;
    var last_name = req.body.last_name
    var npwp = req.body.npwp;
    var id_divisi = req.body.id_divisi;
    var id_hour = req.body.id_hour;
    var id_grade = req.body.id_grade;
    var id_struktur = req.body.id_struktur;
    var id_job_level = req.body.id_job_level;
    var nik = req.body.nik;
    var address = req.body.address;
    var id_prov = req.body.id_prov;
    var id_kab = req.body.id_kab;
    var id_kec = req.body.id_kec;
    var national = req.body.national;
    var phone = req.body.phone;
    var email =  req.body.email;
    var status = req.body.status;
    var role = req.body.role;
    var gaji = req.body.gaji;

    var cek_emp = await Crud(`SELECT 
    * FROM employee 
    WHERE id_employee = '${id_employee}'`);

    var id_address = cek_emp[0].address;

    var updateUser = await Crud(`UPDATE user 
    SET role = '${role}'
    WHERE id_employee = '${id_employee}'`);

    var updateGaji = await Crud(`UPDATE gaji 
    SET nilai = '${gaji}'
    WHERE employee = '${id_employee}'`);

    var emplys = await Crud(`UPDATE employee SET 
    first_name = '${first_name}', 
    last_name = '${last_name}', 
    npwp = '${npwp}', 
    nik = '${nik}', 
    divisi = '${id_divisi}', 
    work_hour = '${id_hour}', 
    grade = '${id_grade}',
    struktur = '${id_struktur}', 
    job_level = '${id_job_level}',
    status = '${status}' WHERE id_employee = '${id_employee}'`);

    var adds = await Crud(`UPDATE alamat SET 
    alamat = '${address}', 
    prov = '${id_prov}', 
    kab = '${id_kab}', 
    kec = '${id_kec}', 
    kenegaraan = '${national}', 
    telephone = '${phone}', 
    email = '${email}' WHERE id_address = '${id_address}'`);

    return response.ok("Berhasil Update Employee",res);
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