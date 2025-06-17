import { Request, Response } from 'express'
import { ResourcesModel } from '../models/resources'

export class ResourcesController {
    static async add(req: Request, res: Response) {
        const { name, description } = req.body
        const [error, result] = await ResourcesModel.add({ name, description })
        if (error) {
            res.status(500).json({ error: 'Error adding resource' })
        }

        if (!result) {
            res.status(400).json({ error: 'Resource not added' })
        }

        res.status(200).json({
            data: result,
        })
    }

    static async getById(req: Request, res: Response) {
        const { id } = req.params
        const [error, result] = await ResourcesModel.getById({ id })
        if (error) {
            res.status(500).json({ error: 'Error getting resource' })
        }

        if (!result) {
            res.status(404).json({ error: 'Resource not found' })
        }

        res.status(200).json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await ResourcesModel.getAll()
        if (error) {
            res.status(500).json({ error: 'Error getting resources' })
        }

        if (!result) {
            res.status(404).json({ error: 'Resources not found' })
        }

        res.status(200).json({
            data: result,
        })
    }
}
