import { Resend } from 'resend';
import dotenv from "dotenv"

dotenv.config();



const resend = new Resend(process.env.SEND_EMAIL_KEY);

const sendEmail = async ({subject, from, to, html }) => {
  try {
    const result = await resend.emails.send({
      from: from,
      to: to,
      subject: subject,
      html: html
    });
    return result;
  } catch (error) {

  }
}



export default sendEmail;