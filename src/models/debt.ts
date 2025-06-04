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
        date,
        status,
    }: {
        amount: number
        clientId: string
        createdAt: string
        description: string | null
        createdBy: string
        date: string
        status: boolean
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, amount, client_id, created_at, description, created_by, date, status) VALUES (?,?,?,?,?,?,?,?)`,
                args: [
                    id,
                    amount,
                    clientId,
                    createdAt,
                    description,
                    createdBy,
                    date,
                    status,
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

    static async findById({ id }: { id: string }) {
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

    static async getAllDebtWithAllInfo() {
        try {
            const result = await db.execute({
                sql: `
                    SELECT
                        d.id AS debt_id,
                        d.amount,
                        d.description AS debt_description,
                        d.created_at AS debt_created_at,
                        d.date AS debt_date,
                        d.status AS debt_status,
                        c.id AS client_id,
                        c.name AS client_name,
                        c.username AS client_username,
                        e.id AS employee_id,
                        e.name AS employee_name,
                        e.username AS employee_username,
                        e.department AS employee_department
                    FROM
                        ${this.tableName} AS d
                    JOIN
                        clients AS c ON d.client_id = c.id
                    JOIN
                        employee AS e ON d.created_by = e.id
                    ORDER BY
                        d.date DESC;
                `,
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async updateStatus({ id, status }: { id: string; status: boolean }) {
        try {
            const result = await db.execute({
                sql: `UPDATE ${this.tableName} SET status = ? WHERE id = ?`,
                args: [status, id],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }
}
