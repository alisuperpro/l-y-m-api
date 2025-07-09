import { randomUUID } from 'node:crypto'
import { db } from '../db/db'

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
                        d.date AS due_date,
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
                        d.date AS due_date,
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

    static async getAllDebtWithAllInfo({ clientId }: { clientId: string }) {
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
                    DESC
                    ;
                `,
                args: [clientId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAll({ order }: { order: 'ASC' | 'DESC' }) {
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
                    ORDER BY d.created_at
                    ${order}
                    ;
                `,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async getAllDebtsByStatusName({
        status,
        order,
    }: {
        status: string
        order: 'ASC' | 'DESC'
    }) {
        try {
            const result = await db.execute({
                sql: `
                    SELECT
                        d.*
                    FROM
                        debt AS d
                    JOIN
                        states AS s
                    ON
                        d.status = s.id
                    WHERE
                        s.state = ?
                        ORDER BY d.created_at
                    ${order}
                    ;
                `,
                args: [status],
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
}
