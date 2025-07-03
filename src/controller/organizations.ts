import { Request, Response } from 'express'
import { OrganizationsModel } from '../models/organizations'
import { nameSchema, idSchema } from '../schemas/global.schema'

export class OrganizationsController {
    static async add(req: Request, res: Response) {
        const { name } = req.body

        const { error } = nameSchema.safeParse(name)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const createdAt = new Date().toISOString()

        const [err, result] = await OrganizationsModel.add({ name, createdAt })
        if (err) {
            res.status(500).json({
                error: 'Error al agregar la organización',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findById(req: Request, res: Response) {
        const { id } = req.params

        const { error } = idSchema.safeParse(id)

        if (error) {
            res.status(400).json({
                error: error.issues,
            })
            return
        }

        const [err, result] = await OrganizationsModel.findById({ id })

        if (err) {
            res.status(500).json({
                error: 'Error al obtener la organización',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'Organización no encontrada',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllOrganizations(req: Request, res: Response) {
        const [err, result] = await OrganizationsModel.getAllOrganizations()

        if (err) {
            res.status(500).json({
                error: 'Error al obtener las organizaciones',
            })
            return
        }
        //@ts-ignore
        if (result.length === 0) {
            res.status(404).json({
                error: 'No se encontraron organizaciones',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
