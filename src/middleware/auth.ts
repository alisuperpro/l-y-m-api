import { NextFunction, Request, Response } from 'express'
import { PermissionModel } from '../models/permision'
import { UserPermissionModel } from '../models/userPermission'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const routePermission = req.routePermission
    //@ts-ignore
    const { user } = req.session

    const [error, result] = await UserPermissionModel.getByUserId({
        userId: user.id,
    })

    if (error) {
        res.status(500).json({
            error: 'Error al buscar los permisos del usuario',
        })
        return
    }

    if (!result) {
        res.status(404).json({
            error: 'Usuario no encontrado',
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

    const perm = result.find(
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
