import { randomUUID } from 'node:crypto'
import { db } from '../db/db'
import { QueryBuilder } from './queryBuilder'

export class OrgFileModel {
    static tableName = 'org_file'

    static async add({
        organizationId,
        fileFormId,
    }: {
        organizationId: string
        fileFormId: string
    }) {
        const id = randomUUID()

        try {
            const result = await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, organization_id, file_form_id) VALUES (?,?,?)`,
                args: [id, organizationId, fileFormId],
            })

            return [undefined, 'Success']
        } catch (err) {
            return [err]
        }
    }

    static async getAll() {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'org_file.id as org_file_id',
                'organizations.name as org_name',
                'file_form.name as file_form_name',
                '*',
            ])
            .join(
                'organizations',
                'org_file.organization_id = organizations.id'
            )
            .join('file_form', 'org_file.file_form_id = file_form.id')

        try {
            const result = await db.execute({
                sql: builder.build().sql,
                args: builder.build().args,
            })

            return [undefined, result.rows]
        } catch (err) {
            return [err]
        }
    }
}
