import { Request, Response } from 'express'
import { ClientModel } from '../models/client'
import { hash } from 'bcrypt'

export class ClientController {
    static async add(req: Request, res: Response) {
        const { name, username, password } = req.body

        const created_at = new Date().toISOString()

        const saltRounds = 10 // SaltRound to encrypt password
        // const salt = await genSalt(saltRounds); // Generate Salt
        hash(password, saltRounds, async (err, hash) => {
            if (err) {
                res.status(500).json({
                    error: 'Error al encriptar la password',
                })
            }
            const [error, result] = await ClientModel.add({
                name,
                username,
                password: hash,
                created_at,
            })

            if (error) {
                res.status(500).json({
                    error: 'Error al guardar la informacion',
                })
                return
            }

            res.json({
                data: result,
            })
            return hash
        })
    }

    static async findClientById(req: Request, res: Response) {
        const { id } = req.params

        const [error, result] = await ClientModel.findClientById({ id })
        if (error) {
            res.status(500).json({
                error: 'Error al guardar la informacion',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAll(req: Request, res: Response) {
        const [error, result] = await ClientModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al guardar la informacion',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
