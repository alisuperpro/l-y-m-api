import { Request, Response } from 'express'
import { ClientDocumentsModel } from '../models/clientDocuments'
import { nameSchema } from '../schemas/global.schema'
import { idSchema } from '../schemas/client.schema'
import { appEventEmitter } from '../events/eventEmitter'

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
            fileFormId,
            createdAt,
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
            !clientCompanyId ||
            !organizationId
        ) {
            res.status(400).json({
                error: 'Faltan campos requeridos para crear el documento del cliente',
            })
            return
        }

        // const createdAt = new Date().toISOString()
        const [err, result] = await ClientDocumentsModel.add({
            name: name.replaceAll(' ', '-').replaceAll('%', ''),
            ext,
            url,
            createdBy,
            clientId,
            createdAt: createdAt ? createdAt : new Date().toISOString(),
            description,
            clientCompanyId,
            organizationId,
            fileFormId,
        })

        if (err) {
            console.log({ err })
            res.status(500).json({
                error: 'Error al agregar el documento del cliente',
            })
            return
        }

        appEventEmitter.emit('notify client document uploaded', {
            clientId,
            url,
            clientCompanyId,
            filename: name,
            createdAt,
            orgId: organizationId,
        })

        res.json({
            data: result,
        })
    }

    static async findByClientId(req: Request, res: Response) {
        const { clientId } = req.params
        const { order, orgId, companyId } = req.query

        const { error } = idSchema.safeParse(clientId)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] = await ClientDocumentsModel.findByClientId({
            clientId,
            companyId: companyId?.toString() || undefined,
            orgId: orgId?.toString() || undefined,
            //@ts-ignore
            order: order || 'ASC',
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

    static async getAll(req: Request, res: Response) {
        const [err, result] = await ClientDocumentsModel.getAll()

        if (err) {
            res.status(500).json({ error: 'Error fetching client companies' })
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

    static async ClientDocumentUrl(req: Request, res: Response) {
        const { documentId, clientId } = req.params

        const [error, result] =
            await ClientDocumentsModel.getDocumentByDocumentAndClientId({
                documentId: documentId,
                clientId,
            })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar el archivo',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'No se encontro el archivo',
            })
            return
        }

        res.json({ data: result })
    }

    static async getByOrgAndSlug(req: Request, res: Response) {
        const { org, slug } = req.params
        const { clientId, createdAt } = req.query

        if (!org || !slug) {
            res.status(400).json({
                error: 'Error faltan datos',
            })
            return
        }

        const [error, result] = await ClientDocumentsModel.getByOrgAndSlug({
            org,
            slug,
            clientId: clientId?.toString() ?? undefined,
            createdAt: createdAt?.toString() ?? undefined,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar el archivo',
            })
            return
        }

        //@ts-ignore
        if (result.length <= 0) {
            res.status(404).json({
                error: 'No hay documentos',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async updateFile(req: Request, res: Response) {
        const { id } = req.params
        const {
            name,
            url,
            ext,
            clientId,
            description,
            clientCompanyId,
            organizationId,
            fileFormId,
        } = req.body

        if (!id || !name) {
            res.status(400).json({
                error: 'Faltan datos',
            })
            return
        }

        const [error, result] = await ClientDocumentsModel.updateFile({
            id,
            name,
            url,
            ext,
            clientId,
            clientCompanyId,
            fileFormId,
            organizationId,
            description: description ? description : '',
        })

        if (error) {
            res.status(500).json({
                error: 'Error al actualizar el archivo',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async deleteFile(req: Request, res: Response) {
        const { id } = req.params

        if (!id) {
            res.status(400).json({
                error: 'Error falta el id',
            })
            return
        }

        const [error, file] = await ClientDocumentsModel.deleteFile({ id })

        if (error) {
            res.status(500).json({
                error: 'Error to delete file',
            })
            return
        }

        res.json({
            data: 'Deleted',
        })
    }
}
