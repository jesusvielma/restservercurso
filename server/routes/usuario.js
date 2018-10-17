const express = require('express')
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express()
const Usuario = require('../models/usuario');
const { verificarToken, adminRol } = require('../middlewares/autenticacion');

app.get('/usuario', verificarToken , (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limit = req.query.limit || 5;
    limit = Number(limit);

    Usuario.find({estado: true})
    .skip(desde)
    .limit(limit)
    .exec( (err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        Usuario.count({ estado: true }, (err,conteo) => {

            res.json({
                ok:true,
                usuarios,
                total: conteo
            })
        })

    } )
})

app.post('/usuario', [verificarToken,adminRol],function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre : body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        role: body.role
    })

    usuario.save( (err, usuarioDB) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    } )

})

app.put('/usuario/:id', [verificarToken,adminRol],function (req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['nombre','email','img','role','estado']);

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true} ,(err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.delete('/usuario/:id', [verificarToken,adminRol] ,function (req, res) {

    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, {estado: false}, {new: true} ,(err, borrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!borrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: borrado
        })
    })
})

module.exports = app;