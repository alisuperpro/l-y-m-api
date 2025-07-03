import { randomUUID } from 'node:crypto'
import { db } from '../db/db'

type ClientCompany = {
    name: string
    created_at: string
    client_id: string
}

export class ClientCompanyModel {
    static tableName = 'client_company'

    static async add({
        name,
        createdAt,
        clientId,
    }: {
        name: string
        createdAt: string
        clientId: string
    }) {
        try {
            const id = randomUUID()
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, created_at, client_id) VALUES (?, ?, ?, ?)`,
                args: [id, name, createdAt, clientId],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ?`,
                args: [id],
            })

            return [undefined, result.rows[0]]
        } catch (err) {
            return [err]
        }
    }

    static async findByClientId({ clientId }: { clientId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE client_id = ?`,
                args: [clientId],
            })

            return [undefined, result.rows]
        } catch (err) {
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
        } catch (err) {
            return [err]
        }
    }

    static async addOnList({
        companyList,
        clientId,
    }: {
        companyList: ClientCompany[]
        clientId: string
    }) {
        const inserts = `INSERT INTO ${this.tableName} (id, name, created_at, client_id) VALUES (?, ?, ?, ?)`

        const list = companyList.map((company) => {
            const id = randomUUID()

            return {
                sql: inserts,
                args: [id, company.name, company.created_at, company.client_id],
            }
        })
        try {
            await db.batch(list)

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE client_id = ?`,
                args: [clientId],
            })

            return [undefined, result.rows]
        } catch (err) {
            return [err]
        }
    }
}
