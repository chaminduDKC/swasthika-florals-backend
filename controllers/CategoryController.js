import CategoryModel from "../schema/CategoryModel.js";
import ImageModel from "../schema/ImageModel.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { cloudinary } from "../config/cloudinaryConfig.js";
import sendEmail from "../utils/sendEmail.js";

export const GetCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.json({ msg: "No id available" })

        const category = await CategoryModel.findOne({ _id: id });
        console.log("category")
        console.log(category)

        res.status(200).json({ msg: "Get Category", data: category })
    } catch (e) {
        res.json({ msg: "Failed to fetch category", id: id })
    }

}

export const CreateCategory = async (req, res) => {
    console.log(`File received :  ${req.file ? "Yes" : "No"}`);

    const file = req.file
    if (!file) return res.json({ msg: "No file provided" })
    const { name, label, order, description } = req.body;
    const folder = `wedding-decorations/category-thumbnails`
    const result = await uploadToCloudinary(req.file.buffer, folder)
    console.log("Upload completed")
    console.log(result)
    console.log("Data from backend")
    console.log(req.body);
    const newCategory = await new CategoryModel({
        name: name,
        description: description,
        label: label,
        order: order,
        thumbnail: result.secure_url,
        thumbnailId: result.public_id,
    })
    await newCategory.save();
    console.log("Body is :")
    console.log(req.body);
    res.status(200).json({ msg: "Create Category", data: result })
}

export const DeleteCategory = async (req, res) => {
    // when delete the category, all images in that category also deleted;
    try {
        const { id } = req.params;
        if (!id) {
            return res.json({ msg: "Provide a user id" })
        }
        const existingCategory = await CategoryModel.findOne({ _id: id });
        if (!existingCategory) res.json({ msg: "No category found for given id " })

        try {
            console.log("Hey")
            const thumbnailInCloud = await cloudinary.api.resource(existingCategory.thumbnailId);
            console.log("Hi")
            if (thumbnailInCloud) {
                await cloudinary.uploader.destroy(thumbnailInCloud.public_id)
                console.log("Deleted category thumbnail from cloud");
            }
        } catch (e) {
        }
        const images = await ImageModel.find({ categoryId: id });
        console.log(`found ${images.length} images`);
        images.map(image => {
            console.log(image?.categoryId)
        })






        // STEP 3: Delete each image from Cloudinary
        // We use Promise.all to delete all images at the same time (faster)
        if (images.length > 0) {
            await Promise.all(
                images.map(async (image) => {
                    // Delete from Cloudinary using the public_id
                    if (image.categoryId) {
                        await cloudinary.uploader.destroy(image.cloudinary_id)
                        console.log(`Deleted from Cloudinary: ${image.cloudinary_id}`)
                    }
                })
            )
        }
        // STEP 4: Delete all images from MongoDB
        await ImageModel.deleteMany({ categoryId: id })

        await CategoryModel.findByIdAndDelete({ _id: id });
        console.log(req.body);
        res.status(200).json({ msg: "Deleted Category" })
    } catch (e) {
        res.json({ msg: e.message })
    }

}
export const UpdateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, order, label, description, thumbnail, thumbnailId } = req.body;
        if (!id) return res.json({ msg: "No valid id" })

        console.log("id from params ")
        console.log(id)

        console.log("req.body is :");
        console.log(req.body);
        if (req.file) {
            console.log("File exist")
            const folder = `wedding-decorations/category-thumbnails`
            console.log("thumbnailId is ")
            console.log(thumbnailId)
            await cloudinary.uploader.destroy({ public_id: thumbnailId })
            const result = await uploadToCloudinary(req.file.buffer, folder);
            console.log("result is ")
            console.log(result)
            console.log("result is over")

            const existingCat = await CategoryModel.findOneAndUpdate({ _id: id }, {
                name: name, order: order, label: label,
                description: description, thumbnailId: result.public_id,
                thumbnail: result.secure_url
            });

        } else {
            const existingCat = await CategoryModel.findOneAndUpdate({ _id: id }, {
                name: name, order: order, label: label, description: description
            }, { new: true });

        }
        // if thumbnail is empty keep the prev thumbnail



        res.status(200).json({ msg: "Update Category" })
    } catch (e) {
        console.log(e)
        res.json({ msg: "Failed to update", error: e })
    }

}

export const GetAllMainCategories = async (req, res) => {

    try {
        const cats = ["Poruwa", "Setty Back", "Table","Car", "Entrance", "Oil lamp"] 

        const categories = await CategoryModel.find({name:cats.map((c)=> c)})
        res.status(200).json({ data: categories })
    } catch (error) {
        console.log(error);

        res.json({ data: error })
    }


}


export const GetAllCategories = async (req, res) => {
    console.log("All cats called");
    
    try {
        const categories = await CategoryModel.find();
        res.status(200).json({ data: categories })
        console.log(categories);
        
        
    } catch (error) {
        console.log(error);

        res.json({ data: error })
    }


}

export const getEngagementCat = async (req, res)=>{
    try {
         const categories = await CategoryModel.find({name:"Engagement"})
        res.status(200).json({ data: categories })
    } catch (error) {
        console.log(error);

        res.json({ data: error })
    }
}

export const getBridalBouquetCat = async (req, res)=>{
    const cats = ["Kandyan" , "Rounded"]
    try {
         const categories = await CategoryModel.find({name:cats.map((c)=> c)})
        res.status(200).json({ data: categories })
    } catch (error) {
        console.log(error);

        res.json({ data: error })
    }
}

export const getOtherCats = async (req, res)=>{
    const cats = ["Birthday" , "Openings", "Concerts", "Baloons", "Other"]
    try {
         const categories = await CategoryModel.find({name:cats.map((c)=> c)})
        res.status(200).json({ data: categories })
    } catch (error) {
        console.log(error);

        res.json({ data: error })
    }
}