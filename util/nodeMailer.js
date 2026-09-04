import nodemailer from "nodemailer";
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user:process.env.EMAIL,
    pass:process.env.PASS,
  },
});


export const sendEmail = async(recipient,message)=>{
 const info = await transporter.sendMail({
    from: `"XFLEX" <${process.env.EMAIL}>"`,
    to: `${recipient}`,
    subject: "Verification Code", 
    text: `${message}`,
  })
}