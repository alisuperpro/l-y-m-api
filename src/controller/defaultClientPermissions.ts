import { Request, Response } from 'express'
import { idSchema } from '../schemas/global.schema'
import { DefaultClientPermissionsModel } from '../models/defaultClientPermissions'

export class DefaultClientPermissionsController {
    static async add(req: Request, res: Response) {
        const { permissionId } = req.body

        const { error } = idSchema.safeParse(permissionId)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const createdAt = new Date().toISOString()

        const [err, result] = await DefaultClientPermissionsModel.add({
            permissionId,
            createdAt,
        })

        if (err) {
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
        const [err, result] = await DefaultClientPermissionsModel.getAll()

        if (err) {
            res.status(500).json({
                error: 'Error al guardar el permiso',
            })
            return
        }

        if (result.length === 0) {
            res.status(404).json({
                error: 'No hay permisos',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getByPermissionId(req: Request, res: Response) {
        const { permissionId } = req.params

        const { error } = idSchema.safeParse(permissionId)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] =
            await DefaultClientPermissionsModel.getByPermissionId({
                permissionId,
            })

        if (err) {
            res.status(500).json({
                error: 'Error al guardar el permiso',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'No hay permiso',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
