import { db } from '../db/db'
import { randomUUID } from 'node:crypto'
import { QueryBuilder } from './queryBuilder'

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
        fileFormId,
    }: {
        name: string
        ext: string
        url: string
        createdBy: string
        clientId: string
        createdAt: string
        description?: string
        clientCompanyId: string
        organizationId: string
        fileFormId: string
    }) {
        try {
            const id = randomUUID()
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (id, name, ext, url, created_by, client_id, created_at, description, client_company_id, organization_id, file_form_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
                args: [
                    id,
                    name,
                    ext,
                    url,
                    createdBy,
                    clientId,
                    createdAt,
                    description ? description : '',
                    clientCompanyId,
                    organizationId,
                    fileFormId,
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

    static async getAll() {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'client_documents.id as document_id',
                'ext',
                'url',
                'client_documents.name as document_name',
                'client_company.name as company_name',
                'organizations.name as organization_name',
                'clients.name as client_name',
                'clients.id as client_id',
                'clients.username as client_username',
                'employee.name as employee_name',
                'employee.id as employee_id',
                'file_form_id',
            ])
            .join(
                'client_company',
                'client_documents.client_company_id = client_company.id'
            )
            .join(
                'organizations',
                'organizations.id = client_documents.organization_id'
            )
            .join('clients', 'clients.id = client_documents.client_id')
            .join('employee', 'employee.id = client_documents.created_by')

        try {
            const result = await db.execute({
                sql: builder.build().sql,
            })

            return [undefined, result.rows]
        } catch (err) {
            return [err]
        }
    }

    static async findByClientId({
        clientId,
        order,
        orgId,
        companyId,
    }: {
        clientId: string
        order?: 'ASC' | 'DESC'
        orgId?: string
        companyId?: string
    }) {
        const builder = new QueryBuilder(this.tableName)

        builder
            .select([
                'client_documents.id as document_id',
                'ext',
                'url',
                'client_documents.name as document_name',
                'client_company.name as company_name',
                'organizations.name as organization_name',
                'clients.name as client_name',
                'clients.id as client_id',
                'clients.username as client_username',
                'employee.name as employee_name',
                'employee.id as employee_id',
                'file_form_id',
            ])
            .join(
                'client_company',
                'client_documents.client_company_id = client_company.id'
            )
            .join(
                'organizations',
                'organizations.id = client_documents.organization_id'
            )
            .join('clients', 'clients.id = client_documents.client_id')
            .join('employee', 'employee.id = client_documents.created_by')
            .where('clients.id', clientId)

        if (order) {
            builder.orderBy('client_documents.created_at', order)
        }

        if (orgId) {
            builder.where('client_documents.organization_id', orgId)
        }

        if (companyId) {
            builder.where('client_documents.client_company_id', companyId)
        }

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

    static async getDocumentByDocumentAndClientId({
        documentId,
        clientId,
    }: {
        documentId: string
        clientId: string
    }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE id = ? AND client_id = ?`,
                args: [documentId, clientId],
            })

            return [undefined, result.rows[0]]
        } catch (err) {
            return [err]
        }
    }

    static async getByOrgAndSlug({
        org,
        slug,
        clientId,
    }: {
        org: string
        slug: string
        clientId?: string
    }) {
        try {
            const builder = new QueryBuilder(this.tableName)

            builder
                .select([
                    'ext',
                    'url',
                    'client_documents.name as document_name',
                    'client_company.name as company_name',
                    'organizations.name as organization_name',
                    'clients.name as client_name',
                    'clients.id as client_id',
                    'clients.username as client_username',
                    'employee.name as employee_name',
                    'employee.id as employee_id',
                    'file_form.name as file_form_name',
                    'client_documents.id as document_id',
                    'client_documents.created_at as doc_created_at',
                ])
                .join(
                    'file_form',
                    'client_documents.file_form_id = file_form.id',
                    'INNER'
                )
                .join(
                    'organizations',
                    'client_documents.organization_id = organizations.id',
                    'INNER'
                )
                .join(
                    'client_company',
                    'client_documents.client_company_id = client_company.id'
                )
                .join('clients', 'clients.id = client_documents.client_id')
                .join('employee', 'employee.id = client_documents.created_by')
                .where('file_form.slug', slug)
                .where('organizations.name', org)

            if (clientId) {
                builder.where('client_documents.client_id', clientId)
            }

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
