import { randomUUID } from 'node:crypto'
import { db } from '../db/db'

export class OrganizationsModel {
    static tableName = 'organizations'

    static async add({ name, createdAt }: { name: string; createdAt: string }) {
        try {
            const id = randomUUID()

            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, created_at) VALUES (?, ?, ?)`,
                args: [id, name, createdAt],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err) {
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
        } catch (err) {
            return [err]
        }
    }

    static async getAllOrganizations() {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
            })

            return [undefined, result.rows]
        } catch (err) {
            return [err]
        }
    }
}
