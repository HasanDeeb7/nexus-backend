import "dotenv/config";
import { createTransport } from "nodemailer";
const variables = process.env;
const transporter = createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: variables.MAIL_USER,
    pass: variables.MAIL_PASS,
  },
});
export async function sendVerificationCode(receiver, code) {
  await transporter.sendMail({
    from: "noreply@flowblog.com",
    to: receiver,
    subject: "Verification Code",
    html: ` <div style="display: flex;flex-direction: column; align-items: center; justify-content: center, width: 100%; padding: 0 10%">
    
    <h1 style='color: white; background-color: black; width: 200px; display: flex; align-items: center; justify-content: center'>Lobby</h1>
      <h2>Hello Gamer</h2>
      <p>Here's your verification code, just paste it to verify your account</p>
      <h1>${code}</h1>
      <h4 style='color:red'>The code expires after 10 minutes, you can request another one!</h4>
    </div> `,
  });
}
