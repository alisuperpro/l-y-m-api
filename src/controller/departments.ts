import { Request, Response } from 'express'
import { DepartmentsModel } from '../models/departments'

export class DepartmentsController {
    static async add(req: Request, res: Response) {
        const { name } = req.body

        const [error2, result2] = await DepartmentsModel.findByName({ name })
        if (error2) {
            res.status(500).json({ error: 'Error al crear el departamento' })
            return
        }
        if (result2) {
            res.status(403).json({ error: 'El departamento ya existe' })
            return
        }

        const [error, result] = await DepartmentsModel.add({
            name,
            created_at: new Date().toISOString(),
        })
        if (error) {
            res.status(500).json({ error: 'Error al crear el departamento' })
        }

        res.json({
            data: result,
        })
    }

    static async findById(req: Request, res: Response) {
        const { id } = req.params

        const [error, result] = await DepartmentsModel.findById({ id })

        if (error) {
            res.status(500).json({ error: 'Error al buscar el departamento' })
        }

        if (!result) {
            res.status(404).json({ error: 'El departamento no existe' })
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await DepartmentsModel.getAll()

        if (error) {
            res.status(500).json({ error: 'Error al buscar los departamentos' })
        }

        res.json({
            data: result,
        })
    }

    static async delete(req: Request, res: Response) {
        const { id } = req.body

        if (!id) {
            res.status(403).json({
                error: 'Falta el id',
            })
            return
        }

        const [error2, result2] = await DepartmentsModel.findById({ id })
        if (error2) {
            res.status(500).json({ error: 'Error al buscar el departamento' })
            return
        }
        if (!result2) {
            res.status(404).json({ error: 'El departamento no existe' })
            return
        }

        const [error, result] = await DepartmentsModel.delete({ id })

        if (error) {
            res.status(500).json({
                error: 'Error al borrar el empleado',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
