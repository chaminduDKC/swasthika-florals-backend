import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";


dotenv.config();

import ImageRoute from "./routes/ImageRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import ContactRoute from "./routes/ContactRoute.js";
import EmailRoute from "./routes/EmailRoute.js";




const app = express();
const port = process.env.PORT || 3000;


app.use(helmet())
// app.use(ExpressMongoSanitize())
app.use(cors({
    origin: [
        process.env.ADMIN_URL,
        process.env.CLIENT_URL,
        'http://localhost:5174',
    'http://localhost:5173',
    'http://192.168.8.100:5174',
    'http://192.168.8.100:5173',
    ],
    credentials:true,
    methods:["GET", "POST", "DELETE", "PUT"]
}))

app.use(cookieParser())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));




app.use("/api/v1/images", ImageRoute);
app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/categories", CategoryRoute);
app.use("/api/v1/contact", ContactRoute);
app.use("/api/v1/emails", EmailRoute);

app.use((req, res, next) => {
  res.status(404).send('404 - Route Not Found');
});


// error middleware
app.use((err, req, res, next)=>{
    console.log(err)
    res.status(500).json({msg:"Internal Server Error"});
})
const startApp = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
        app.listen(port, '0.0.0.0',()=>{
        console.log(`Server is running on port ${port}...`);
})
        
    } catch(err){
        console.log(err);
    }
}
startApp();
