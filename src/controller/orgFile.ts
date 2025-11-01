import { Request, Response } from 'express'
import { OrgFileModel } from '../models/orgFile'

export class OrgFileController {
    static async add(req: Request, res: Response) {
        const { organizationId, fileFormId } = req.body

        if (!organizationId || !fileFormId) {
            res.status(400).json({
                error: 'Faltan datos',
            })
            return
        }

        const [error, result] = await OrgFileModel.add({
            organizationId,
            fileFormId,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al guardar',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await OrgFileModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al obtener los datos',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
