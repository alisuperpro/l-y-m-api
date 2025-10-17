import { db } from '../db/db'

export class PaymentMethodModel {
    static tableName = 'payment_method'

    static async getAll() {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName}`,
            })

            return [undefined, result.rows]
        } catch (err) {
            return [err]
        }
    }
}
