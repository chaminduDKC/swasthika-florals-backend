import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({

    phone:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true, 
    },
    address:{
        type:String,

    },
    city:{
        type:String,

    },

    facebook:{
        type:String,
        required:true,
    },
    instagram:{
        type:String,

    },
    mapUrl:{
        type:String,

    },
    hours:{
      type:String
    }
},{timestamps:true})

export default mongoose.model("Contact", ContactSchema);