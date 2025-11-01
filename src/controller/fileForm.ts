import { Request, Response } from 'express'
import { FileFormModel } from '../models/fileForm'

export class FileFormController {
    static async add(req: Request, res: Response) {
        const { name } = req.body

        if (!name) {
            res.status(400).json({
                error: 'Falta el nombre',
            })
            return
        }

        const slug = name.replace(' ', '-').toLowerCase()

        const [error, result] = await FileFormModel.add({ name, slug })

        if (error) {
            res.status(500).json({
                error: 'Error agregar el nombre de archivo',
            })
            return
        }

        res.json({
            data: 'Success',
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await FileFormModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error buscar todos los nombre de archivo',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
