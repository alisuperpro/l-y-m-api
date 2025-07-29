import { db } from '../db/db'
import { randomUUID } from 'node:crypto'
import { Employee } from '../types/types'
import { QueryBuilder } from './queryBuilder'

export class EmployeeModel {
    static tableName = 'employee'

    static async add({
        name,
        username,
        password,
        roleId,
        created_at,
    }: {
        name: string
        username: string
        password: string
        roleId: string
        created_at: string
    }): Promise<[any?, Employee?]> {
        const id = randomUUID()
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, username, password, role_id, created_at) VALUES (?,?,?,?,?,?)`,
                args: [id, name, username, password, roleId, created_at],
            })

            const result = await db.execute({
                sql: `SELECT id, name, username, role_id, created_at FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            const row = result.rows[0]
            const data: Employee = {
                id: row.id as string,
                name: row.name as string,
                username: row.username as string,
                role_id: row.role_id as string,
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
    }): Promise<[any?, any?]> {
        const builder = new QueryBuilder(this.tableName)
        builder
            .select([
                'employee.id AS employee_id',
                'name',
                'username',
                'role.role AS role',
                'role_id',
                'created_at',
            ])
            .join('role', 'role.id = employee.role_id')
            .where('employee.id', id)
        try {
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll() {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'employee.id as employee_id',
                'name',
                'username',
                'role.role as role',
                'role_id',
            ])
            .join('role', 'role.id = employee.role_id')
        try {
            const result = await db.execute({
                sql: builder.build().sql,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByUsername({ username }: { username: string }) {
        try {
            const builder = new QueryBuilder(this.tableName)
            builder
                .select([
                    'employee.id as employee_id',
                    'name',
                    'username',
                    'role.role as role',
                    'created_at',
                    'role_id',
                ])
                .join('role', 'role.id = employee.role_id')
                .where('employee.username', username)
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
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
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'employee.id as employee_id',
                'name',
                'username',
                'password',
                'role.role as role',
                'created_at',
                'role_id',
            ])
            .join('role', 'role.id = employee.role_id')
            .where('employee.username', username)
        try {
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
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
