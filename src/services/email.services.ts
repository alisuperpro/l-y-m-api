import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { BUSSINES_DATA } from '../const/const'
dotenv.config()
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: 'solucioneslym.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: BUSSINES_DATA.supportEmail,
        pass: BUSSINES_DATA.supportEmailPassword,
    },
})
export const sendEmail = async ({
    to,
    subject,
    body,
}: {
    to: string
    subject: string
    body: string
}) => {
    const info = await transporter.sendMail({
        from: BUSSINES_DATA.supportEmail,
        to,
        subject,
        html: body,
    })

    console.log('Message sent:', info.messageId)
    return info
}
