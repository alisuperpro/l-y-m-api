import { sendEmail } from '../services/email.services'

import { appEventEmitter } from './eventEmitter'

export function setupEmailService() {
    appEventEmitter.on('clientCreated', async (client: any) => {
        console.log(
            `[Email Service] Enviando correo con la password para el cliente ${client.id}`
        )

        const template = `
        <!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>¡Tu Nueva Contraseña ha Llegado!</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eeeeee;
    }
    .header h1 {
        color: #333333;
    }
    .content {
        padding: 20px 0;
        line-height: 1.6;
        color: #555555;
    }
    .password-box {
        background-color: #e9ecef;
        padding: 15px;
        border-radius: 5px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: #007bff;
        margin: 20px 0;
    }
    .button-container {
        text-align: center;
        padding: 20px 0;
    }
    .button {
        display: inline-block;
        padding: 12px 25px;
        background-color: #007bff;
        color: #000000;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
    }
    .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
        font-size: 12px;
        color: #888888;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a Soluciones L y M!</h1>
        </div>
        <div class="content">
            <p>Hola ${client.name},</p>
            <p>Tu cuenta ha sido creada exitosamente. Aquí tienes tu contraseña temporal para acceder:</p>
            <div class="password-box">
                ${client.password}
            </div>
            <p>Te recomendamos encarecidamente que cambies esta contraseña por una de tu elección la primera vez que inicies sesión para mayor seguridad.</p>
            <p>Puedes iniciar sesión aquí:</p>
            <div class="button-container">
                <a href="https://solucioneslym.com/login" class="button">Iniciar Sesión Ahora</a>
            </div>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>Saludos,<br>El equipo de Soluciones L y M</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Soluciones L y M. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`

        await sendEmail({
            to: client.email,
            subject: 'Soluciones L y M - Soporte, tu nueva contraseña',
            body: template,
        })
    })

    console.log(
        '[Email Service] Escuchando eventos "clientCreated" para enviar correos electrónicos'
    )
}
