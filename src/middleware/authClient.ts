import { NextFunction, Request, Response } from 'express'
import { PermissionModel } from '../models/permision'
import { ClientPermissionModel } from '../models/userPermission'

export const authClient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //@ts-ignore
    const routePermission = req.routePermission
    //@ts-ignore
    const { user } = req.session
    console.log({ user })

    const [clientPermissionError, clientPermission] =
        await ClientPermissionModel.getByClientId({ clientId: user.id })

    if (clientPermissionError) {
        res.status(500).json({
            error: 'Error al obtener los permisos del rol',
        })
        return
    }

    if (!clientPermission) {
        res.status(500).json({
            error: 'Error al obtener los permisos del rol',
        })
        return
    }

    const [permissionError, permissions] = await PermissionModel.findById({
        id: routePermission.permission_id,
    })

    if (permissionError) {
        res.status(500).json({
            error: 'Error al obtener los permisos',
        })
        return
    }

    if (!permissions) {
        res.status(500).json({
            error: 'Error al obtener los permisos',
        })
        return
    }

    const perm = clientPermission.find(
        (rp: { permission_id: any }) =>
            rp.permission_id === routePermission.permission_id
    )

    if (!perm) {
        res.status(403).json({
            error: 'No tienes permisos para acceder a esta ruta',
        })
        return
    }
    next()
}
