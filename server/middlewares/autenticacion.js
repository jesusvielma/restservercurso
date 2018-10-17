const jwt = require('jsonwebtoken');
//==============================
// Verficar token
//==============================

let verificarToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token,process.env.TOKEN_SEED,(err,decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    msg: "Token no valido"
                }
            })
        }

        req.usuario = decoded.usuario
        next();
    })

    // res.json({
    //     token
    // })

}

//==============================
// Verifica rol de usuario 
//==============================

let adminRol = (req, res, next) => {
    let rol = req.usuario.role
    
    if(rol !== 'ADMIN_ROLE'){
        return res.status(401).json({
            ok: false,
            err: {
                msg: "No ADMIN_ROLE"
            }
        })
    }

    next();
}

module.exports = {
    verificarToken,
    adminRol
}