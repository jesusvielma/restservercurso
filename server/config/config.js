//=========================
// Puerto 
//=========================

process.env.PORT = process.env.PORT || 3000

//=========================
// Entorno
//=========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=========================
// Base de datos
//=========================

let urlDB; 
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//=========================
// Token expires
//=========================

process.env.TOKEN_EXPIRES = 60 * 60 * 24 * 30;


//=========================
// Token Seed
//=========================

process.env.TOKEN_SEED = process.env.TOKEN_SEED  ||'este-es-el-seed-desarollo'

//==============================
// Google client ID
//==============================

process.env.CLIENT_ID = process.env.CLIENT_ID || '680161567222-fiumfhl1stlpbcc2q9voj5st16a33but.apps.googleusercontent.com';