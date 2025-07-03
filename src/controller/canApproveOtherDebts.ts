import { Request, Response } from 'express'
import { CanApproveOtherDebtsModel } from '../models/canApproveOtherDebts'

export class CanApproveOtherDebtsController {
    static async add(req: Request, res: Response) {
        const { creatorId, approverId } = req.body

        if (!creatorId || !approverId) {
            res.status(400).json({
                error: 'Creator ID and Approver ID are required.',
            })
            return
        }

        const [error, result] = await CanApproveOtherDebtsModel.add({
            creatorId,
            approverId,
        })

        if (error) {
            res.status(500).json({ error: 'Failed to add approver.' })
            return
        }

        res.status(201).json(result)
    }

    static async findByCreatorId(req: Request, res: Response) {
        const { creatorId } = req.params

        const [error, result] = await CanApproveOtherDebtsModel.findByCreatorId(
            { creatorId }
        )

        if (error) {
            res.status(500).json({ error: 'Failed to retrieve approvers.' })
            return
        }

        res.status(200).json(result)
    }

    static async findByApproverId(req: Request, res: Response) {
        const { approverId } = req.params

        const [error, result] =
            await CanApproveOtherDebtsModel.findByApproverId({ approverId })

        if (error) {
            res.status(500).json({ error: 'Failed to retrieve approvers.' })
            return
        }

        res.status(200).json(result)
    }

    static async delete(req: Request, res: Response) {
        const { creatorId, approverId } = req.body

        if (!creatorId || !approverId) {
            res.status(400).json({
                error: 'Creator ID and Approver ID are required.',
            })
            return
        }

        const [error] = await CanApproveOtherDebtsModel.delete({
            creatorId,
            approverId,
        })

        if (error) {
            res.status(500).json({ error: 'Failed to delete approver.' })
            return
        }

        res.status(204).send()
    }
}
