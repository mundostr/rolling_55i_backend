// Mongoose necesita un modelo que "describa" los datos que guarda cada colección.
// A través de este modelo se invocarán los distintos métodos para consultar la base de datos.
// (Ver archivo de rutas en routes)

import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'users'

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: { type: Array, required: true, default: [] },
    // En muchos casos, podemos preferir mantener los datos al momento de borrarlos.
    // Para poder hacerlo, agregamos un campo de tipo booleano que indica el estado (activo o inactivo)
    // del registro. Al borrar, simplemente lo marcamos como inactivo para que no sea considerado en
    // listados y demás, pero los datos en sí seguirán estando.
    // active: { type: Boolean, required: true, default: true }
})
schema.plugin(mongoosePaginate)

const userModel = mongoose.model(collection, schema)

export default userModel