import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    type:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    secure_url:{
        type:String,
        required:true,
    },
    cloudinary_id:{
        type:String,
        required:true,
    },
    format:{
        type:String,
        required:true,
    },
    size:{
        type:Number,
        required:true,
    },
    tags:{
        type:[String],
        default:[],
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },

}, {timestamps:true})

export default mongoose.model("Image", ImageSchema);