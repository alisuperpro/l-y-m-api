import { BUSSINES_DATA } from '../const/const'
import { ClientModel } from '../models/client'
import { ClientCompanyModel } from '../models/clientCompany'
import { OrganizationsModel } from '../models/organizations'
import { StatesModel } from '../models/states'
import { sendEmail } from '../services/email.services'

import { appEventEmitter } from './eventEmitter'

export function setupEmailService() {
    const templates = {
        debtCreated: `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación de Creación de Deuda</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .email-container {
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
            border-bottom: 1px solid #eee;
        }
        .header h1 {
            color: #333;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px 0;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 10px;
        }
        .debt-details {
            background-color: #f9f9f9;
            border-left: 5px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .debt-details p {
            margin: 5px 0;
        }
        .button-container {
            text-align: center;
            padding-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff !important; /* !important para anular estilos de cliente de correo */
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
        }
        .footer p {
            margin: 5px 0;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Importante: Nueva Deuda Creada</h1>
        </div>
        <div class="content">
            <p>Estimado/a <strong>[Nombre del Usuario]</strong>,</p>
            <p>Le informamos que se ha generado una nueva deuda a su nombre en nuestro sistema. A continuación, le presentamos los detalles de la misma:</p>

            <div class="debt-details">
                <p><strong>Número de Deuda:</strong> [Número de Deuda]</p>
                <p><strong>Concepto:</strong> [Concepto de la Deuda]</p>
                <p><strong>Monto Total:</strong> [Monto de la Deuda] [Moneda]</p>
                <p><strong>Fecha de Creación:</strong> [Fecha de Creacion]</p>
                <p><strong>Fecha de Vencimiento:</strong> [Fecha de Vencimiento]</p>
                <p><strong>Estado Actual:</strong> [Estado]</p>
            </div>

            <p>Le recomendamos revisar esta información y tomar las acciones necesarias antes de la fecha de vencimiento para evitar cargos adicionales o inconvenientes.</p>
            <p>Puede consultar el detalle completo de esta deuda y gestionar sus pagos ingresando a su cuenta a través del siguiente enlace:</p>

            <div class="button-container">
                <a href="[acceder a mi cuenta]" class="button">Acceder a mi Cuenta</a>
            </div>

            <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactar a nuestro equipo de soporte.</p>
            <p>Gracias por su atención.</p>
        </div>
        <div class="footer">
            <p>Saludos cordiales,</p>
            <p>El equipo de [Tu Nombre o Nombre de la Empresa]</p>
            <p><a href="[Enlace a tu sitio web]">[Tu Sitio Web]</a> | <a href="mailto:[Tu Correo de Soporte]">[Tu Correo de Soporte]</a></p>
            <p>Este es un correo electrónico automático, por favor no lo responda.</p>
        </div>
    </div>
</body>
</html>`,
        aprovedPay: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>¡Excelente Noticia! Tu Pago Ha Sido Confirmado</title>
<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
    }
    .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    .header {
        background-color: #007bff; /* Azul vibrante */
        color: #ffffff;
        padding: 20px;
        text-align: center;
    }
    .header h1 {
        margin: 0;
        font-size: 24px;
    }
    .content {
        padding: 20px 30px;
        line-height: 1.6;
        color: #333333;
    }
    .content p {
        margin-bottom: 15px;
    }
    .content strong {
        color: #007bff;
    }
    .status-box {
        background-color: #d4edda; /* Verde claro para éxito */
        border: 1px solid #28a745; /* Verde para el borde */
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #155724; /* Verde oscuro para el texto */
    }
    .button-container {
        text-align: center;
        padding: 10px 30px 20px;
    }
    .button {
        display: inline-block;
        background-color: #28a745; /* Verde para el botón de acción */
        color: #ffffff;
        padding: 12px 25px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
    }
    .footer {
        background-color: #f0f0f0;
        color: #777777;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        border-top: 1px solid #e0e0e0;
    }
    .footer a {
        color: #007bff;
        text-decoration: none;
    }
</style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>¡Tu Pago Ha Sido Confirmado y Aprobado!</h1>
        </div>
        <div class="content">
            <p>Estimado/a <strong>[Nombre del Cliente]</strong>,</p>
            <p>¡Tenemos una excelente noticia para usted! Le confirmamos que hemos procesado exitosamente su pago correspondiente a la deuda con número de referencia <strong>[Número de Referencia de Deuda]</strong>.</p>

            <p>Como resultado de esta confirmación, el estatus de su deuda ha sido actualizado a:</p>

            <div class="status-box">
                ¡PAGO APROBADO!
            </div>

            <p>Nos complace informarle que su cuenta ahora refleja este cambio. Queremos agradecerle por su pronta acción y por mantener sus compromisos financieros al día. Esto contribuye a una relación sólida y transparente entre nosotros.</p>

            <p>Si desea revisar su historial de pagos o acceder a cualquier otra información de su cuenta, puede hacerlo a través de nuestro portal de cliente:</p>
        </div>
        <div class="button-container">
            <a href="[Enlace a su Portal de Cliente o Contacto]" class="button">Acceder a mi Cuenta</a>
        </div>
        <div class="content">
            <p>Saludos cordiales,</p>
            <p>El equipo de <strong>[Nombre de Tu Empresa]</strong></p>
        </div>
        <div class="footer">
            <p>&copy; 2025 [Nombre de Tu Empresa]. Todos los derechos reservados.</p>
            <p><a href="[Enlace a Política de Privacidad]">Política de Privacidad</a> | <a href="[Enlace a Términos y Condiciones]">Términos y Condiciones</a></p>
        </div>
    </div>
</body>
</html>`,
    }

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
        color: #000
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
            <h1>¡Bienvenido a ${BUSSINES_DATA.name}!</h1>
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
                <a href="${BUSSINES_DATA.web}/cliente/login" class="button">Iniciar Sesión Ahora</a>
            </div>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>Saludos,<br>El equipo de ${BUSSINES_DATA.name}</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ${BUSSINES_DATA.name}. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`

        try {
            await sendEmail({
                to: client.email,
                subject: 'Soluciones L y M - Soporte, tu nueva contraseña',
                body: template,
            })
        } catch (err) {
            console.log({ err })
        }
    })

    appEventEmitter.on('debtCreated', async (data: any) => {
        console.log(
            `[Email Service] Enviando correo para notificar la nueva deuda al cliente ${data.clientId}`
        )

        const [statusError, statusResult] = await StatesModel.findById({
            id: data.status,
        })

        if (statusError) {
            console.log('Error estado no encontrado')
            return
        }

        const template = templates.debtCreated
            .replace('[Nombre del Usuario]', data.client_name)
            .replace('[Número de Deuda]', data.debtId)
            .replace(
                '[Concepto de la Deuda]',
                data.description ?? 'Sin concepto'
            )
            .replace('[Monto de la Deuda]', data.amount)
            .replace('[Moneda]', '$')
            .replace(
                '[Fecha de Creacion]',
                new Date(data.createdAt).toLocaleDateString('es-ES')
            )
            .replace('[Fecha de Vencimiento]', data.expireIn)
            //@ts-ignore
            .replace('[Estado]', statusResult.state)
            .replace(
                '[acceder a mi cuenta]',
                `${BUSSINES_DATA.web}/cliente/perfil/${data.clientId}`
            )
            .replace('[Tu Nombre o Nombre de la Empresa]', BUSSINES_DATA.name)
            .replace('[Enlace a tu sitio web]', BUSSINES_DATA.web)
            .replace('[Tu Sitio Web]', BUSSINES_DATA.name)
            .replace('[Tu Correo de Soporte]', BUSSINES_DATA.supportEmail)
            .replace('[Tu Correo de Soporte]', BUSSINES_DATA.supportEmail)

        try {
            await sendEmail({
                to: data.email,
                subject: 'Soluciones L y M - Soporte, Nueva Deuda Creada',
                body: template,
            })
        } catch (error) {
            console.log('Error al enviar el correo de deuda creada:', error)
        }
    })

    appEventEmitter.on('payApproved', async (data: any) => {
        console.log(
            `[Email Service] Enviando correo para notificar que el pago de la deuda a sido aprobado al cliente ${data.client_id}`
        )

        const template = templates.aprovedPay
            .replace('[Nombre del Cliente]', data.name)
            .replace('[Número de Referencia de Deuda]', data.debt_id)
            .replace(
                '[Enlace a su Portal de Cliente o Contacto]',
                `${BUSSINES_DATA.web}/perfil/${data.client_id}`
            )
            .replace('[Nombre de Tu Empresa]', BUSSINES_DATA.name)
            .replace('[Nombre de Tu Empresa]', BUSSINES_DATA.name)
            .replace(
                '[Enlace a Política de Privacidad]',
                `${BUSSINES_DATA.web}/politicas-de-privacidad`
            )
            .replace(
                '[Enlace a Términos y Condiciones]',
                `${BUSSINES_DATA.web}/terminos-y-condiciones`
            )

        await sendEmail({
            to: data.email,
            subject: 'Soluciones L y M - Soporte, Pago aprobado',
            body: template,
        })
    })

    appEventEmitter.on(
        'notify client document uploaded',
        async ({ clientId, clientCompanyId, filename, createdAt, orgId }) => {
            let content = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Archivo Subido Exitosamente!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 20px 0 30px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <tr>
                        <td align="center" style="padding: 40px 0 30px 0; background-color: #0056b3; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Notificación de Archivo Subido 📁</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px 40px 30px;">
                            <p style="color: #333333; margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
                                Estimado/a [Nombre del Cliente],
                            </p>
                            <p style="color: #333333; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
                                Queremos notificarle que se ha subido un nuevo archivo a su espacio de cliente, específicamente asociado a la empresa [Nombre de la Empresa del Cliente].
                            </p>

                            

                            <h3 style="color: #0056b3; margin: 0 0 10px 0; font-size: 18px;">Detalles del Archivo:</h3>
                            <table border="0" cellpadding="5" cellspacing="0" width="100%" style="color: #333333; font-size: 15px; border-collapse: collapse;">
                                <tr>
                                    <td width="30%" style="font-weight: bold; padding: 8px 0;">Empresa Destino:</td>
                                    <td width="70%" style="padding: 8px 0;">[Nombre de la Empresa del Cliente]</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; padding: 8px 0;">Nombre del Archivo:</td>
                                    <td style="padding: 8px 0;">[Nombre del Archivo.pdf]</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; padding: 8px 0;">Subido por:</td>
                                    <td style="padding: 8px 0;">[Nombre de la Persona o Sistema]</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; padding: 8px 0;">Organización:</td>
                                    <td style="padding: 8px 0;">[Tu Organización/Departamento]</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; padding: 8px 0;">Fecha de Subida:</td>
                                    <td style="padding: 8px 0;">[Fecha y Hora]</td>
                                </tr>
                            </table>

                            <p style="color: #333333; margin: 25px 0 0 0; font-size: 16px; line-height: 1.6;">
                                Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td bgcolor="#eeeeee" align="center" style="padding: 20px 30px 20px 30px; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; font-size: 14px; color: #555555;">
                                Atentamente,<br>
                            [Nombre de tu Empresa/Contacto]
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>`

            const [error, result] = await ClientModel.findClientById({
                id: clientId,
            })
            if (error) {
                console.log('error cliente no encontrado')
                return
            }

            //@ts-ignore
            const [clientCompanError, clientCompanyResult]: [any, any] =
                await ClientCompanyModel.findById({ id: clientCompanyId })

            if (clientCompanError) {
                console.log('error empresa del cliente no encontrado')
                return
            }

            //@ts-ignore
            const [orgError, orgResult]: [any, any] =
                await OrganizationsModel.findById({
                    id: orgId,
                })

            if (orgError) {
                console.log('error organizacion no encontrado')
                return
            }

            content = content.replace(
                /\[Nombre del Cliente\]/g,
                result.client.name || 'Cliente'
            )
            content = content.replace(
                /\[Nombre de la Empresa del Cliente\]/g,
                clientCompanyResult[0]?.name || 'Empresa del Cliente'
            )
            content = content.replace(
                /\[Nombre del Archivo\.pdf\]/g,
                filename || 'Documento Subido'
            )
            content = content.replace(
                /\[Fecha y Hora\]/g,
                createdAt || new Date().toLocaleString()
            )
            content = content.replace(
                /\[Nombre de la Persona o Sistema\]/g,
                'Soluciones L y M'
            )
            content = content.replace(
                /\[Tu Organización\/Departamento\]/g,
                orgResult?.name || 'Mi Organización'
            )
            content = content.replace(
                /\[Nombre de tu Empresa\/Contacto\]/g,
                'Soporte - Soluciones L y M'
            )
            content = content.replace(/\[Tu Dirección\]/g, 'Soluciones L y M')

            await sendEmail({
                to: result.client.email,
                subject: 'Soluciones L y M - Soporte, Archivo',
                body: content,
            })
        }
    )

    console.log('[Email Service] Escuchando eventos')
}
