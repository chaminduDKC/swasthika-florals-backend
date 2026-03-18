import { cloudinary } from '../config/cloudinaryConfig.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import ImageSchema from '../schema/ImageModel.js';
import ImageModel from "../schema/ImageModel.js";


export const uploadImage = async (req, res)=>{
    console.log(`File received :  ${req.file ? "Yes" : "No"}`);
    console.log(req.body);
    console.log('📝 Body:', req.body);
    console.log("Start")


    console.log('req.file:', req.file)
    console.log('mimetype:', req.file?.mimetype)
    console.log('size:', req.file?.size)
    console.log('buffer exists:', !!req.file?.buffer)
    console.log("Start")

    if(!req.file){
        return res.status(400).json({msg:"No image file provided"});
    }

    const {type, title, description, categoryId} = req.body;

    if(!type || !title || !description){
        return res.status(400).json({msg:"Missing required fields: type, title, description"});
    }
    console.log(`Type: ${type}, Title: ${title}, Description: ${description}`);
    console.log("Started to upload")


    try {
        const folder = `wedding-decorations/${type.toLowerCase()}`;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    console.log("Upload completed")
    console.log(`Url : ${result.secure_url}`)

    // db part

    try {
        
        const newImage = new ImageSchema({
            type: type.toLowerCase(),
            title: title || 'Untitled',
            description: description || '',
            secure_url: result.secure_url,
            cloudinary_id: result.public_id,
            format: result.format,
            categoryId: categoryId,
            size: result.bytes,
            tags: req.body.tags || [],
        })
        const savedImage = await newImage.save();
        console.log(savedImage);
    } catch (error) {
        console.error("Error saving image to database:", error);
        throw error;
    }

     res.status(201).json({ 
      success: true, 
      msg: "Image uploaded successfully to Cloudinary!",
      data: {
        type: type.toLowerCase(),
        title: title || 'Untitled',
        description: description || '',
        cloudinary_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        created_at: result.created_at
      }
    });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({msg:"Error uploading image", error: error.message});
    }
    
}
export const deleteImage = async (req, res)=>{
    try {
        
        const {id} = req.params;
        console.log(`Id is : ${id}`)
        
        if(!id){
            return res.status(400).json({msg:"Image ID is required"});
        }

        const imageInDb = await ImageSchema.findOne({cloudinary_id: id});
        if(!imageInDb){
            return res.status(404).json({msg:"Image not found in database"});
        }
        
        const deleteFromDb = await ImageSchema.findOneAndDelete({cloudinary_id: id});
        if(!deleteFromDb){
            console.warn(`Image with cloudinary_id ${id} not found in database during deletion. Checking Cloudinary...`);   
        }
        if(deleteFromDb){
            console.log(`Image with cloudinary_id ${id} deleted from database. Checking Cloudinary...`);
        }
       
        const deletedFromCloud = await cloudinary.uploader.destroy(id);
        if(deletedFromCloud.result == 'not found'){
            console.warn(`Image with cloudinary_id ${id} not found in Cloudinary.`);
        }
       if(deletedFromCloud.result === 'ok'){
        console.log(`Image with cloudinary_id ${id} deleted from Cloudinary`);
       }
    try {
        const deletedImage = await ImageSchema.findOneAndDelete({cloudinary_id: id});
        if(!deletedImage){
            console.warn(`Image with cloudinary_id ${id} not found in database`);
        } else {
            console.log(`Image with cloudinary_id ${id} deleted from database`);
        }
    } catch (error) {
        console.error("Error deleting image from database:", error);
    }
        res.status(200).json({success:true, msg:"Image deleted successfully"});
    } catch (error) {
        console.error("Error deleting image:", error);
        if(error.error.http_code === 404){
            return res.status(404).json({msg:"Image not found"});
        }
        res.status(500).json({msg:"Error deleting image", error: error.message});
    }

}
export const getAllImages = async (req, res)=>{
    const allImages = await ImageSchema.find();
    console.log("allImages")
    console.log(allImages.length)
    res.json({msg:"All Images", data:allImages})
}
export const getAllImagesByCategory = async (req, res)=>{
    try {
        const {type} =req.query;
    if(!type){
        return res.status(400).json({msg:"Type query parameter is required"});
    }
    
    
    const allImages = await ImageSchema.find({type:type.toLowerCase()});
    if(allImages.length === 0){
        return res.status(404).json({msg:"No images found for the specified type"});
    }
    

    await res.status(200).json({msg:"All images retrieved successfully", data: allImages});
    } catch (error) {
        console.error("Error retrieving images:", error);
        res.status(500).json({msg:"Error retrieving images", error: error.message});
    }
}

export const getImagesByCategory = async (req, res)=>{
    console.log("get images by category");
    const {id} = req.params;
    if(!id) return res.json({msg:"Invalid id"})

    const images = await ImageModel.find({categoryId:id});
    res.json({msg:"get images by category", data:images})
};
export const getImage = async (req, res)=>{

    const {id} = req.params;
    if(!id){
        return res.status(400).json({msg:"Image ID is required"});
    }
    try {
        const image = await ImageSchema.findOne({cloudinary_id: id});
        if(!image){
            return res.status(404).json({msg:"Image not found in database"});
        }
            res.status(200).json({msg:"Image retrieved successfully", data: image});
    } catch (error) {
        if(error.error.http_code === 404){
            return res.status(404).json({msg:"Image not found"});
        }
        console.error("Error retrieving image:", error);
        res.status(500).json({msg:"Error retrieving image", error: error.message});
    }
    
}
export const updateImage = async (req, res)=>{
    try {
        
        const {id} = req.params;
        if(!id){
            return res.status(400).json({msg:"Image ID is required"});
        }
        // if(!req.file?.buffer){
        //     console.log("No Image")
        //     return res.status(400).json({msg:"No image file provided"});
        // }
        const {type, title, description} = req.body;
        
        if(!type || !title || !description){
            return res.status(400).json({msg:"Missing required fields: type, title, description"});
        }

        
        // await cloudinary.api.resource(id);
        //
        // await cloudinary.uploader.destroy(id);
        // console.log('Old image deleted');
        //
        // // Upload new image
        // const folder = `wedding-decorations/${type?.toLowerCase() || 'other'}`;
        // const result = await uploadToCloudinary(req.file.buffer, folder);
        // console.log(req.body);

        const existingImage = await ImageSchema.findOne({cloudinary_id: id});
        if(!existingImage){
            console.log("No existing")
            return res.status(404).json({msg:"Image not found in database"});
        }
        const updateInDb = await ImageSchema.findOneAndUpdate({cloudinary_id: id}, {
            type: type.toLowerCase(),
            title: title || 'Untitled',
            description: description || '',
            secure_url: existingImage.secure_url,
            cloudinary_id: existingImage.public_id,
            format: existingImage.format,
            size: existingImage.bytes,
            tags: req.body.tags || [],
        }, {new:true});
       

        await res.status(200).json({
            msg: "Image updated successfully",
            data: {
                type: type.toLowerCase(),
                title: title || 'Untitled',
                description: description || '',
                cloudinary_id: id,

                secure_url: existingImage.secure_url,
                format: existingImage.format,
                width: existingImage.width,
                height: existingImage.height,
                size: existingImage.bytes,
                created_at: existingImage.created_at
            }
        });

        
    } catch (error) {
        if(error.error?.http_code === 404){
            return res.status(404).json({msg:"Image not found"});
        }
        console.error("Error updating image:", error);
        res.status(500).json({msg:"Error updating image", error: error.message});
    }
}