// Mongoose necesita un modelo que "describa" los datos que guarda cada colección.
// A través de este modelo se invocarán los distintos métodos para consultar la base de datos.
// (Ver archivo de rutas en routes)

import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'users'

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    cart: { type: Array, required: true, default: [] }
})

const userModel = mongoose.model(collection, schema)

export default userModel