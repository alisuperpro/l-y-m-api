import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class EmployeeModel {
    static tableName = 'employee'

    static async add({
        name,
        username,
        password,
        role,
        permission_id,
        department,
        created_at,
    }: {
        name: string
        username: string
        password: string
        role: string
        permission_id: string
        department: string
        created_at: string
    }) {
        const id = randomUUID()
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, username, password, role_id, permission_id, department, created_at) VALUES (?,?,?,?,?,?,?,?)`,
                args: [
                    id,
                    name,
                    username,
                    password,
                    role,
                    permission_id,
                    department,
                    created_at,
                ],
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

    static async findEmployeeById({ id }: { id: string }) {
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
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }
}
