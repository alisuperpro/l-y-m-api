import { db } from '../db/db'

export class CanApproveOtherDebtsModel {
    static tableName = 'can_approve_other_debts'

    static async add({
        creatorId,
        approverId,
    }: {
        creatorId: string
        approverId: string
    }) {
        try {
            await db.execute({
                sql: `INSERT INTO ${this.tableName} (creator_id, approver_id) VALUES (?,?)`,
                args: [creatorId, approverId],
            })

            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE creator_id = ? AND approver_id = ?`,
                args: [creatorId, approverId],
            })

            return [undefined, result.rows[0]]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByCreatorId({ creatorId }: { creatorId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE creator_id = ?`,
                args: [creatorId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async findByApproverId({ approverId }: { approverId: string }) {
        try {
            const result = await db.execute({
                sql: `SELECT * FROM ${this.tableName} WHERE approver_id = ?`,
                args: [approverId],
            })

            return [undefined, result.rows]
        } catch (err: any) {
            return [err]
        }
    }

    static async delete({
        creatorId,
        approverId,
    }: {
        creatorId: string
        approverId: string
    }) {
        try {
            await db.execute({
                sql: `DELETE FROM ${this.tableName} WHERE creator_id = ? AND approver_id = ?`,
                args: [creatorId, approverId],
            })

            return [undefined, { message: 'Registro eliminado correctamente' }]
        } catch (err: any) {
            return [err]
        }
    }
}
