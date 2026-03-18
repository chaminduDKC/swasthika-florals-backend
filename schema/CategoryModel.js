import mongoose from "mongoose";

const CategoryModel  = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    order:{
        type:Number,
        default:0
    },
    label:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
        thumbnail:{
            type:String,
            required:true
        },
    thumbnailId:{
        type:String,
        required:true
    }
},{timestamps:true}
)
export default mongoose.model("Category", CategoryModel);