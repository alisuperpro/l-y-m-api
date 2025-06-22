import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class RoutePermissionMapModel {
    private static readonly tableName = 'route_permission_map'

    static async add({
        routePath,
        httpMethod,
        permissionId,
    }: {
        routePath: string
        httpMethod: string
        permissionId: string
    }) {
        try {
            const id = randomUUID()
            const sql = `INSERT INTO ${RoutePermissionMapModel.tableName} (id, route_path, http_method, permission_id) VALUES (?, ?, ?, ?)`
            await db.execute(sql, [id, routePath, httpMethod, permissionId])

            const result = await db.execute({
                sql: `SELECT * FROM ${RoutePermissionMapModel.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${RoutePermissionMapModel.tableName}`,
            })

            return [undefined, result.rows]
        } catch (error) {
            return [error]
        }
    }

    static async getByRoutePath({ routePath }: { routePath: string }) {
        const sql = `SELECT * FROM ${RoutePermissionMapModel.tableName} WHERE route_path = ?`

        try {
            const result = await db.execute({
                sql,
                args: [routePath],
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getByPermissionId({ permissionId }: { permissionId: string }) {
        const sql = `SELECT * FROM ${RoutePermissionMapModel.tableName} WHERE permission_id = ?`

        try {
            const result = await db.execute({
                sql,
                args: [permissionId],
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }
}
