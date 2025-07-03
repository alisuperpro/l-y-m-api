import { randomUUID } from 'node:crypto'
import { db } from '../db/db'

export class ClientModel {
    static tableName = 'clients'

    static async add({
        name,
        username,
        password,
        created_at,
        email,
        createdBy,
    }: {
        name: string
        username: string
        password: string
        created_at: string
        email: string
        createdBy: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, username, password, email, created_at, created_by) VALUES (?,?,?,?,?,?,?)`,
                args: [
                    id,
                    name,
                    username,
                    password,
                    email,
                    created_at,
                    createdBy,
                ],
            })

            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            console.log({ err })
            return [err]
        }
    }

    static async findClientById({ id }: { id: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute(
                `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName}`
            )

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByUsername({ username }: { username: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE username = ?`,
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
                sql: `SELECT id, name, username, email, created_at, created_by, password FROM ${this.tableName} WHERE username = ?`,
                args: [username],
            })
            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByEmail({ email }: { email: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE email = ?`,
                args: [email],
            })
            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async updatePassword({
        id,
        newPassword,
    }: {
        id: string
        newPassword: string
    }) {
        try {
            await db.execute({
                sql: `UPDATE ${this.tableName} SET password = ? WHERE id = ?`,
                args: [newPassword, id],
            })
            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })
            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async updateEmail({
        id,
        newEmail,
    }: {
        id: string
        newEmail: string
    }) {
        try {
            await db.execute({
                sql: `UPDATE ${this.tableName} SET email = ? WHERE id = ?`,
                args: [newEmail, id],
            })
            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })
            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }
}
