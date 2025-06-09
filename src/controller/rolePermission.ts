import { Request, Response } from 'express'
import { RolePermissionModel } from '../models/rolePermission'

export class RolePermissionController {
    static async add(req: Request, res: Response) {
        const { roleId, permissionId } = req.body

        const [error, result] = await RolePermissionModel.add({
            roleId,
            permissionId,
        })

        console.log(error)
        if (error) {
            res.status(500).json({
                error: 'Error al crear la relacion',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await RolePermissionModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al obtener los permisos',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
