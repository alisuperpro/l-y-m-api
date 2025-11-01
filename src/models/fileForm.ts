import { db } from '../db/db'
import { randomUUID } from 'node:crypto'
import { QueryBuilder } from './queryBuilder'

export class FileFormModel {
    static tableName = 'file_form'

    static async add({ name, slug }: { name: string; slug: string }) {
        try {
            const id = randomUUID()
            const result = await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, slug) VALUES (?,?,?)`,
                args: [id, name, slug],
            })

            return [undefined, 'added']
        } catch (err) {
            return [err]
        }
    }

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

    static async getById({ id }: { id: string }) {
        try {
            const builder = new QueryBuilder(this.tableName)

            builder.select('*').where('id', id)

            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

            return [undefined, result.rows[0]]
        } catch (err) {
            return [err]
        }
    }
}
