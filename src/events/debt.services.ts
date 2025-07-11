import { DebtModel } from '../models/debt'
import { ResourcesModel } from '../models/resources'
import { StatesModel } from '../models/states'
import { appEventEmitter } from './eventEmitter'

export async function setupDebtService() {
    appEventEmitter.on('debtPay', async (data: any) => {
        console.log(
            `[Debt Services] Actualizar el estado de la deuda por pagar`
        )

        const [resourceError, resourceResult] = await ResourcesModel.getByName({
            name: 'debt',
        })

        if (resourceError) {
            console.log('Error al buscar el recurso: ', resourceError)
            return
        }

        const [stateError, stateResult] =
            await StatesModel.findBySlugAndResources({
                //@ts-ignore
                resources: resourceResult.id,
                slug: 'on process',
            })

        const [debtError, debtResult] = await DebtModel.updateStatus({
            id: data.debtId,
            //@ts-ignore
            status: stateResult.id,
        })

        if (debtError) {
            console.log(
                'Error al actualizar el estado de la deuda: ',
                debtError
            )
            return
        }

        console.log('Deuda actualizada: ', debtResult.id)
    })

    appEventEmitter.on('debtPaid', async (data: any) => {
        console.log(
            `[Debt Services] Actualizar el estado de la deuda a aprovada`
        )

        const [resourceError, resourceResult] = await ResourcesModel.getByName({
            name: 'debt',
        })

        if (resourceError) {
            console.log('Error al buscar el recurso: ', resourceError)
            return
        }

        const [stateError, stateResult] =
            await StatesModel.findBySlugAndResources({
                //@ts-ignore
                resources: resourceResult.id,
                slug: 'paid',
            })

        const [debtError, debtResult] = await DebtModel.updateStatus({
            id: data.debtId,
            //@ts-ignore
            status: stateResult.id,
        })

        if (debtError) {
            console.log(
                'Error al actualizar el estado de la deuda: ',
                debtError
            )
            return
        }

        console.log('Deuda actualizada: ', debtResult.id)
    })

    console.log('[Debt Services] Escuchando eventos')
}
