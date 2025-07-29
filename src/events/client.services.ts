import { DefaultClientPermissionsModel } from '../models/defaultClientPermissions'
import { UserPermissionModel } from '../models/userPermission'
import { appEventEmitter } from './eventEmitter'

export async function setupClientService() {
    appEventEmitter.on('clientCreated', async (data: any) => {
        console.log(
            `[Client Services] Agregar los permisos por defecto que tendra el nuevo cliente ${data.id}`
        )
        const [err, result] = await DefaultClientPermissionsModel.getAll()

        if (err) {
            console.error({
                error: 'Error al buscar los permisos por defecto',
            })
            return
        }

        if (!result) {
            console.log({
                error: 'No hay permisos por defecto',
            })
            return
        }

        const convert = result.map((element: { permission_id: any }) => {
            return { user_id: data.id, permission_id: element.permission_id }
        })

        if (convert.length === 0) {
            console.error({
                error: 'Error no hay permisos',
            })
            return
        }

        const [error, userPermission] = await UserPermissionModel.AddOnList({
            permissionList: convert,
            userId: data.id,
        })

        if (error) {
            console.error({
                error: 'Error con los permisos del client',
            })
            return
        }

        if (!result) {
            console.error({
                error: 'Error al otorgarle permisos al cliente ',
            })
            return
        }
    })

    console.log('[Client Services] Escuchando eventos')
}
