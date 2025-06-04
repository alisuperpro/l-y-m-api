import { type Request, type Response } from 'express'
import dotenv from 'dotenv'
import { EmployeeModel } from '../models/employee'
import { hash } from 'bcrypt'
dotenv.config()

export class EmployeeController {
    static async add(req: Request, res: Response) {
        const { name, username, password, role, permission_id, department } =
            req.body

        const created_at = new Date().toISOString()

        const saltRounds = 10 // SaltRound to encrypt password
        // const salt = await genSalt(saltRounds); // Generate Salt
        hash(password, saltRounds, async (err, hash) => {
            if (err) {
                res.status(500).json({
                    error: 'Error al encriptar la password',
                })
            }
            const [error, result] = await EmployeeModel.add({
                name,
                username,
                password: hash,
                role,
                permission_id,
                department,
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

    static async findEmployeeById(req: Request, res: Response) {
        const { id } = req.params

        const [error, result] = await EmployeeModel.findEmployeeById({ id })

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
        const [error, result] = await EmployeeModel.getAll()

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
