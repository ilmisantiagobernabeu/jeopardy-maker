import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_KEY,
  },
});

export async function sendEmail(email: string, body: string) {
  const info = await transporter
    .sendMail({
      from: `"User" <${email}>`,
      to: ["sdennett55@gmail.com"], // list of receivers
      subject: "Buzzinga.io Feedback", // Subject
      text: body, // plain text body
      //   html: "<b>Hello world?</b>", // html body
    })
    .catch(console.error);

  return info ? info.messageId : null;
}
