import { db } from '../db/db'
import { randomUUID } from 'node:crypto'

export class ClientDocumentsModel {
    static tableName = 'client_documents'

    static async add({
        name,
        ext,
        url,
        createdBy,
        clientId,
        createdAt,
        description,
        clientCompanyId,
        organizationId,
    }: {
        name: string
        ext: string
        url: string
        createdBy: string
        clientId: string
        createdAt: string
        description: string
        clientCompanyId: string
        organizationId: string
    }) {
        try {
            const id = randomUUID()
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, ext, url, created_by, client_id, created_at, description, client_company_id, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id,
                    name,
                    ext,
                    url,
                    createdBy,
                    clientId,
                    createdAt,
                    description,
                    clientCompanyId,
                    organizationId,
                ],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE client_id = ? AND id = ?`,
                args: [clientId, id],
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
}
