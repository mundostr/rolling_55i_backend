import mongoose from 'mongoose'
import { Router } from 'express'
// Importamos el modelo para poder invocar a través de él los distintos métodos de consulta
import userModel from '../models/user.model.js'

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
            const users = await userModel.paginate({}, { offset: 0, limit: process.env.REQ_LIMIT || 50 })
            
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

    // Observar como estamos "inyectando" el middleware checkRequired que hemos definido más arriba
    // De esta forma, al recibirse una solicitud en este endpoint, se ejecutará primero el "eslabón"
    // checkRequired y si todo está ok, se continuará luego con el contenido de la función del endpoint
    // Para este ejemplo el middleware nos permite verificar que el body recibido contenga los elementos
    // name, email y password, y que éstos no estén vacíos
    router.post('/', checkRequired(['name', 'email', 'password']), async (req, res) => {
        try {
            // req es un parámetro inyectado por Express que contiene toda la información
            // relacionada a la solicitud (request)
            // res por su lado contiene todo lo relativo a la respuesta (response)
            
            // req.body permite acceder a los datos de usuario que se desea cargar, por supuesto
            // al "armar" el body del otro lado (en un formulario, postman, thunderclient, etc),
            // se deben especificar esos campos (name, email, password en este ejemplo)
            // por supuesto aquí falta un paso FUNDAMENTAL, que es la verificación de los datos
            const { name, email, password } = req.body
            
            // Nos falta aquí un detalle importante que agregaremos pronto: hashear la clave
            const newUser = { name: name, email: email, password: password }
            // Una vez organizado el nuevo usuario, invocamos el método create() para enviarlo a la base de datos
            const process = await userModel.create(newUser)
            
            res.status(200).send({ status: 'OK', data: process })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    router.put('/', async (req, res) => {
        try {
            res.status(200).send({ status: 'OK', data: 'Quiere hacer un PUT' })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    router.delete('/', async (req, res) => {
        try {
            res.status(200).send({ status: 'OK', data: 'Quiere hacer un DELETE' })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    return router
}