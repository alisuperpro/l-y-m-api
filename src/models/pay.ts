import { db } from '../db/db'
import { randomUUID } from 'node:crypto'
import { QueryBuilder } from './queryBuilder'

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
        paymentMethod,
        currencyId,
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
        paymentMethod: string
        currencyId: string
    }) {
        const id = randomUUID()

        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName}
                (id, reference_code, pay_date, created_at, client_id, photo_url, description, amount, debt_id, status, payment_method, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id,
                    referenceCode,
                    payDate,
                    createdAt,
                    clientId,
                    photoUrl ? photoUrl : null,
                    description,
                    amount,
                    debtId,
                    status,
                    paymentMethod,
                    currencyId,
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
            const builder = new QueryBuilder(this.tableName)

            builder
                .select([
                    'pay.id',
                    'pay.reference_code',
                    'pay.pay_date',
                    'pay.created_at',
                    'pay.photo_url',
                    'pay.description',
                    'pay.debt_id',
                    'pay.amount',
                    'payment_method',
                    'payment_method.name as payment_name',
                    'states.state',
                    'states.slug',
                    'clients.name',
                    'clients.avatar',
                    'currency.long_name',
                    'currency.short_name',
                    'currency.id as currency_id',
                ])
                .join('clients', 'pay.client_id = clients.id', 'INNER')
                .join('states', 'pay.status = states.id', 'INNER')
                .join(
                    'payment_method',
                    'pay.payment_method = payment_method.id',
                    'INNER'
                )
                .join('currency', 'pay.currency = currency.id')
                .where('pay.id', id)
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
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
                        currency.long_name
                        currency.short_name
                        s.state AS status_name
                            FROM pay AS p
                            JOIN states AS s
                            ON p.status = s.state
                            JOIN currency
                            ON p.currency = currency.id
                            WHERE
                        s.state = ?`,
                args: [status],
            })

            return [undefined, result.rows]
        } catch (error) {
            return [error]
        }
    }

    static async getAll({
        orderBy = 'DESC',
        limit,
        state,
    }: {
        orderBy: 'DESC' | 'ASC'
        limit: number | null
        state?: string
    }) {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'pay.id',
                'pay.reference_code',
                'pay.pay_date',
                'pay.created_at',
                'pay.photo_url',
                'pay.description',
                'pay.debt_id',
                'pay.amount',
                'payment_method',
                'payment_method.name as payment_name',
                'states.state',
                'states.slug',
                'clients.name',
                'clients.avatar',
                'currency.long_name',
                'currency.short_name',
                'currency.id as currency_id',
            ])
            .join('clients', 'pay.client_id = clients.id', 'INNER')
            .join('states', 'pay.status = states.id', 'INNER')
            .join(
                'payment_method',
                'pay.payment_method = payment_method.id',
                'INNER'
            )
            .join('currency', 'pay.currency = currency.id')

            .orderBy('pay.created_at', orderBy)
        if (limit) {
            builder.limit(limit)
        }

        if (state) {
            builder.where('states.id', state)
        }
        try {
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

            return [undefined, result.rows]
        } catch (error) {
            return [error]
        }
    }

    static async getByClientId({
        clientId,
        orderBy = 'DESC',
        state,
        limit,
    }: {
        clientId: string
        orderBy: 'ASC' | 'DESC'
        state?: string
        limit?: number
    }) {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'pay.id',
                'pay.reference_code',
                'pay.pay_date',
                'pay.created_at',
                'pay.photo_url',
                'pay.description',
                'pay.debt_id',
                'pay.amount',
                'payment_method.name as payment_name',
                'states.state',
                'states.slug',
                'clients.name',
                'clients.avatar',
                'currency.long_name',
                'currency.short_name',
                'currency.id as currency_id',
            ])
            .join('clients', 'pay.client_id = clients.id', 'INNER')
            .join('states', 'pay.status = states.id', 'INNER')
            .join(
                'payment_method',
                'pay.payment_method = payment_method.id',
                'INNER'
            )
            .join('currency', 'pay.currency = currency.id')
            .orderBy('pay.created_at', orderBy)
            .where('pay.client_id', clientId)
        if (limit) {
            builder.limit(limit)
        }

        if (state) {
            builder.where('states.id', state)
        }
        try {
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
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

            const builder = new QueryBuilder(this.tableName)

            builder
                .select([
                    'pay.id',
                    'pay.reference_code',
                    'pay.pay_date',
                    'pay.created_at',
                    'pay.photo_url',
                    'pay.description',
                    'pay.debt_id',
                    'pay.amount',
                    'payment_method.name as payment_name',
                    'states.state',
                    'states.slug',
                    'clients.name',
                    'clients.avatar',
                    'clients.email',
                    'clients.id as client_id',
                    'currency.long_name',
                    'currency.short_name',
                    'currency.id as currency_id',
                ])
                .join('clients', 'pay.client_id = clients.id', 'INNER')
                .join('states', 'pay.status = states.id', 'INNER')
                .join(
                    'payment_method',
                    'pay.payment_method = payment_method.id',
                    'INNER'
                )
                .join('currency', 'pay.currency = currency.id')
                .where('pay.id', id)

            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }

    static async updateAmount({ id, amount }: { id: string; amount: string }) {
        try {
            await db.execute({
                sql: `UPDATE ${this.tableName} SET amount = ? WHERE id = ?`,
                args: [amount, id],
            })

            const builder = new QueryBuilder(this.tableName)

            builder
                .select([
                    'pay.id',
                    'pay.reference_code',
                    'pay.pay_date',
                    'pay.created_at',
                    'pay.photo_url',
                    'pay.description',
                    'pay.debt_id',
                    'pay.amount',
                    'payment_method.name as payment_name',
                    'states.state',
                    'states.slug',
                    'clients.name',
                    'clients.avatar',
                    'clients.email',
                    'clients.id as client_id',
                    'currency.long_name',
                    'currency.short_name',
                    'currency.id as currency_id',
                ])
                .join('clients', 'pay.client_id = clients.id', 'INNER')
                .join('states', 'pay.status = states.id', 'INNER')
                .join(
                    'payment_method',
                    'pay.payment_method = payment_method.id',
                    'INNER'
                )
                .join('currency', 'pay.currency = currency.id')
                .where('pay.id', id)

            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

            return [undefined, result.rows[0]]
        } catch (error) {
            return [error]
        }
    }
}
