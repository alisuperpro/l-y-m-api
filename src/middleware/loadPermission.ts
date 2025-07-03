import { NextFunction, Request, Response } from 'express'
import { RoutePermissionMapModel } from '../models/routePermissionMap'

export class setRoutePermission {
    static async loadRoutePermission(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const path = `${req.baseUrl}${req.route.path}`
        const [error, result] = await RoutePermissionMapModel.getByRoutePath({
            routePath: path,
        })
        if (error) {
            res.status(500).json({
                error: 'Error al obtener los permisos de la ruta',
            })
            return
        }

        if (!result) {
            res.status(404).json({ error: 'Ruta no encontrada' })
            return
        }

        //@ts-ignore
        req.routePermission = result
        next()
    }
}
