import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'

import { giftcardsRoutes } from './routes/giftcards.routes.js'
import { usersRoutes } from './routes/users.routes.js'

// Dotenv nos permite utilizar variables de entorno, las cuales mejoran
// la organización de nuestra app. config() es el método encargado de recuperar
// esas variables desde un archivo de configuración y cargarlas al process.env.
// Por defecto el archivo se debe llamar .env y ubicarse en la ruta raíz del proyecto.
dotenv.config()

// Inicializamos constantes con los valores de variables de entorno
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

// Inicializamos la app de Express
const app = express()

// Habilitamos el uso de cors (https://reflectoring.io/complete-guide-to-cors/)
// Esto es IMPORTANTE para controlar qué solicitudes se atienden
app.use(express.json());
// Habilitamos también bodyParser, este middleware nos va a permitir interpretar
// correctamente los body de solicitud que pueden llegar en distintos formatos
// como json, url-encoded o multipart form data.
app.use(bodyParser.json());
app.use(cors({
    origin: '*' // Se aceptan solicitudes desde cualquier origen
}));
app.use(express.urlencoded({ extended: true }));


// Insertamos las rutas de endpoints que nos interesa habilitar
// En lugar de declarar los endpoints acá, lo hacemos en un archivo de rutas por separado
// Podemos asignar a cada grupo un prefijo para más orden
app.use('/api/giftcards', giftcardsRoutes());
app.use('/api/users', usersRoutes());


// Habilitamos una ruta "catchall" para retornar un contenido amigable cuando se intenta
// acceder a un endpoint que no existe
app.all('*', (req, res) => {
    console.log(req.url)
    res.status(404).send({ status: 'ERR', data: 'No se encuentra el endpoint solicitado' })
})

// Finalmente ponemos a "escuchar" nuestro servidor en un puerto específico
app.listen(EXPRESS_PORT, async () => {
    try {
        // Conectamos al motor de base de datos MongoDB
        await mongoose.connect(MONGODB_URI)
        console.log(`Backend inicializado puerto ${EXPRESS_PORT}`)
    } catch (err) {
        console.error(err.message)
    }
})