import { Request, Response } from 'express'
import { PermissionModel } from '../models/permision'

export class PermissionController {
    static async add(req: Request, res: Response) {
        const { resourcesId, actionsId, description } = req.body

        if (!resourcesId || !actionsId) {
            res.status(403).json({
                error: 'Faltan los ids de los recursos y acciones',
            })
            return
        }

        const [error, result] = await PermissionModel.add({
            resourcesId,
            actionsId,
            description,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al guardar el permiso',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await PermissionModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al buscar los permisos',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
