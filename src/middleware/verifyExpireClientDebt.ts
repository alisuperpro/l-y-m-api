import { NextFunction, Request, Response } from 'express'
import { ClientModel } from '../models/client'
import { StatesModel } from '../models/states'
import { DebtModel } from '../models/debt'

export const verifyExpireClientDebt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //@ts-ignore
    const { user } = req.session

    const [clientError, clientResult] = await ClientModel.findClientById({
        id: user.id,
    })

    if (clientError) {
        res.status(500).json({
            error: 'Error al buscar el cliente para verificar las deudas',
        })
        return
    }

    if (!clientResult) {
        res.status(404).json({
            error: 'Error cliente no encontrado',
        })
        return
    }

    const [stateError, stateResult] = await StatesModel.findByState({
        state: 'pendiente',
    })

    if (stateError) {
        res.status(500).json({
            error: 'Error al buscar el estado de las deudas',
        })
        return
    }

    if (!stateResult) {
        res.status(404).json({
            error: 'Error estado no encontrado',
        })
        return
    }

    const currentDate = new Date()

    const newDate = new Date(currentDate.getTime())

    // Sumamos 30 días a la nueva fecha
    newDate.setDate(newDate.getDate() + 30)

    const [debtError, debtResult] =
        await DebtModel.getDebtsByClientToVerifyExpireDebt({
            clientId: user.id,
            order: 'DESC',
            //@ts-ignore
            status: stateResult.state,
            date: newDate.toISOString(),
        })

    if (debtError) {
        res.status(500).json({
            error: 'Error al buscar las deudas del cliente',
        })
        return
    }

    if (debtResult) {
        res.status(403).json({
            error: 'Error cliente tiene deudas expiradas',
        })
        return
    }

    next()
}
