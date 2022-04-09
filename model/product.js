const mongoose = require('mongoose')
const {Schema} = mongoose

const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }, 
    quantity:{
        type:Number,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }

})

module.exports= mongoose.model('Product', productSchema)