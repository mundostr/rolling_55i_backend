import mongoose from 'mongoose'
import { Router } from 'express'
// Importamos el modelo para poder invocar a través de él los distintos métodos de consulta
import userModel from '../models/user.model.js'

import { body, validationResult } from 'express-validator'
import { createHash, isValidPassword } from '../utils.js'
import jwt from 'jsonwebtoken'

// Exportamos usersRoutes habilitando endpoints para las distintas operaciones deseadas
export const usersRoutes = ()  => {
    const router = Router()

    // Middleware de control de campos para body
    // Un middleware es una función que se "inyecta" en la cadena de ejecución de Express y hace uso de req, res y next.
    // Si aparece un problema en el proceso, "corta" la ejecución de la cadena con un return y el error correspondiente;
    // si todo se procesa ok, llama a next() para que Express continúe con el próximo "eslabón"
    const checkRequired = (requiredFields) => {
        return (req, res, next) => {
            for (const required of requiredFields) {
                if (!req.body.hasOwnProperty(required) || req.body[required].trim() === '') {
                    return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
                }
            }
            
            next()
        }
    }

    const checkRegistered = async (req, res, next) => {
        const userAlreadyRegistered = await userModel.findOne({ email: req.body.email })
        
        if (userAlreadyRegistered === null) {
            next()
        } else {
            res.status(400).send({ status: 'ERR', data: 'El email ya se encuentra registrado' })
        }
    }

    const checkReadyLogin = async (req, res, next) => {
        // res.local es un elemento ya disponible en el objeto res de Express
        // foundUser es un elemento nuevo de res.local que agregamos de nuestro lado
        // para almacenar el usuario recuperado y poder usarlo luego en el endpoint
        // Otra práctica común es agregar los datos en un nuevo objeto req.user
        res.locals.foundUser = await userModel.findOne({ email: req.body.email })
        
        if (res.locals.foundUser !== null) {
            // Si se encuentra un registro con ese mail, se continúa la cadena del endpoint
            next()
        } else {
            // caso contrario se devuelve un error
            res.status(400).send({ status: 'ERR', data: 'El email no se encuentra registrado' })
        }
    }

    const checkRoles = (requiredRoles) => {
        return (req, res, next) => {
            if (!requiredRoles.includes(req.loggedInUser.role)) return res.status(403).send({ status: 'ERR', data: 'No tiene autorización para acceder a este recurso' })
            
            next()
        }
    }

    // Este middleware verifica que se envíe un token en la solicitud y sea válido
    const verifyToken = (req, res, next) => {
        // Se obtiene el token desde los headers de la solicitud
        const headerToken = req.headers.authorization

        // Si no hay token se devuelve directamente un error 401
        if (!headerToken) return res.status(401).send({ status: 'ERR', data: 'Se requiere un token válido' })
        const token = headerToken.replace('Bearer ', '')

        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send({ status: 'ERR', data: 'El token ha expirado' })
                } else {
                    return res.status(401).send({ status: 'ERR', data: 'El token no es válido' })
                }
            }
            
            // En caso de llegar acá, significa que el token es válido y todo está ok, se sigue la cadena
            req.loggedInUser = decoded
            next()
        })
    }

    // Utilizamos la sintaxis de express-validator para controlar distintos aspectos de los elementos del body
    // Inyectaremos este middleware en el endpoint de registro de usuario
    const validateCreateFields = [
        body('name').isLength({ min: 2, max: 32 }).withMessage('El nombre debe tener entre 2 y 32 caracteres'),
        body('email').isEmail().withMessage('El formato de mail no es válido'),
        body('password').isLength({ min: 6, max: 12 }).withMessage('La clave debe tener entre 6 y 12 caracteres')
    ]

    // Utilizamos la sintaxis de express-validator para controlar distintos aspectos de los elementos del body
    // Inyectaremos este middleware en el endpoint de login de usuario
    const validateLoginFields = [
        body('email').isEmail().withMessage('El formato de mail no es válido'),
        body('password').isLength({ min: 6, max: 12 }).withMessage('La clave debe tener entre 6 y 12 caracteres')
    ]

    // Quita campos de un objeto en base a un array de no deseados
    const filterData = (data, unwantedFields) => {
        const { ...filteredData } = data
        unwantedFields.forEach(field => delete filteredData[field] )
        return filteredData
    }

    // Quita campos del req.body en base a un array de permitidos
    const filterAllowed = (allowedFields) => {
        return (req, res, next) => {
            req.filteredBody = {};
            
            for (const key in req.body) {
                if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key]
            }
            
            next()
        }
    }

    // Este endpoint queda solo como referencia
    // Normalmente en una colección de usuarios, no se recupera la lista completa
    router.get('/', async (req, res) => {
        try {
            // Como se mencionó, utilizando el modelo podemos acceder a los distintos métodos,
            // en este caso find() sin argumentos, nos retorna todos los registros de la colección
            const users = await userModel.find()
            
            res.status(200).send({ status: 'OK', data: users })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    // Aquí incorporamos el uso de paginado, esto es más habitual al trabajar con mayor cantidad de registros
    router.get('/paginated', async (req, res) => {
        try {
            // El método paginate() está disponible gracias al uso del módulo mongoose-paginate-v2
            // (ver user.mode.js para su habilitación). Mínimamente utilizaremos un offset y un limit
            // para indicar desde dónde comenzar a recuperar registros y cuántos
            // Podemos pasar un offset, por ej /api/users/paginated?offset=15
            const users = await userModel.paginate({}, { offset: req.query.offset || 0, limit: process.env.REQ_LIMIT || 50 })
            
            res.status(200).send({ status: 'OK', data: users })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    // Habilitamos también una ruta para recuperar datos de un único usuario mediante su _id
    // Express utiliza : en la url para indicar que el texto siguiente es el nombre de una variable (uid en este caso).
    // Para usar internamente su valor, lo accedemos mediante req.params.nombre_variable (req.params.uid)
    // Podemos utilizar más variables en la url, simplemente separándolas con barras /
    router.get('/one/:uid', async (req, res) => {
        try {
            // Importante siempre verificar los datos recibidos en request
            // En este caso estamos al menos controlando que el id enviado tenga un formato válido de MongoDB
            if (mongoose.Types.ObjectId.isValid(req.params.uid)) {
                const user = await userModel.findById(req.params.uid)

                if (user === null) {
                    res.status(404).send({ status: 'ERR', data: 'No existe usuario con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: user })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    // Esta es una ruta protegida por token
    // El middleware verifyToken chequeará que exista un token en la solicitud y sea válido
    router.get('/protected', verifyToken, (req, res) => {
        res.status(200).send({ status: 'OK', data: 'Se muestran los datos protegidos USER' })
    })

    // Esta es una ruta protegida por token y con rol de usuario
    // El middleware verifyToken chequeará que exista un token en la solicitud y sea válido,
    // luego checkRoles confirmará que el rol de usuario coincida con los permitidos
    router.get('/protected_adm', verifyToken, checkRoles(['admin']), (req, res) => {
        res.status(200).send({ status: 'OK', data: 'Se muestran los datos protegidos ADMIN' })
    })

    // Observar como estamos "inyectando" los middleware definidos arriba
    // De esta forma, al recibirse una solicitud en este endpoint, se ejecutará primero el "eslabón"
    // checkRequired, si todo está ok se continuará con validateCreateFields y luego checkRegistered.
    // En caso de algún problema en uno de los eslabones, la cadena se "cortará" ahí directamente,
    // devolviéndose el error que se indique en el propio middleware
    router.post('/', checkRequired(['name', 'email', 'password']), validateCreateFields, checkRegistered, async (req, res) => {
        // Ante todo chequeamos el validationResult del express-validator
        if (validationResult(req).isEmpty()) {
            try {
                // req es un parámetro inyectado por Express que contiene toda la información
                // relacionada a la solicitud (request)
                // res por su lado contiene todo lo relativo a la respuesta (response)
                
                // req.body permite acceder a los datos de usuario que se desea cargar, por supuesto
                // al "armar" el body del otro lado (en un formulario, postman, thunderclient, etc),
                // se deben especificar esos campos (name, email, password en este ejemplo)
                // por supuesto aquí falta un paso FUNDAMENTAL, que es la verificación de los datos
                const { name, email, password } = req.body
                
                // Aquí agregamos el hasheo de clave, ya que nunca debemos almacenar una clave "plana"
                const newUser = { name: name, email: email, password: createHash(password) }
                // Una vez organizado el nuevo usuario, invocamos el método create() para enviarlo a la base de datos
                const process = await userModel.create(newUser)
                
                res.status(200).send({ status: 'OK', data: process })
            } catch (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            }
        } else {
            res.status(400).send({ status: 'ERR', data: validationResult(req).array() })
        }
    })

    router.post('/login', checkRequired(['email', 'password']), validateLoginFields, checkReadyLogin, async (req, res) => {
        // Ante todo chequeamos el validationResult del express-validator
        if (validationResult(req).isEmpty()) {
            try {
                const foundUser = res.locals.foundUser
                
                // Si la clave es válida, la autenticación es correcta
                if (foundUser.email === req.body.email && isValidPassword(foundUser, req.body.password)) {
                    // Generamos un nuevo token tipo JWT y lo agregamos a foundUser para que sea enviado en la respuesta
                    foundUser._doc.token = jwt.sign({
                        userId: foundUser._id,
                        name: foundUser.name,
                        email: foundUser.email,
                        role: foundUser.role
                    }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
                    res.status(200).send({ status: 'OK', data: filterData(foundUser._doc, ['password']) })
                } else {
                    res.status(401).send({ status: 'ERR', data: 'Credenciales no válidas' })
                }
            } catch (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            }
        } else {
            res.status(400).send({ status: 'ERR', data: validationResult(req).array() })
        }
    })

    router.put('/:uid', filterAllowed(['name', 'email', 'password', 'avatar', 'role', 'cart']), async (req, res) => {
        try {
            const id = req.params.uid
            if (mongoose.Types.ObjectId.isValid(id)) {
                // Busca por ID, actualiza y retorna como resultado el objeto con los nuevos datos
                const userToModify = await userModel.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true })

                if (!userToModify) {
                    res.status(404).send({ status: 'ERR', data: 'No existe usuario con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: userToModify })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    router.delete('/:uid', async (req, res) => {
        try {
            const id = req.params.uid
            if (mongoose.Types.ObjectId.isValid(id)) {
                const userToDelete = await userModel.findOneAndDelete({ _id: id });

                if (!userToDelete) {
                    res.status(404).send({ status: 'ERR', data: 'No existe usuario con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: userToDelete })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    return router
}