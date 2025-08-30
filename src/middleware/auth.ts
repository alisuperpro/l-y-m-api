import { NextFunction, Request, Response } from 'express'
import { UserPermissionModel } from '../models/userPermission'
import { RolePermissionModel } from '../models/rolePermission'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const routePermission = req.routePermission
    //@ts-ignore
    const { user } = req.session

    const [error, result] = await RolePermissionModel.getByRoleAndPermissionId({
        roleId: user.role_id,
        permissionId: routePermission.id,
    })

    if (error) {
        res.status(500).json({
            error: 'Error al buscar los permisos del usuario',
        })
        return
    }

    if (!result) {
        res.status(403).json({
            error: 'No tienes permisos para acceder a esta ruta',
        })
        return
    }

    next()
}
