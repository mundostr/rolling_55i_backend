import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'

import { giftcardsRoutes } from './routes/giftcards.routes.js'

dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

// Inicializamos la app de Express
const app = express()

// Habilitamos el uso de cors (https://reflectoring.io/complete-guide-to-cors/)
app.use(express.json());
app.use(cors({
    origin: '*' // Se aceptan solicitudes desde cualquier origen
}));
app.use(express.urlencoded({ extended: true }));


// Insertamos las rutas de endpoints que nos interesa habilitar
// En lugar de declarar los endpoints acá, lo hacemos en un archivo de rutas por separado
app.use('/api/giftcards', giftcardsRoutes());


// Habilitamos una ruta "catchall" para retornar un contenido amigable cuando se intenta
// acceder a un endpoint que no existe
app.all('*', (req, res) => {
    res.status(404).send({ status: 'OK', data: 'No se encuentra el endpoint solicitado' })
})

// Finalmente ponemos a "escuchar" nuestro servidor en un puerto específico
app.listen(EXPRESS_PORT, async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`Backend inicializado puerto ${EXPRESS_PORT}`)
    } catch (err) {
        console.error(err.message)
    }
})