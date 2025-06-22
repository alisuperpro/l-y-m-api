import { Request, Response } from 'express'
import { RoutePermissionMapModel } from '../models/routePermissionMap'

export class RoutePermissionMapController {
    static async add(req: Request, res: Response) {
        const { routePath, httpMethod, permissionId } = req.body

        const [error, result] = await RoutePermissionMapModel.add({
            routePath,
            httpMethod,
            permissionId,
        })

        if (error) {
            res.status(500).json({ error: 'Error adding route permission map' })
            return
        }

        if (!result) {
            res.status(404).json({ error: 'Route permission map not found' })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await RoutePermissionMapModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error getting all route permission maps',
            })
            return
        }

        if (!result) {
            res.status(404).json({ error: 'No route permission maps found' })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getByPermissionId(req: Request, res: Response) {
        const { permissionId } = req.params

        const [error, result] = await RoutePermissionMapModel.getByPermissionId(
            {
                permissionId,
            }
        )

        if (error) {
            res.status(500).json({
                error: 'Error getting route permission map',
            })
            return
        }

        if (!result) {
            res.status(404).json({ error: 'Route permission map not found' })
            return
        }

        res.json({
            data: result,
        })
    }
}
