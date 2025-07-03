import { db } from '../db/db'

export class DefaultClientPermissionsModel {
    static tableName = 'default_client_permissions'

    static async add({
        permissionId,
        createdAt,
    }: {
        permissionId: string
        createdAt: string
    }) {
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (permission_id, created_at) VALUES (?,?)`,
                args: [permissionId, createdAt],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE permission_id = ?`,
                args: [permissionId],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
                args: [],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getByPermissionId({ permissionId }: { permissionId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE permission_id = ?`,
                args: [permissionId],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }
}
