import { Request, Response } from 'express'
import { DebtModel } from '../models/debt'

export class DebtController {
    static async add(req: Request, res: Response) {
        const { amount, clientId, createdBy, date, description, status } =
            req.body

        const createdAt = new Date().toISOString()

        const [error, result] = await DebtModel.add({
            amount,
            clientId,
            createdAt,
            createdBy,
            date,
            description: description === undefined ? null : description,
            status,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al crear la deuda',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getById(req: Request, res: Response) {
        const { id } = req.params

        const [error, result] = await DebtModel.findById({ id })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllDebtWithAllInfo(req: Request, res: Response) {
        const [error, result] = await DebtModel.getAllDebtWithAllInfo()

        if (error) {
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async updateStatus(req: Request, res: Response) {
        const { status, id } = req.body

        const [error, result] = await DebtModel.updateStatus({ status, id })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
