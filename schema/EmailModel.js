import mongoose, { model } from "mongoose";

const EmailSchema = new mongoose.Schema({
    emailId:{
        type:String,
        required:true
    },
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    phone:{
         type:String,
        required:true
    }
},{timestamps:true})

export default mongoose.model("Email", EmailSchema);