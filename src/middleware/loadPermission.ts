import { NextFunction, Request, Response } from 'express'
import { RoutePermissionMapModel } from '../models/routePermissionMap'
import { ResourcesModel } from '../models/resources'
import { PermissionModel } from '../models/permision'
import { ActionsModel } from '../models/actions'

export class setRoutePermission {
    static setRouteResources(resources: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const [error, result] = await ResourcesModel.getByName({
                name: resources ?? '',
            })

            if (error) {
                res.status(500).json({
                    error: 'No se ha establecido recurso alguno',
                })
                return
            }

            if (result) {
                //@ts-ignore
                req.resources = result.id ?? ''
                next()
                return
            } else {
                res.status(404).json({
                    error: 'No se encontro el recurso',
                })
                return
            }
        }
    }
    static async loadRoutePermission(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const httpMethod = req.method
        //@ts-ignore
        const resources = req.resources

        const [actionError, actionResult] = await ActionsModel.getByName({
            name: httpMethod,
        })

        if (actionError) {
            res.status(500).json({
                error: 'Error al buscar la accion',
            })
            return
        }

        if (!actionResult) {
            res.status(404).json({
                error: 'No se encontro la accion',
            })
            return
        }

        const [permissionError, permissionResult] =
            await PermissionModel.findByResourcesIdAndAction({
                resourcesId: resources,
                //@ts-ignore
                actionId: actionResult.id,
            })

        if (permissionError) {
            res.status(500).json({
                error: 'Error al buscar el permiso',
            })
            return
        }

        if (!permissionResult) {
            res.status(404).json({
                error: 'No se encontro el permiso',
            })
            return
        }

        //@ts-ignore
        req.routePermission = permissionResult
        next()
    }
}
