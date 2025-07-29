import { type Request, type Response } from 'express'
import dotenv from 'dotenv'
import { EmployeeModel } from '../models/employee'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { EmployeeSchema } from '../schemas/employee.schema'
import { verifyExpireClientDebts } from '../middleware/verifyExpireClientDebt'
import { appEventEmitter } from '../events/eventEmitter'
dotenv.config()

export class EmployeeController {
    static async add(req: Request, res: Response) {
        const { name, username, password, roleId, permissionList } = req.body
        const { error } = EmployeeSchema.safeParse(req.body)

        if (error) {
            res.status(400).json({
                error: 'Datos inválidos',
            })
            return
        }

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
        if (findUser !== undefined) {
            res.status(403).json({
                error: 'Ya existe el usuario',
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
                roleId,
                created_at,
            })

            if (error) {
                console.log(error)
                res.status(500).json({
                    error: 'Error al guardar la informacion',
                })
                return
            }

            if (!result) {
                res.status(500).json({
                    error: 'Error al crear el usuario',
                })
                return
            }

            appEventEmitter.emit('employeeCreated', {
                permissionList,
                employeeId: result.id,
            })

            res.json({
                data: result,
            })
            return hash
        })
    }

    static async findEmployeeById(req: Request, res: Response) {
        const { id } = req.params

        if (!id) {
            res.status(400).json({
                error: 'Falta el id',
            })
            return
        }

        const [error, result] = await EmployeeModel.findEmployeeById({ id })

        if (!result) {
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

        if (result.length === 0) {
            res.status(404).json({
                error: 'No se encontraron empleados',
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

        if (!result) {
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

        if (!username || !password) {
            res.status(403).json({
                error: 'Usuario y/o contraseña invalido',
            })
            return
        }

        const [error, result] = await EmployeeModel.findByUsernameWithPassword({
            username,
        })
        if (error) {
            res.status(500).json({
                error: 'error al buscar el usuario',
            })
            return
        }

        if (!result) {
            res.status(403).json({
                error: 'Usuario y/o contraseña invalido',
            })
            return
        }

        const comparedPassword = await compare(password, result.password)

        if (comparedPassword) {
            const data = {
                ...result,
                id: result.employee_id,
                password: '',
            }
            const token = jwt.sign({ user: data }, process.env.JWT_KEY ?? '', {
                expiresIn: '1d',
            })

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            }).json({
                data,
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

    static async getUserByToken(req: Request, res: Response) {
        //@ts-ignore
        const { user } = req.session

        if (!user) {
            res.status(404).json({
                error: 'Error al obtener el usuario',
            })
            return
        }

        const data = {
            ...user,
            id: user.employee_id,
            name: user.employee_name,
        }
        res.json({
            data,
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

        const [error2, result2] = await EmployeeModel.findEmployeeById({ id })

        if (error2) {
            res.status(500).json({
                error: 'Error al buscar el empleado',
            })
            return
        }

        if (!result2) {
            res.status(404).json({
                error: 'Empleado no encontrado',
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

    static async isClientDebtExpired(req: Request, res: Response) {
        const { clientId, state } = req.params
        const debtExpired = await verifyExpireClientDebts({ clientId, state })

        if (typeof debtExpired === 'string') {
            res.status(500).json({
                error: debtExpired,
            })
            return
        }

        res.json({
            data: debtExpired ?? 'No hay deudas',
        })
    }
}
