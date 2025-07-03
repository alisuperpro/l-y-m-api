import nodemailer from 'nodemailer'

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: 'solucioneslym.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'soporte@solucioneslym.com',
        pass: 'ContrasenaFacil10.',
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
        from: 'soporte@solucioneslym.com',
        to,
        subject,
        html: body,
    })

    console.log('Message sent:', info.messageId)
    return info
}
