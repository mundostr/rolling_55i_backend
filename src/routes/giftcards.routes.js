import mongoose from 'mongoose'
import { Router } from 'express'
// Ya no necesitamos el array de giftcards local, recuperamos desde la base de datos
// import giftcards_data from '../helpers/giftcards.js'
// Importamos el modelo para poder invocar a través de él los distintos métodos de consulta
import cardModel from '../models/giftcard.model.js'

import { body, validationResult } from 'express-validator'
import { checkRequired, checkRoles, verifyToken, filterData, filterAllowed } from '../utils.js'

// Es muy común utilizar distintos archivos de rutas para organizar los endpoints,
// luego agregaremos el uso de clases.
export const giftcardsRoutes = ()  => {
    const router = Router()

    const validateCreateFields = [
        body('title').isLength({ min: 2, max: 32 }).withMessage('El título debe tener entre 2 y 32 caracteres'),
        body('price').isNumeric().withMessage('El precio debe ser numérico')
    ]

    // ES MUY IMPORTANTE recordar siempre el uso de promesas, sea con then catch o async await
    // al consultar bases de datos o manejar archivos
    router.get('/', async (req, res) => {
        const cards = await cardModel.find()
        res.status(200).send({ status: 'OK', data: cards })
    })

    router.get('/one/:cid', async (req, res) => {
        try {
            if (mongoose.Types.ObjectId.isValid(req.params.cid)) {
                const card = await cardModel.findById(req.params.cid)

                if (card === null) {
                    res.status(404).send({ status: 'ERR', data: 'No existe tarjeta con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: card })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    router.post('/', verifyToken, checkRoles(['admin']), checkRequired(['title', 'price']), validateCreateFields, async (req, res) => {
        if (validationResult(req).isEmpty()) {
            try {
                const { title, price, image } = req.body
                const newCard = { title: title, price: price, image: image }

                const process = await cardModel.create(newCard)
                
                res.status(200).send({ status: 'OK', data: filterData(process, ['password']) })
            } catch (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            }
        } else {
            res.status(400).send({ status: 'ERR', data: validationResult(req).array() })
        }
    })

    router.put('/:cid', verifyToken, checkRoles(['admin']), filterAllowed(['title', 'price', 'image']), async (req, res) => {
        try {
            const id = req.params.cid
            if (mongoose.Types.ObjectId.isValid(id)) {
                const cardToModify = await cardModel.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true })

                if (!cardToModify) {
                    res.status(404).send({ status: 'ERR', data: 'No existe tarjeta con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: filterData(cardToModify, ['password']) })
                }
            } else {
                res.status(400).send({ status: 'ERR', data: 'Formato de ID no válido' })
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', data: err.message })
        }
    })

    router.delete('/:cid', verifyToken, checkRoles(['admin']), async (req, res) => {
        try {
            const id = req.params.cid
            if (mongoose.Types.ObjectId.isValid(id)) {
                const cardToDelete = await cardModel.findOneAndDelete({ _id: id });

                if (!cardToDelete) {
                    res.status(404).send({ status: 'ERR', data: 'No existe tarjeta con ese ID' })
                } else {
                    res.status(200).send({ status: 'OK', data: cardToDelete })
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