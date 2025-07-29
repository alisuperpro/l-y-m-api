import { randomUUID } from 'node:crypto'
import { db } from '../db/db'
import { QueryBuilder } from './queryBuilder'

type Order = 'ASC' | 'DESC'

interface DebtFilters {
    statusId?: string // Changed from 'status' to 'statusName' for clarity with 'states' table
    minAmount?: number
    maxAmount?: number
    startDate?: string // Assuming date string format, e.g., 'YYYY-MM-DD'
    endDate?: string
    clientId?: string
    order?: Order
    orderBy?: string // Column to order by, e.g., 'created_at', 'amount'
    limit?: number
    offset?: number
}

export class DebtModel {
    static tableName = 'debt'

    static async add({
        amount,
        clientId,
        createdAt,
        description,
        createdBy,
        status,
    }: {
        amount: number
        clientId: string
        createdAt: string
        description: string | null
        createdBy: string
        status: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, amount, client_id, created_at, description, created_by, status) VALUES (?,?,?,?,?,?,?)`,
                args: [
                    id,
                    amount,
                    clientId,
                    createdAt,
                    description,
                    createdBy,
                    status,
                ],
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
                sql: `SELECT
                        d.id AS debt_id,
                        d.amount,
                        d.description AS debt_description,
                        d.created_at AS debt_created_at,
                        c.name AS client_name,
                        e.name AS created_by_employee_name,
                        s.state AS debt_status
                    FROM
                        "debt" d
                    JOIN
                        "clients" c ON d.client_id = c.id
                    JOIN
                        "employee" e ON d.created_by = e.id
                    JOIN
                        "states" s ON d.status = s.id
                    WHERE d.id = ? 
                    ORDER BY d.created_at
                    DESC
                    ;`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByStatus({ status }: { status: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT
                        d.id AS debt_id,
                        d.amount,
                        d.description AS debt_description,
                        d.created_at AS debt_created_at,
                        c.name AS client_name,
                        e.name AS created_by_employee_name,
                        s.state AS debt_status
                    FROM
                        "debt" d
                    JOIN
                        "clients" c ON d.client_id = c.id
                    JOIN
                        "employee" e ON d.created_by = e.id
                    JOIN
                        "states" s ON d.status = s.id
                    WHERE s.state = ? 
                    ORDER BY d.created_at
                    DESC
                    ;`,
                args: [status],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAllDebtWithAllInfo({
        clientId,
        state,
        order,
    }: {
        clientId: string
        state?: string
        order?: 'ASC' | 'DESC'
    }) {
        const builder = new QueryBuilder(`${this.tableName} d`)

        builder
            .select([
                'd.id AS debt_id',
                'd.amount',
                'd.description AS debt_description',
                'd.created_at AS debt_created_at',
                'c.name AS client_name',
                'c.avatar AS client_avatar',
                'e.name AS created_by_employee_name',
                's.state AS debt_status',
            ])
            .join('clients c', 'd.client_id = c.id')
            .join('employee e', 'd.created_by = e.id')
            .join('states s', 'd.status = s.id')
            .where('d.client_id', clientId)
        if (state) {
            builder.where('s.id', state)
        }
        builder.orderBy('d.created_at', order)
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

    static async getAll({
        order,
        state,
    }: {
        order: 'ASC' | 'DESC'
        state: string | null
    }) {
        const builder = new QueryBuilder(`${this.tableName} d`)

        builder
            .select([
                'd.id AS debt_id',
                'd.amount',
                'd.description AS debt_description',
                'd.created_at AS debt_created_at',
                'c.name AS client_name',
                'c.avatar AS client_avatar',
                'e.name AS created_by_employee_name',
                's.state AS debt_status',
            ])
            .join('clients c', 'd.client_id = c.id')
            .join('employee e', 'd.created_by = e.id')
            .join('states s', 'd.status = s.id')
        if (state) {
            builder.where('s.id', state)
        }
        builder.orderBy('d.created_at', order)

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

    static async getDebtsByClientId({
        clientId,
        order,
    }: {
        clientId: string
        order: 'ASC' | 'DESC'
    }) {
        try {
            const result = await db.execute({
                sql: `
                    SELECT
                        d.id AS debt_id,
                        d.amount,
                        d.description AS debt_description,
                        d.created_at AS debt_created_at,
                        c.name AS client_name,
                        e.name AS created_by_employee_name,
                        s.state AS debt_status
                    FROM
                        "debt" d
                    JOIN
                        "clients" c ON d.client_id = c.id
                    JOIN
                        "employee" e ON d.created_by = e.id
                    JOIN
                        "states" s ON d.status = s.id
                        WHERE d.client_id = ?
                    ORDER BY d.created_at
                    ${order}
                    ;
                `,
                args: [clientId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getDebtsByClientToVerifyExpireDebt({
        clientId,
        date,
        status,
        order,
    }: {
        clientId: string
        date: string
        status: string
        order: 'ASC' | 'DESC'
    }) {
        try {
            const result = await db.execute({
                sql: `
                    SELECT
                        d.id AS debt_id,
                        d.created_at AS debt_created_at,
                        c.name AS client_name,
                        e.name AS created_by_employee_name,
                        s.state AS debt_status
                    FROM
                        "debt" d
                    JOIN
                        "clients" c ON d.client_id = c.id
                    JOIN
                        "employee" e ON d.created_by = e.id
                    JOIN
                        "states" s ON d.status = s.id
                        WHERE d.client_id = ? AND  d.status = ? AND d.created_at < ?
                    ORDER BY d.created_at
                    ${order}
                    ;
                `,
                args: [clientId, status, date],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAllDebtsByStatusId(filters: DebtFilters = {}) {
        try {
            let sqlQuery = `
            SELECT
                d.*
            FROM
                debt AS d
            JOIN
                states AS s
            ON
                d.status = s.id
            WHERE 1=1 -- This is a common trick to easily append conditions
        `

            const args: (string | number)[] = []

            // Apply filters dynamically
            if (filters.statusId) {
                sqlQuery += ` AND s.id = ?`
                args.push(filters.statusId)
            }
            if (filters.minAmount !== undefined) {
                sqlQuery += ` AND d.amount >= ?`
                args.push(filters.minAmount)
            }
            if (filters.maxAmount !== undefined) {
                sqlQuery += ` AND d.amount <= ?`
                args.push(filters.maxAmount)
            }
            if (filters.startDate) {
                sqlQuery += ` AND d.created_at >= ?`
                args.push(filters.startDate)
            }
            if (filters.endDate) {
                sqlQuery += ` AND d.created_at <= ?`
                args.push(filters.endDate)
            }
            if (filters.clientId) {
                sqlQuery += ` AND d.client_id = ?`
                args.push(filters.clientId)
            }

            // Apply ordering
            const orderByColumn = filters.orderBy || 'd.created_at' // Default order by
            const orderDirection = filters.order || 'DESC' // Default to DESC
            sqlQuery += ` ORDER BY ${orderByColumn} ${orderDirection}`

            // Apply pagination
            if (filters.limit !== undefined) {
                sqlQuery += ` LIMIT ?`
                args.push(filters.limit)
            }
            if (filters.offset !== undefined) {
                sqlQuery += ` OFFSET ?`
                args.push(filters.offset)
            }

            sqlQuery += `;` // Close the query

            const result = await db.execute({
                sql: sqlQuery,
                args: args,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAllDebtWithAllInfoByCreatedBy({
        createdBy,
    }: {
        createdBy: string
    }) {
        try {
            const result = await db.execute({
                sql: `
                    SELECT
                        d.id AS debt_id,
                        d.amount,
                        d.description AS debt_description,
                        d.created_at AS debt_created_at,
                        c.name AS client_name,
                        e.name AS created_by_employee_name,
                        s.state AS debt_status
                    FROM
                        "debt" d
                    JOIN
                        "clients" c ON d.client_id = c.id
                    JOIN
                        "employee" e ON d.created_by = e.id
                    JOIN
                        "states" s ON d.status = s.id
                    WHERE d.created_by = ? 
                    ORDER BY d.created_at
                    DESC
                    ;
                `,
                args: [createdBy],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async updateStatus({ id, status }: { id: string; status: string }) {
        try {
            await db.execute({
                sql: `UPDATE ${this.tableName} SET status = ? WHERE id = ?`,
                args: [status, id],
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

    static async updateAmount({ id, amount }: { id: string; amount: string }) {
        try {
            await db.execute({
                sql: `UPDATE ${this.tableName} SET amount = ? WHERE id = ?`,
                args: [amount, id],
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
}
