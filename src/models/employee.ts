import { db } from '../db/db'
import { randomUUID } from 'node:crypto'
import { Employee } from '../types/types'

export class EmployeeModel {
    static tableName = 'employee'

    static async add({
        name,
        username,
        password,
        roleId,
        departmentId,
        created_at,
    }: {
        name: string
        username: string
        password: string
        roleId: string
        departmentId: string
        created_at: string
    }): Promise<[any?, Employee?]> {
        const id = randomUUID()
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, username, password, role_id, department_id, created_at) VALUES (?,?,?,?,?,?,?)`,
                args: [
                    id,
                    name,
                    username,
                    password,
                    roleId,
                    departmentId,
                    created_at,
                ],
            })

            const result = await db.execute({
                sql: `SELECT id, name, username, role_id, department_id, created_at FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            const row = result.rows[0]
            const data: Employee = {
                id: row.id as string,
                name: row.name as string,
                username: row.username as string,
                role_id: row.role_id as string,
                department_id: row.department_id as string,
                created_at: row.created_at as string,
            }

            return [undefined, data]
        } catch (err: any) {
            return [err]
        }
    }

    static async findEmployeeById({
        id,
    }: {
        id: string
    }): Promise<[any?, Employee?]> {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, role_id, department_id, created_at FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })
            const row = result.rows[0]
            const data: Employee = {
                id: row.id as string,
                name: row.name as string,
                username: row.username as string,
                role_id: row.role_id as string,
                department_id: row.department_id as string,
                created_at: row.created_at as string,
            }

            return [undefined, data]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, role_id, department_id, created_at FROM ${this.tableName}`,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByUsername({ username }: { username: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, role_id, department_id, created_at FROM ${this.tableName} WHERE username = ?`,
                args: [username],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByUsernameWithPassword({
        username,
    }: {
        username: string
    }) {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, password, role_id, department_id, created_at FROM ${this.tableName} WHERE username = ?`,
                args: [username],
            })

            return [undefined, result.rows[0]]
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
