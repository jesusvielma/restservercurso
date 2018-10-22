const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function (req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
        .json({
            ok:false,
            err: {
                msg: 'No files were uploaded.'
            }
        });
    }

    //==============================
    // validar tipo
    //==============================

    let tipos = ['productos','usuarios'];

    if(tipos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            msg: 'Tipos permitidos: ' + tipos.join(', ')
        })
    }

    let archivo = req.files.archivo;
    //==============================
    // Extesiones permitidas 
    //==============================

    let extPermitidas = ['png','jpg','gif','jpeg'];
    let nombreArchivo = archivo.name.split('.');
    let ext = nombreArchivo[nombreArchivo.length - 1];

    if(extPermitidas.indexOf(ext) < 0){
        return res.status(400).json({
            ok:false,
            msg: 'Extensiones validas '+extPermitidas.join(', '),
            ext
        })
    }

    //==============================
    // Filename 
    //==============================
    let fileName = `${id}-${new Date().getMilliseconds()}.${ext}`

    archivo.mv(`uploads/${tipo}/${fileName}`, (err) => {
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(tipo == 'usuarios'){
            imagenUsuario(id, res, fileName);
        }else{
            imagenProducto(id, res, fileName);
        }

    });

});

function imagenUsuario(id,res, fileName) {
    Usuario.findById(id, (err, db) => {
        if(err){
            borrarArchivo(fileName, 'usuarios');
            return res.status(500)
            .json({
                ok: false,
                err
            })
        }

        if(!db){
            borrarArchivo(fileName, 'usuarios');
            return res.status(400)
            .json({
                ok: false,
                err: {
                    msg: 'El usuario no existe'
                }
            })
        }

        borrarArchivo(db.img,'usuarios');

        db.img = fileName;

        db.save((err, db) => {
            res.json({
                ok:true,
                usuario: db,
                img: fileName
            })
        })
    })
}

function imagenProducto(id, res, fileName) {
    Producto.findById(id, (err, db) => {
        if (err) {
            borrarArchivo(fileName, 'productos');
            return res.status(500)
                .json({
                    ok: false,
                    err
                })
        }

        if (!db) {
            borrarArchivo(fileName, 'productos');
            return res.status(400)
                .json({
                    ok: false,
                    err: {
                        msg: 'El usuario no existe'
                    }
                })
        }

        borrarArchivo(db.img, 'productos');

        db.img = fileName;

        db.save((err, db) => {
            res.json({
                ok: true,
                usuario: db,
                img: fileName
            })
        })
    })
}


function borrarArchivo(fileName, tipo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${ fileName }`);

    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
}

module.exports = app;