import { Request, Response } from 'express'
import { RoleModel } from '../models/role'

export class RoleController {
    static async add(req: Request, res: Response) {
        const { name, description } = req.body

        const [error, result] = await RoleModel.add({ name, description })

        if (error) {
            res.status(500).json({
                error: 'error al guardar el rol',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await RoleModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al obtener los roles',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
