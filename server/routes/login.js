const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

const jwt = require('jsonwebtoken');

const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req,res) => {

    let body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB)=> {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    msg: "Usuario o contraseña incorrectos"
                }
            })
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: "Usuario o contraseña incorrectos"
                }
            })
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.TOKEN_SEED, {
            expiresIn: process.env.TOKEN_EXPIRES
        })

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })
});

async function verify(token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async (req, res) => {

    let googleToken = req.body.idtoken;

    let googleUser = await verify(googleToken)
    .catch(err => {
        res.status(403).json({
            ok:false,
            err
        })
    });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB)=> {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (usuarioDB ) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok:false,
                    err: {
                        msg: 'Debes usar la autenticación normal'
                    }
                })
            }else{
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.TOKEN_SEED, {
                    expiresIn: process.env.TOKEN_EXPIRES
                })
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        }else {
            //crear al usuario
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err,udb)=> {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
            })

            let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.TOKEN_SEED, {
                expiresIn: process.env.TOKEN_EXPIRES
            })
            return res.json({
                ok: true,
                usuario: usuarioDB,
                token
            })
        }

    })
    /* res.json({
        usuario: googleUser
    }) */

});

module.exports = app;