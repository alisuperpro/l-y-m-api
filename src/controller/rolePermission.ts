import { Request, Response } from 'express'
import { RolePermissionModel } from '../models/rolePermission'

export class RolePermissionController {
    static async add(req: Request, res: Response) {
        const { roleId, permissionId } = req.body

        const [error, result] = await RolePermissionModel.add({
            roleId,
            permissionId,
        })

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

    static async findByRoleId(req: Request, res: Response) {
        const { roleId } = req.params

        const [error, result] = await RolePermissionModel.findByRoleId({
            roleId,
        })

        if (error) {
            res.status(500).json({ error: 'Error al obtener los roles' })
            return
        }

        if (result.length === 0) {
            res.status(404).json({ error: 'No se encontraron roles' })
            return
        }

        res.json({ data: result })
    }

    static async findByPermissionId(req: Request, res: Response) {
        const { permissionId } = req.params

        const [error, result] = await RolePermissionModel.findByPermissionId({
            permissionId,
        })

        if (error) {
            res.status(500).json({ error: 'Error al obtener los permisos' })
            return
        }

        if (result.length === 0) {
            res.status(404).json({ error: 'No se encontraron permisos' })
            return
        }

        res.json({ data: result })
    }
}
