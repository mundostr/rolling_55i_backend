import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'giftcards'

const schema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String }
});

const giftcardModel = mongoose.model(collection, schema);

export default giftcardModel;