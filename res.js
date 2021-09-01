'use strict'; //mengecek/mengetatkan apakah kode js kita bear atau tidak;

exports.ok = function(value, res){
    var data = {
        'status':200,
        'values': value
    };

     res.json(data);
     res.end();
}

//respon untuk nested json
exports.jsonnested = function(value, res){
    //melakukan akumulasi hasil
    const hasil = value.reduce((akumulasikan, item)=>{
        //menentukan key group
        if(akumulasikan[item.nama]){
            //membuat variable grup nama mahasiswa
            const grup = akumulasikan[item.nama];

            //cek jika isi array adalah matakuliah
            if(Array.isArray(grup.matakuliah)){
                //tambahkan value ke dalam grup matakuliah

                grup.matakuliah.push(item.matakuliah);
            }else{
                grup.matakuliah = [grup.matakuliah, item.matakuliah];
            }
        }else{
            akumulasikan[item.nama] = item;
        }

        return akumulasikan;
    }, {});

    var data = {
        'status':200,
        'values': hasil
    };

     res.json(data);
     res.end();
}