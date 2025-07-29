import { randomUUID } from 'node:crypto'
import { db } from '../db/db'
import { QueryBuilder } from './queryBuilder'

export class ClientModel {
    static tableName = 'clients'

    static async add({
        name,
        username,
        password,
        created_at,
        email,
        createdBy,
        avatar,
        accountState,
    }: {
        name: string
        username: string
        password: string
        created_at: string
        email: string
        createdBy: string
        avatar: string
        accountState: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, username, password, email, created_at, created_by, avatar, account_state)
                VALUES (?,?,?,?,?,?,?,?,?)`,
                args: [
                    id,
                    name,
                    username,
                    password,
                    email,
                    created_at,
                    createdBy,
                    avatar,
                    accountState,
                ],
            })

            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by, avatar, account_state FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            console.log({ err })
            return [err]
        }
    }

    static async findClientById({ id }: { id: string }) {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'clients.id',
                'name',
                'username',
                'email',
                'created_at',
                'created_by',
                'avatar',
                'states.state AS account_state',
            ])
            .join('states', 'states.id = clients.account_state')
            .where('clients.id', id)

        const batch = [
            {
                sql: builder.build().sql,
                args: builder.build().args,
            },
            {
                sql: 'SELECT * FROM client_company WHERE client_id = ?',
                args: [id],
            },
        ]
        try {
            const result = await db.batch(batch, 'read')

            const clientData = {
                client: result[0].rows[0],
                companys: result[1].rows,
            }
            return [undefined, clientData]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAllClientsByCreatedBy({
        createdBy,
    }: {
        createdBy: string
    }) {
        try {
            const result = await db.execute({
                sql: `SELECT id, name, username, email, created_at, created_by FROM ${this.tableName} WHERE created_by = ?`,
                args: [createdBy],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute(
                `SELECT id, name, username, email, created_at, created_by, avatar, account_state FROM ${this.tableName}`
            )

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAllClientsWithInfo({
        filterBy,
        filterValue,
        sort = 'DESC',
    }: {
        filterBy?: string | null
        filterValue?: string | null
        sort?: 'ASC' | 'DESC' | undefined
    }) {
        const builder = new QueryBuilder('clients')

        builder
            .select([
                'clients.id',
                'name',
                'username',
                'email',
                'created_at',
                'created_by',
                'avatar',
                'states.state',
            ])
            .join('states', 'clients.account_state = states.id', 'LEFT')
            .orderBy('clients.created_at', sort)
        if (filterBy && filterValue) {
            builder.where(filterBy, filterValue)
        }

        try {
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

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
