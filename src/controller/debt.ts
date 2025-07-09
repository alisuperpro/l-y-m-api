import { Request, Response } from 'express'
import { DebtModel } from '../models/debt'
import { CanApproveOtherDebtsModel } from '../models/canApproveOtherDebts'

export class DebtController {
    static async add(req: Request, res: Response) {
        //@ts-ignore
        const { user } = req.session
        const { amount, clientId, description, status } = req.body

        if (!amount || !clientId || !status) {
            res.status(400).json({
                error: 'Faltan datos',
            })
            return
        }

        const createdAt = new Date().toISOString()

        const [error, result] = await DebtModel.add({
            amount,
            clientId,
            createdAt,
            createdBy: user.id,
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
        //@ts-ignore
        const { user } = req.session
        const [error, result] = await DebtModel.getAllDebtWithAllInfo({
            clientId: user.id,
        })

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

    static async getAll(req: Request, res: Response) {
        const order = req.query.order?.toString() ?? 'DESC'

        const [error, result] = await DebtModel.getAll({
            //@ts-ignore
            order: order ?? 'DESC',
        })

        if (error) {
            console.log({ error })
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        if (result.length === 0) {
            res.status(404).json({
                error: 'No se encontraron deudas',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllDebtsByStatusName(req: Request, res: Response) {
        const { status } = req.params

        const [error, result] = await DebtModel.getAllDebtsByStatusId({
            statusId: status,
            order: 'DESC',
        })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar la deuda',
            })
            return
        }

        if (result.length === 0) {
            res.status(404).json({
                error: 'No se encontraron deudas',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllDebtWithAllInfoByCreatedBy(req: Request, res: Response) {
        //@ts-ignore
        const { createdBy } = req.params
        const [error, result] =
            await DebtModel.getAllDebtWithAllInfoByCreatedBy({
                createdBy,
            })

        console.log({ result })

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
        //@ts-ignore
        const { user } = req.session
        const { status, debtId } = req.body

        const [findError, findResult] = await DebtModel.findById({ id: debtId })

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

        if (findResult.createdBy !== user.id) {
            const [approveError, approveResult] =
                await CanApproveOtherDebtsModel.findByCreatorId({
                    creatorId: user.id,
                })

            if (approveError) {
                res.status(500).json({
                    error: 'Error al buscar los permisos para aprovar otras deudas',
                })
                return
            }
            if (approveResult.length === 0) {
                res.status(403).json({
                    error: 'No tienes permisos para aprobar esta deuda',
                })
                return
            } else {
                const [error, result] = await DebtModel.updateStatus({
                    status,
                    id: debtId,
                })
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
        } else {
            const [error, result] = await DebtModel.updateStatus({
                status,
                id: debtId,
            })
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
}
