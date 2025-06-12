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

        if (!result) {
            res.status(404).json({
                error: 'No se encontró la deuda',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllDebtWithAllInfo(req: Request, res: Response) {
        const [error, result] = await DebtModel.getAllDebtWithAllInfo()

        if (result.length === 0) {
            res.status(404).json({
                error: 'No se encontraron deudas',
            })
            return
        }

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

        const [findError, findResult] = await DebtModel.findById({ id })

        if (findError) {
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        if (!findResult) {
            res.status(404).json({
                error: 'No se encontró la deuda',
            })
            return
        }
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
