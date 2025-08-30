import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class RoleModel {
    static tableName = 'role'

    static async add({
        name,
        description,
    }: {
        name: string
        description: string | null
    }) {
        try {
            const id = randomUUID()
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, description) VALUES (?,?,?)`,
                args: [id, name, description],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
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

    static async getAll() {
        try {
            const result = await db.execute(`SELECT * FROM ${this.tableName}`)

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByRole({ name }: { name: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE role = ?`,
                args: [name],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }
}
