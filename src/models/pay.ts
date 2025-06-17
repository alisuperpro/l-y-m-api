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
        paidToDepartment,
        debtId,
    }: {
        referenceCode: string
        payDate: string
        createdAt: string
        clientId: string
        photoUrl: string
        description: string
        amount: number
        paidToDepartment: string
        debtId: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName}
                (id, reference_code, pay_date, created_at, client_id, photo_url, description, amount, paid_to_department, debt_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id,
                    referenceCode,
                    payDate,
                    createdAt,
                    clientId,
                    photoUrl,
                    description,
                    amount,
                    paidToDepartment,
                    debtId,
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
}
