import { NextFunction, Request, Response } from 'express'
import { PermissionModel } from '../models/permision'
import { RolePermissionModel } from '../models/rolePermission'

export const authoEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //@ts-ignore
    const routePermission = req.routePermission
    //@ts-ignore
    const { user } = req.session

    const [rolePermissionError, rolePermission] =
        await RolePermissionModel.findByRoleId({ roleId: user.role_id })

    if (rolePermissionError) {
        res.status(500).json({
            error: 'Error al obtener los permisos del rol',
        })
        return
    }

    if (!rolePermission) {
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

    const perm = rolePermission.find(
        (rp: { permission_id: any }) =>
            rp.permission_id === routePermission.permission_id
    )

    if (!perm) {
        res.status(401).json({
            error: 'No tienes permisos para acceder a esta ruta',
        })
        return
    }
    next()
}
