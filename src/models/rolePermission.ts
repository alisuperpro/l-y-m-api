import { db } from '../db/db'

export class RolePermissionModel {
    static tableName = 'role_permission'

    static async add({
        roleId,
        permissionId,
    }: {
        roleId: string
        permissionId: string
    }) {
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (role_id, permission_id) VALUES (?,?)`,
                args: [roleId, permissionId],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE role_id = ?`,
                args: [roleId],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute(`SELECT * FROM ${this.tableName}`)

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByRoleId({ roleId }: { roleId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE role_id = ?`,
                args: [roleId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByPermissionId({
        permissionId,
    }: {
        permissionId: string
    }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE permission_id = ?`,
                args: [permissionId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }
}
