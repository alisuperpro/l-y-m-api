import { appEventEmitter } from '../events/eventEmitter'
import { PayModel } from '../models/pay'
import { Request, Response } from 'express'
import { StatesModel } from '../models/states'
import { DebtModel } from '../models/debt'

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
        } = req.body

        const createdAt = new Date().toISOString()

        const [stateError, stateResult] =
            await StatesModel.findBySlugAndResources({
                slug: 'on process',
                //@ts-ignore
                resources: req.resources,
            })

        const [error, pay] = await PayModel.add({
            referenceCode,
            payDate,
            createdAt,
            clientId,
            photoUrl,
            description,
            amount,
            debtId,
            //@ts-ignore
            status: stateResult.id,
        })

        console.log(error)
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

        appEventEmitter.emit('debtPay', {
            debtId: debtId,
        })

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
        const { orderBy, state } = req.query
        const [error, pays] = await PayModel.getAll({
            orderBy: orderBy as 'ASC' | 'DESC',
            state: state as string,
            limit: null,
        })

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

    static async approvedPay(req: Request, res: Response) {
        const { payId } = req.params
        //@ts-ignore
        const resource = req.resources

        const [error, result] = await PayModel.getById({ id: payId })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar el pago',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'Pago no encontrado',
            })
            return
        }

        const [debtError, debtResult] = await DebtModel.findById({
            //@ts-ignore
            id: result.debt_id,
        })

        if (debtError) {
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        const [stateError, stateResult] =
            await StatesModel.findBySlugAndResources({
                slug: 'confirmed',
                resources: resource,
            })

        if (stateError) {
            res.status(500).json({
                error: 'Error al buscar el estado para el pago',
            })
            return
        }

        const [payError, payResult] = await PayModel.updateStatus({
            id: payId,
            //@ts-ignore
            status: stateResult.id,
        })

        if (payError) {
            res.status(500).json({
                error: 'Error al actualizar el estado del pago',
            })
        }

        if (!payResult) {
            res.status(404).json({
                error: 'Pago no encontrado',
            })
            return
        }

        appEventEmitter.emit('payApproved', {
            ...payResult,
        })

        //@ts-ignore
        if (result.amount === debtResult.amount) {
            appEventEmitter.emit('debtPaid', {
                //@ts-ignore
                debtId: payResult.debt_id,
            })
        } else {
            //@ts-ignore
            const newAmount = debtResult.amount - result.amount
            const verifyAmount = newAmount < 0 ? 0 : newAmount
            appEventEmitter.emit('Partial payment debt', {
                //@ts-ignore
                debtId: payResult.debt_id,
                amount: verifyAmount,
            })
        }

        res.json({
            data: payResult,
        })
    }

    static async getByClientId(req: Request, res: Response) {
        const { clientId } = req.params
        const { orderBy, state } = req.query

        const [error, pays] = await PayModel.getByClientId({
            clientId,
            orderBy: orderBy as 'ASC' | 'DESC',
            state: state as string,
        })

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
