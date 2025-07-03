import { Request, Response } from 'express'
import { UserPermissionModel } from '../models/userPermission'

export class UserPermissionController {
    static async add(req: Request, res: Response) {
        const { userId, permissionId } = req.body

        if (!userId || !permissionId) {
            res.status(400).json({
                error: 'Faltan datos',
            })
            return
        }

        const [error, result] = await UserPermissionModel.add({
            userId,
            permissionId,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al guardar',
            })
            return
        }

        if (!result) {
            res.status(500).json({
                error: 'Error al guardar',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getByUserId(req: Request, res: Response) {
        const { userId } = req.params

        if (!userId) {
            res.status(400).json({
                error: 'Falta el id',
            })

            return
        }

        const [error, result] = await UserPermissionModel.getByUserId({
            userId,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al encontrar los permisos',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'Permisos no encontrados',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await UserPermissionModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al obtener todos los permisos',
            })
            return
        }

        if (result.length === 0) {
            res.status(404).json({
                error: 'No hay permisos',
            })
        }

        res.json({
            data: result,
        })
    }
}
