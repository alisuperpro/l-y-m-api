import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class ResourcesModel {
    static tableName = 'resources'

    static async add({
        name,
        description,
    }: {
        name: string
        description: string
    }) {
        const id = randomUUID()
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, description) VALUES (?, ?, ?)`,
                args: [
                    id,
                    name,
                    description === undefined ? null : description,
                ],
            })
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })
            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getById({ id }: { id: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })
            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getByName({ name }: { name: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE name = ?`,
                args: [name],
            })
            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
            })
            return [undefined, result.rows]
        } catch (error) {
            return [error]
        }
    }
}
