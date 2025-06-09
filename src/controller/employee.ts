import { type Request, type Response } from 'express'
import dotenv from 'dotenv'
import { EmployeeModel } from '../models/employee'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
dotenv.config()

export class EmployeeController {
    static async add(req: Request, res: Response) {
        const { name, username, password, role, permission_id, department } =
            req.body

        const created_at = new Date().toISOString()

        const [errorUser, findUser] = await EmployeeModel.findByUsername({
            username,
        })

        if (errorUser) {
            res.status(500).json({
                error: 'Error al buscar el usuario',
            })
            return
        }

        if (findUser.length > 0) {
            res.status(403).json({
                error: 'Ye existe el usuario',
            })
            return
        }

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

        if (result.length === 0) {
            res.status(404).json({
                error: 'No encontrado',
            })
            return
        }

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

    static async findByUsername(req: Request, res: Response) {
        const { user } = req.query

        if (user === undefined) {
            res.status(403).json({
                error: 'Falta el usuario',
            })
            return
        }
        const [error, result] = await EmployeeModel.findByUsername({
            //@ts-ignore
            username: user,
        })

        if (result.length === 0) {
            res.status(404).json({
                error: 'Usuario no encontrado',
            })
            return
        }

        if (error) {
            res.status(500).json({
                error: 'Error al buscar el usuario',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async login(req: Request, res: Response) {
        const { username, password } = req.body

        const [error, result] = await EmployeeModel.findByUsername({ username })

        if (error) {
            res.status(500).json({
                error: 'error al buscar el usuario',
            })
            return
        }

        if (result.length === 0) {
            res.status(403).json({
                error: 'Usuario y/o contraseña invalido',
            })
            return
        }

        const comparedPassword = await compare(password, result[0].password)

        if (comparedPassword) {
            const token = jwt.sign(
                { user: result[0] },
                process.env.JWT_KEY ?? '',
                {
                    expiresIn: '1d',
                }
            )

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            }).json({
                data: result,
            })
        } else {
            res.status(403).json({
                error: 'Usuario y/o contraseña invalido',
            })
        }
    }

    static async logout(req: Request, res: Response) {
        res.clearCookie('access_token').json({
            message: 'logout',
        })
    }

    static async delete(req: Request, res: Response) {
        const { id } = req.body

        if (!id) {
            res.status(403).json({
                error: 'Falta el id',
            })
            return
        }

        const [error, result] = await EmployeeModel.delete({ id })

        if (error) {
            res.status(500).json({
                error: 'Error al borrar el empleado',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
