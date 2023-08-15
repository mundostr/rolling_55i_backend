import { Router } from 'express'
// Importamos el modelo para poder invocar a través de él los distintos métodos de consulta
import userModel from '../models/user.model.js'

// Exportamos usersRoutes habilitando endpoints para las 4 operaciones principales (GET, POST, PUT, DELETE) 
export const usersRoutes = ()  => {
    const router = Router()

    // CReadUD
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

    // CreateRUD
    router.post('/', async (req, res) => {
        try {
            // req es un parámetro inyectado por Express que contiene toda la información
            // relacionada a la solicitud (request)
            // res por su lado contiene todo lo relativo a la respuesta (response)
            
            // req.body permite acceder a los datos de usuario que se desea cargar, por supuesto
            // al "armar" el body del otro lado (en un formulario, postman, thunderclient, etc),
            // se deben especificar esos campos (name, email, password en este ejemplo)
            // por supuesto aquí falta un paso FUNDAMENTAL, que es la verificación de los datos
            const { name, email, password } = req.body
            const newUser = { name: name, email: email, password: password }
            // Una vez organizado el nuevo usuario, invocamos el método create() para enviarlo a la base de datos
            const process = await userModel.create(newUser)
            
            res.status(200).send({ status: 'OK', data: process })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    // CRUpdateD
    router.put('/', async (req, res) => {
        try {
            res.status(200).send({ status: 'OK', data: 'Quiere hacer un PUT' })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    // CRUDelete
    router.delete('/', async (req, res) => {
        try {
            res.status(200).send({ status: 'OK', data: 'Quiere hacer un DELETE' })
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    return router
}