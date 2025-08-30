import { appEventEmitter } from './eventEmitter'

export async function setupClientService() {
    appEventEmitter.on('clientCreated', async (data: any) => {
        console.log(
            `[Client Services] Agregar los permisos por defecto que tendra el nuevo cliente ${data.id}`
        )
    })

    console.log('[Client Services] Escuchando eventos')
}
