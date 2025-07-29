import { NextFunction, Request, Response } from 'express'
import { ClientModel } from '../models/client'
import { StatesModel } from '../models/states'
import { DebtModel } from '../models/debt'

export const verifyExpireClientDebtMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //@ts-ignore
    const { user } = req.session

    const debtExpired = await verifyExpireClientDebts({
        clientId: user.id,
        state: 'pendiente',
    })

    if (debtExpired) {
        res.status(500).json({
            error: debtExpired,
        })
        return
    }

    next()
}

export const verifyExpireClientDebts = async ({
    clientId,
    state = 'pendiente',
}: {
    clientId: string
    state: string
}) => {
    const [clientError, clientResult] = await ClientModel.findClientById({
        id: clientId,
    })

    if (clientError) {
        return 'Error al buscar el cliente para verificar las deudas'
    }

    if (!clientResult) {
        return 'Error cliente no encontrado'
    }

    const [stateError, stateResult] = await StatesModel.findByState({
        state: state,
    })

    if (stateError) {
        return 'Error al buscar el estado de las deudas'
    }

    if (!stateResult) {
        return 'Error estado no encontrado'
    }

    const [debtError, debtResult] = await DebtModel.findByStatus({
        status: 'pendiente',
    })

    if (debtError) {
        return 'Error al buscar las deudas del cliente'
    }

    if (!debtResult) {
        return 'No hay deudas pendientes'
    }

    const debtExpired = debtResult.find((el: { debt_created_at: string }) => {
        const date = el.debt_created_at
        const diff = getDaysDifference(date)

        if (diff >= 30) {
            return el
        }
    })

    return debtExpired
}

export function getDaysDifference(isoDateString: string) {
    // 1. Crear objetos Date
    const dateFromIso = new Date(isoDateString)
    const currentDate = new Date()

    // Asegúrate de que ambas fechas estén en la misma zona horaria
    // o al menos considerar si quieres la diferencia en UTC o local.
    // Para una comparación de "días completos", a menudo es mejor usar UTC
    // para evitar problemas con los cambios de horario de verano, etc.
    // Sin embargo, para una diferencia simple de días desde la fecha actual,
    // la zona horaria local suele ser suficiente si solo te interesa
    // la diferencia "perceptible" en días.

    // Si quieres ignorar la hora y solo comparar el día:
    dateFromIso.setHours(0, 0, 0, 0)
    currentDate.setHours(0, 0, 0, 0)

    // 2. Calcular la diferencia en milisegundos
    const differenceInMilliseconds =
        currentDate.getTime() - dateFromIso.getTime()

    // 3. Convertir milisegundos a días
    const millisecondsPerDay = 1000 * 60 * 60 * 24
    let differenceInDays = differenceInMilliseconds / millisecondsPerDay

    // 4. Redondear (opcional)
    // Puedes usar Math.floor para obtener el número de días completos pasados
    // o Math.round si quieres redondear al día más cercano.
    // Math.ceil si quieres el número de días "hasta" la fecha.
    // En este caso, para saber "los días de diferencia", Math.floor es común.
    differenceInDays = Math.floor(differenceInDays)

    return differenceInDays
}
