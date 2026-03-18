import EmailModel from "../schema/EmailModel.js";
import sendEmail from "../utils/sendEmail.js";
import dotenv from "dotenv"

dotenv.config();

export const sendEnquiry = async(req, res)=>{
    
    console.log("body");
    console.log(req.body);

    const {name, email, phone,event_date, message, service } = req.body;

     try {
    const result = await sendEmail({
      to:      'chamindud061@gmail.com',
      from:    'onboarding@resend.dev',       // ← fixed
      subject: `New Enquiry — ${service} from ${name}`,
      html: `
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Event Date:</strong> ${event_date}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })

    const newEmail = await new EmailModel({
        emailId:result.data.id,
        from:`${req.body.name} - ${req.body.email}`,
        to:"chamindudd061@gmail.com",
        body:`${service} on ${event_date}. Additional : ${message}`,
        subject:service,
        phone:phone

    })

    await newEmail.save();
    console.log(result)
    res.status(200).json({ msg: 'Enquiry sent!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Failed to send enquiry' })
  }

    
    
}

export const getAll = async (req, res)=>{
    try {
        
        const result = await EmailModel.find();
        res.json({msg:"All emails", data:result})
    } catch (error) {
        res.json({msg:"Failed", data:error})
    }
}