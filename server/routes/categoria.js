const express = require('express');

const app = express();

let {verificarToken, adminRol} = require('../middlewares/autenticacion');

let Categoria = require('../models/categoria');

app.get('/categoria', (req,res) => {
    Categoria.find({})
    .sort('descripcion')
    .populate('usuario',['nombre','email'])
    .exec((err, resp) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categorias: resp,
        })

    })
})

app.get('/categoria/:id',(req,res) => {

    let id = req.params.id;
    Categoria.findById(id,(err, cat) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!cat){
            return res.status(400).json({
                ok: false,
                msg: "No se existe la categoria"
            })
        }

        res.json({
            ok: true,
            categoria: cat
        })
    })
})

app.post('/categoria',verificarToken, (req,res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err,resp) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!resp){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: resp
        })
    })
})

app.put('/categoria/:id', (req,res) => {

    let id = req.params.id;
    let body = req.body;

    let desc = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, desc, {
                new: true,
                runValidators: true,
                context: 'query'
            }, (err, resp) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!resp) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: resp
        })
    } )
})

app.delete('/categoria/:id', [verificarToken, adminRol], function (req, res) {

    let id = req.params.id;

    Categoria.findByIdAndUpdate(id, {
        estado: false
    }, {
        new: true
    }, (err, borrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!borrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            })
        }

        res.json({
            ok: true,
            usuario: borrado
        })
    })
})

module.exports = app