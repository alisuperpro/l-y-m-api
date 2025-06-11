import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class DepartmentsModel {
    static tableName = 'departments'

    static async add({
        name,
        created_at,
    }: {
        name: string
        created_at: string
    }) {
        const id = randomUUID()
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, created_at) VALUES (?, ?, ?)`,
                args: [id, name, created_at],
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

    static async findByName({ name }: { name: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE name = ?`,
                args: [name],
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
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async delete({ id }: { id: string }) {
        try {
            const result = await db.execute({
                sql: `DELETE FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }
}
