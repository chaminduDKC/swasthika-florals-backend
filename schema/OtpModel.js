import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        required:true
    }
})

export default mongoose.model("Otp", OtpSchema);