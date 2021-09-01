const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
// const formidable = require('express-formidable');


//parse aplication/json
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());

//bodyParser yang baru
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

//panggil router
var router = require('./router');
router(app);

//daftarkan menu dari index middleware
// app.use('/auth', require('./middleware'));
// app.use('/auth', router);

app.listen(3000, () => {
    console.log(`Server started on port`);
});