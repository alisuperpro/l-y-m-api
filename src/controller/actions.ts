import { Request, Response } from 'express'
import { ActionsModel } from '../models/actions'

export class ActionsController {
    static async add(req: Request, res: Response) {
        const { name, description } = req.body
        const [error, result] = await ActionsModel.add({ name, description })
        if (error) {
            res.status(500).json({ error: 'Error adding action' })
        }

        if (!result) {
            res.status(400).json({ error: 'Action not added' })
        }

        res.status(200).json({ data: result })
    }

    static async getById(req: Request, res: Response) {
        const { id } = req.params
        const [error, result] = await ActionsModel.getById({ id })
        if (error) {
            res.status(500).json({ error: 'Error getting action' })
        }

        if (!result) {
            res.status(404).json({ error: 'Action not found' })
        }

        res.status(200).json({ data: result })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await ActionsModel.getAll()
        if (error) {
            res.status(500).json({ error: 'Error getting actions' })
        }

        if (!result) {
            res.status(404).json({ error: 'Actions not found' })
        }

        res.status(200).json({ data: result })
    }
}
