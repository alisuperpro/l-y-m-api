import { db } from '../db/db'

export class UserPermissionModel {
    private static tableName = 'user_permission'

    static async add({
        userId,
        permissionId,
    }: {
        userId: string
        permissionId: string
    }) {
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (user_id, permission_id) VALUES (?, ?)`,
                args: [userId, permissionId],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE permission_id = ? AND user_id = ?`,
                args: [permissionId, userId],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async getByUserId({ userId }: { userId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
                args: [userId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getByUserAndPermissionId({
        userId,
        permissionId,
    }: {
        userId: string
        permissionId: string
    }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE user_id = ? AND permission_id = ?`,
                args: [userId, permissionId],
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
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async AddOnList({
        permissionList,
        userId,
    }: {
        permissionList: any
        userId: string
    }) {
        const inserts = `INSERT INTO ${this.tableName} (user_id, permission_id) VALUES (?, ?)`

        const list = permissionList.map((permission: any) => {
            return {
                sql: inserts,
                args: [permission.user_id, permission.permission_id],
            }
        })
        try {
            await db.batch(list)

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
                args: [userId],
            })

            return [undefined, result.rows]
        } catch (err) {
            return [err]
        }
    }
}
