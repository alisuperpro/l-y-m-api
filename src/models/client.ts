import { randomUUID } from 'node:crypto'
import { db } from '../db/db'

export class ClientModel {
    static tableName = 'clients'

    static async add({
        name,
        username,
        password,
        created_at,
    }: {
        name: string
        username: string
        password: string
        created_at: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, username, password, created_at) VALUES (?,?,?,?,?)`,
                args: [id, name, username, password, created_at],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findClientById({ id }: { id: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows]
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
}
