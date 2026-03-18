import ContactModel from "../schema/ContactModel.js";

const  CreateContact = async (req, res)=>{
    try{
        console.log("req.body is ")
        console.log(req.body)

        const {name, phone, email, address, city, whatsapp, facebook, instagram,mapUrl, hours} = req.body;

        const newContact = await ContactModel.create({
            name, email, phone, address, city, whatsapp, facebook, mapUrl, instagram, hours
        })
        console.log("newContact")
        console.log(newContact)
        res.json({
            msg:"Contact Created",
            data:newContact
        })
    } catch (e) {
        res.json({msg:"Failed", data:e})
    }

}

const UpdateContact = async (req, res)=>{
    const {id} = req.params;
    console.log(id)
    const {phone, email, address,city,facebook, instagram, mapUrl,  hours } = req.body;
    console.log(req.body)
    if(!id) res.json({msg:"Invalid Id"});


    const myDetails = await ContactModel.findOneAndUpdate({_id:id}, {
        phone, email, address, city, facebook, instagram, mapUrl, hours
    });


    res.json({msg:"Get All contact", data:myDetails})
}

const DeleteContact = async (req, res)=>{
    res.json({msg:"delete contact"})
}

const GetContact = async (req, res)=>{
    const {id} = req.params;
    console.log("Hi Get")
    console.log(id)
    const myDetails = await ContactModel.findById(id);
    res.json({msg:"get contact", data:myDetails})
}
const GetAllContact = async (req, res)=>{
    const myDetails = await ContactModel.find();
  res.json({msg:"Heloo", data:myDetails})
}

export {CreateContact, DeleteContact, GetAllContact, UpdateContact, GetContact}