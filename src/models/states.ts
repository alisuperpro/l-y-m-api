import { randomUUID } from 'node:crypto'
import { db } from '../db/db'

export class StatesModel {
    static tableName = 'states'

    static async add({ state }: { state: string }) {
        try {
            const id = randomUUID()

            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, state) VALUES (?, ?)`,
                args: [id, state],
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

    static async findByState({ state }: { state: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE state = ?`,
                args: [state],
            })

            return [undefined, result.rows[0]]
        } catch (err) {
            return [err]
        }
    }

    static async getAllStates() {
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
