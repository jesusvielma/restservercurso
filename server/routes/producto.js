const express = require('express');

const app = express();

let {verificarToken} = require('../middlewares/autenticacion');

let Producto = require('../models/producto');

//==============================
// Obtener productos
//==============================

app.get('/productos', verificarToken,(req,res) => {
    //Todos 
    //populate 
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({disponible: true})
    .limit(5)
    .skip(desde)
    .populate('categoria',['descripcion'])
    .populate('usuario',['nombre'])
    .exec((err,productos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productos) {
            return res.status(400).json({
                ok: false,
                msg: 'No hay productos'
            })
        }
        res.json({
            ok: true,
            productos: productos
        })
    })
})

//==============================
// Obtener por id
//==============================

app.get('/productos/:id', verificarToken,(req, res) => {
    //populate
    let id = req.params.id;
    Producto.findById(id)
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre')
    .exec((err, db)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!db) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe el producto'
            })
        }
        res.json({
            ok: true,
            productos: db
        })
    })

})

//==============================
// Buscar producto
//==============================

app.get('/productos/buscar/:termino',verificarToken ,(req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino,'i');

    Producto.find({nombre: regex})
    .populate('categoria', ['descripcion'])
    .exec((err, productos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            productos,
        })
    })
})

//==============================
// Crear producto
//==============================

app.post('/productos', verificarToken ,(req,res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err,resp) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!resp) {
            return res.status(400).json({
                ok: false,
                msg: 'No se ha creado el producto en base de datos'
            })
        }

        res.json({
            ok: true,
            producto: resp
        })
    })

})

//==============================
// Actualizar
//==============================
app.put('/productos/:id', verificarToken,(req,res)=> {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, db) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!db) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'No se ha creado el producto en base de datos'
                }
            })
        }

        db.nombre = body.nombre;
        db.descripcion = body.descripcion;
        db.precioUni = body.precio;
        db.disponible = body.disponible;
        db.categoria = body.categoria;
        db.save((err, saved) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok:true,
                producto: saved
            })
        })
    })
})

//==============================
// Deshabilitado
//==============================
app.delete('/productos/:id', verificarToken,(req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, db) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!db) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'No existe no producto'
                }
            })
        }

        db.disponible = false;

        db.save((err, ac)=> {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                err: {
                    msg: 'Producto deshabilitado'
                }
            })
        })
    })
})
module.exports = app