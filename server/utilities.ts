import nodemailer from "nodemailer";
import { GameState } from "../stateTypes";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_KEY,
  },
});

export async function sendEmail(
  email: string,
  body: string,
  subject = "Buzzinga.io Feedback"
) {
  const info = await transporter
    .sendMail({
      from: `${email}`,
      to: ["buzzingaiogame@gmail.com", "sdennett55@gmail.com"], // list of receivers
      subject: subject, // Subject
      text: `${body}${email ? ` - sent by ${email}` : ""}`, // plain text body
    })
    .catch(console.error);

  return info ? info.messageId : null;
}

export function markTeamAsBuzzedIn(gameState: GameState, socketId: string) {
  gameState.activePlayer = socketId;
  gameState.lastActivePlayer = socketId;
  gameState.isBuzzerActive = false;

  gameState.firstBuzz = false;
  gameState.buzzerHits = {};
}
