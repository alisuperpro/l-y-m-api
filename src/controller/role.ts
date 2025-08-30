import { Request, Response } from 'express'
import { RoleModel } from '../models/role'

export class RoleController {
    static async add(req: Request, res: Response) {
        const { name, description } = req.body

        const [findError, findName] = await RoleModel.findByRole({ name })
        if (findName) {
            res.status(403).json({ error: 'El rol ya existe' })
            return
        }

        if (findError) {
            res.status(500).json({
                error: 'error al guardar el rol',
            })
            return
        }

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

        if (result.length === 0) {
            res.status(404).json({ error: 'No hay roles' })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findById(req: Request, res: Response) {
        const { id } = req.params

        const [error, result] = await RoleModel.findById({ id })

        if (error) {
            res.status(500).json({ error: 'Error al buscar el rol' })
            return
        }

        if (!result) {
            res.status(404).json({ error: 'El rol no existe' })
            return
        }

        res.json({ data: result })
    }
}
