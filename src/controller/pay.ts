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
            debtId,
            status,
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
            debtId,
            status,
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

    static async getByStatus(req: Request, res: Response) {
        const { status } = req.params

        const [error, pays] = await PayModel.getByStatus({ status })

        if (error) {
            res.status(500).json({
                error: 'Error al obtener los pagos por estado',
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

    static async updateStatus(req: Request, res: Response) {
        const { id } = req.params
        const { status } = req.body

        const [findError, existingPay] = await PayModel.getById({ id })

        if (findError) {
            res.status(500).json({
                error: 'Error al buscar el pago existente',
            })
            return
        }

        if (!existingPay) {
            res.status(404).json({
                error: 'No se encontró el pago',
            })
            return
        }

        const [error, pay] = await PayModel.updateStatus({ id, status })

        if (error) {
            res.status(500).json({
                error: 'Error al actualizar el estado del pago',
            })
            return
        }

        if (!pay) {
            res.status(404).json({
                error: 'No se encontró el pago',
            })
            return
        }

        res.json({
            data: pay,
        })
    }

    static async getByClientId(req: Request, res: Response) {
        const { clientId } = req.params

        const [error, pays] = await PayModel.getByClientId({ clientId })

        if (error) {
            res.status(500).json({
                error: 'Error al obtener los pagos por cliente',
            })
            return
        }

        if (!pays) {
            res.status(404).json({
                error: 'No se encontraron pagos para este cliente',
            })
            return
        }

        res.status(200).json({
            data: pays,
        })
    }
}
