import { Request, Response } from 'express'
import { ClientCompanyModel } from '../models/clientCompany'
import { idSchema, nameSchema } from '../schemas/global.schema'

export class ClientCompanyController {
    static async add(req: Request, res: Response) {
        const { name, clientId } = req.body

        const { error } = idSchema.safeParse(clientId)
        const { error: nameError } = nameSchema.safeParse(name)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        if (nameError) {
            res.status(400).json({
                error: nameError.issues,
            })
            return
        }

        const createdAt = new Date().toISOString()

        const [err, result] = await ClientCompanyModel.add({
            name,
            createdAt,
            clientId,
        })

        if (err) {
            console.log({ err })
            res.status(500).json({ error: 'Error adding client company' })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {

        const [err, result] = await ClientCompanyModel.getAll()

        if (err) {
            res.status(500).json({ error: 'Error fetching client companies' })
            return
        }

        res.json({
            data: result,
        })

    }

    static async findByClientId(req: any, res: any) {
        const { clientId } = req.params

        const { error } = idSchema.safeParse(clientId)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] = await ClientCompanyModel.findByClientId({
            clientId,
        })

        if (err) {
            res.status(500).json({ error: 'Error finding client companies' })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findById(req: any, res: any) {
        const { id } = req.params

        const { error } = idSchema.safeParse(id)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] = await ClientCompanyModel.findById({ id })

        if (err) {
            res.status(500).json({ error: 'Error finding client company' })
            return
        }

        res.json({
            data: result,
        })
    }

    static async addOnList(req: Request, res: Response) {
        const { companyList, clientId } = req.body
        const { error } = idSchema.safeParse(clientId)
        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const created_at = new Date().toISOString()

        const newList = companyList.map((element: any) => {
            return {
                ...element,
                created_at,
            }
        })

        const [err, result] = await ClientCompanyModel.addOnList({
            companyList: newList,
            clientId,
        })

        if (err) {
            res.status(500).json({
                error: 'Error adding client companies on list',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
