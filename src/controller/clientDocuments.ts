import { Request, Response } from 'express'
import { ClientDocumentsModel } from '../models/clientDocuments'
import { nameSchema } from '../schemas/global.schema'
import { idSchema } from '../schemas/client.schema'

export class ClientDocumentsController {
    static async add(req: Request, res: Response) {
        const {
            name,
            ext,
            url,
            createdBy,
            clientId,
            description,
            clientCompanyId,
            organizationId,
        } = req.body
        const { error } = nameSchema.safeParse(name)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        // Validar campos requeridos
        if (
            !ext ||
            !url ||
            !createdBy ||
            !clientId ||
            !description ||
            !clientCompanyId ||
            !organizationId
        ) {
            res.status(400).json({
                error: 'Faltan campos requeridos para crear el documento del cliente',
            })
            return
        }

        const createdAt = new Date().toISOString()
        const [err, result] = await ClientDocumentsModel.add({
            name,
            ext,
            url,
            createdBy,
            clientId,
            createdAt,
            description,
            clientCompanyId,
            organizationId,
        })

        if (err) {
            console.log({ err })
            res.status(500).json({
                error: 'Error al agregar el documento del cliente',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findByClientId(req: Request, res: Response) {
        const { clientId } = req.params

        const { error } = idSchema.safeParse(clientId)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] = await ClientDocumentsModel.findByClientId({
            clientId,
        })
        if (err) {
            res.status(500).json({
                error: 'Error al obtener los documentos del cliente',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findById(req: Request, res: Response) {
        const { id } = req.params
        const { error } = idSchema.safeParse(id)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }
        const [err, result] = await ClientDocumentsModel.findById({ id })
        if (err) {
            res.status(500).json({
                error: 'Error al obtener el documento del cliente',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
