import { PayModel } from '../models/pay'
import { Request, Response } from 'express'

export class PayController {
    static async add(req: Request, res: Response) {
        const {
            referenceCode,
            payDate,
            clientId,
            photoUrl,
            description,
            amount,
            paidToDepartment,
            debtId,
        } = req.body

        const createdAt = new Date().toISOString()

        const [error, pay] = await PayModel.add({
            referenceCode,
            payDate,
            createdAt,
            clientId,
            photoUrl,
            description,
            amount,
            paidToDepartment,
            debtId,
        })

        if (error) {
            res.status(500).json({
                error: 'Error al agregar el pago',
            })
            return
        }

        if (!pay) {
            res.status(404).json({
                error: 'No se encontró el pago',
            })
            return
        }

        res.status(200).json({
            data: pay,
        })
    }

    static async getById(req: Request, res: Response) {
        const { id } = req.params

        const [error, pay] = await PayModel.getById({ id })

        if (error) {
            res.status(500).json({
                error: 'Error al obtener el pago',
            })
            return
        }

        if (!pay) {
            res.status(404).json({
                error: 'No se encontró el pago',
            })
            return
        }

        res.status(200).json({
            data: pay,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, pays] = await PayModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al obtener los pagos',
            })
            return
        }

        if (!pays) {
            res.status(404).json({
                error: 'No se encontraron pagos',
            })
            return
        }

        res.status(200).json({
            data: pays,
        })
    }
}
