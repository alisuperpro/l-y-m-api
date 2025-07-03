import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class PayModel {
    static tableName = 'pay'

    static async add({
        referenceCode,
        payDate,
        createdAt,
        clientId,
        photoUrl,
        description,
        amount,
        debtId,
        status,
    }: {
        referenceCode: string
        payDate: string
        createdAt: string
        clientId: string
        photoUrl: string
        description: string
        amount: number
        debtId: string
        status: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName}
                (id, reference_code, pay_date, created_at, client_id, photo_url, description, amount, debt_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id,
                    referenceCode,
                    payDate,
                    createdAt,
                    clientId,
                    photoUrl,
                    description,
                    amount,
                    debtId,
                    status,
                ],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getById({ id }: { id: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async getByStatus({ status }: { status: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT
                        p.id,
                        p.reference_code,
                        p.pay_date,
                        p.created_at,
                        p.client_id,
                        p.photo_url,
                        p.description,
                        p.debt_id,
                        p.amount,
                        s.state AS status_name
                            FROM pay AS p
                            JOIN states AS s
                            ON p.status = s.state
                            WHERE
                        s.state = ?`,
                args: [status],
            })

            return [undefined, result.rows]
        } catch (error) {
            return [error]
        }
    }

    static async getAll() {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
            })

            return [undefined, result.rows]
        } catch (error) {
            return [error]
        }
    }

    static async getByClientId({ clientId }: { clientId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE client_id = ?`,
                args: [clientId],
            })

            return [undefined, result.rows]
        } catch (error) {
            return [error]
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
        } catch (error) {
            return [error]
        }
    }
}
