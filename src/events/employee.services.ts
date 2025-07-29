import { PermissionModel } from '../models/permision'
import { UserPermissionModel } from '../models/userPermission'
import { appEventEmitter } from './eventEmitter'

export async function setupEmployeeService() {
    appEventEmitter.on(
        'employeeCreated',
        async ({
            employeeId,
            permissionList,
        }: {
            employeeId: string
            permissionList: { resourcesId: string; actionId: string }[]
        }) => {
            console.log(
                `[Employee Services] Agregar los permisos para ${employeeId}`
            )

            const permissions = await Promise.all(
                permissionList.map(async (permission) => {
                    const [err, result] =
                        await PermissionModel.findByResourcesIdAndAction({
                            resourcesId: permission.resourcesId,
                            actionId: permission.actionId,
                        })

                    if (result) {
                        return { permission_id: result.id }
                    }
                })
            )

            if (permissions.length === 0) {
                console.error({
                    error: 'Error no hay permisos',
                })
                return
            }

            const [error, userPermission] = await UserPermissionModel.AddOnList(
                {
                    permissionList: permissions,
                    userId: employeeId,
                }
            )

            if (error) {
                console.error({
                    error: 'Error con los permisos del empleado',
                })
                return
            }
        }
    )

    console.log('[Employee Services] Escuchando eventos')
}
