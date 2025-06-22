import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class PermissionModel {
    static tableName = 'permission'
    static async add({
        resourcesId,
        actionsId,
        description,
    }: {
        resourcesId: string
        actionsId: string
        description: string
    }) {
        try {
            const id = randomUUID()

            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, resources_id, actions_id, description) VALUES (?, ?, ?, ?)`,
                args: [
                    id,
                    resourcesId,
                    actionsId,
                    description === undefined ? null : description,
                ],
            })

            const [error, result] = await this.findById({ id })

            return [undefined, result]
        } catch (error: any) {
            return [error]
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

    static async findById({ id }: { id: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByResourcesId({ resourcesId }: { resourcesId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE resources_id = ?`,
                args: [resourcesId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }
}
