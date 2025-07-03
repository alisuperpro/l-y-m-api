import { Request, Response } from 'express'
import { StatesModel } from '../models/states'
import { idSchema, statesSchema } from '../schemas/global.schema'

export class StatesController {
    static async add(req: Request, res: Response) {
        const { state } = req.body

        const { error } = statesSchema.safeParse(state)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [findErr, existingState] = await StatesModel.findByState({
            state,
        })

        if (findErr) {
            res.status(500).json({
                error: 'Error al buscar el estado',
            })
            return
        }
        if (existingState) {
            res.status(400).json({
                error: 'El estado ya existe',
            })
            return
        }
        const [err, result] = await StatesModel.add({ state })

        if (err) {
            res.status(500).json({
                error: 'Error al agregar el estado',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findById(req: Request, res: Response) {
        const { id } = req.params

        const { error } = idSchema.safeParse(id)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] = await StatesModel.findById({ id })

        if (err) {
            res.status(500).json({
                error: 'Error al buscar el estado',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'No se encontró el estado',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllStates(req: Request, res: Response) {
        const [err, result] = await StatesModel.getAllStates()

        if (err) {
            res.status(500).json({
                error: 'Error al buscar los estados',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
