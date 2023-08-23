import { Router } from 'express'
// Ya no necesitamos el array de giftcards local, recuperamos desde la base de datos
// import giftcards_data from '../helpers/giftcards.js'
// Importamos el modelo para poder invocar a través de él los distintos métodos de consulta
import giftcardModel from '../models/giftcard.model.js'

// Es muy común utilizar distintos archivos de rutas para organizar los endpoints,
// luego agregaremos el uso de clases.
export const giftcardsRoutes = ()  => {
    const router = Router()

    // ES MUY IMPORTANTE recordar siempre el uso de promesas, sea con then catch o async await
    // al consultar bases de datos o manejar archivos
    router.get('/', async (req, res) => {
        const giftcards = await giftcardModel.find()
        res.status(200).send({ status: 'OK', data: giftcards })
    })

    return router
}