import { Request, Response } from 'express'
import { ClientModel } from '../models/client'
import { compare, hash } from 'bcrypt'
import {
    clientSchema,
    emailSchema,
    idSchema,
    passwordSchema,
} from '../schemas/client.schema'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { generatePassword } from '../utils/generatePassword'
import { sendEmail } from '../services/email.services'
import { appEventEmitter } from '../events/eventEmitter'
dotenv.config()

export class ClientController {
    static async add(req: Request, res: Response) {
        const { name, username, email } = req.body

        const { error } = clientSchema.safeParse(req.body)

        if (error) {
            res.status(400).json({
                error: error.issues[0].message,
            })
            return
        }

        // @ts-ignore
        const { user } = req.session

        if (!user) {
            res.status(401).json({
                error: 'Usuario no autenticado',
            })
            return
        }

        const [errorUser, client] = await ClientModel.findByUsername({
            username,
        })

        if (client !== undefined) {
            res.status(403).json({
                error: 'El usuario ya existe',
            })
            return
        }

        const [errorEmail, userEmail] = await ClientModel.findByEmail({ email })

        if (userEmail !== undefined) {
            res.status(403).json({
                error: 'El email ya existe',
            })
            return
        }

        if (errorEmail) {
            res.status(500).json({
                error: 'Error al buscar el email',
            })
            return
        }

        if (errorUser) {
            res.status(500).json({
                error: 'Error al buscar el usuario',
            })
            return
        }

        const created_at = new Date().toISOString()

        const password = generatePassword()

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
                email,
                created_at,
                createdBy: user.id,
            })
            if (error) {
                res.status(500).json({
                    error: 'Error al guardar la informacion',
                })
                return
            }

            appEventEmitter.emit('clientCreated', {
                id: result.id,
                email,
                name,
                password,
            })

            res.json({
                data: result,
            })
            return hash
        })
    }

    static async findClientById(req: Request, res: Response) {
        const { id } = req.params

        const { error } = idSchema.safeParse(id)

        if (error) {
            res.status(400).json({
                error: error.issues[0].message,
            })
            return
        }

        const [clientError, result] = await ClientModel.findClientById({ id })

        if (result === undefined) {
            res.status(404).json({
                error: 'Cliente no encontrado',
            })
            return
        }

        if (clientError) {
            res.status(500).json({
                error: 'Error al guardar la informacion',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async getAllClientsByCreatedBy(req: Request, res: Response) {
        const { createdBy } = req.params

        const { error } = idSchema.safeParse(createdBy)

        if (error) {
            res.status(400).json({
                error: error.issues[0].message,
            })
            return
        }

        const [clientError, result] =
            await ClientModel.getAllClientsByCreatedBy({ createdBy })

        if (result === undefined) {
            res.status(404).json({
                error: 'Clientes no encontrado',
            })
            return
        }

        if (clientError) {
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

        if (result.length === 0) {
            res.status(404).json({
                error: 'No se encontraron clientes',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findByUsername(req: Request, res: Response) {
        const { username } = req.body

        const { error: usernameError } =
            clientSchema.shape.username.safeParse(username)

        if (usernameError) {
            res.status(400).json({
                error: usernameError.issues[0].message,
            })
            return
        }

        const [error, result] = await ClientModel.findByUsername({ username })

        if (error) {
            res.status(500).json({
                error: 'Error al buscar el usuario',
            })
            return
        }

        if (result === undefined) {
            res.status(404).json({
                error: 'Usuario no encontrado',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async findByEmail(req: Request, res: Response) {
        const { email } = req.params

        const { error } = emailSchema.safeParse(email)

        if (error) {
            res.status(400).json({
                error: error.issues[0].message,
            })
            return
        }

        const [clientError, result] = await ClientModel.findByEmail({ email })

        if (clientError) {
            res.status(500).json({
                error: 'Error al buscar el email',
            })
            return
        }

        if (result === undefined) {
            res.status(404).json({
                error: 'Email no encontrado',
            })
            return
        }

        res.json({
            data: result,
        })
    }

    static async updatePassword(req: Request, res: Response) {
        const { id } = req.params
        const { password } = req.body

        const { error: idError } = idSchema.safeParse(id)
        const { error: passwordError } = passwordSchema.safeParse(password)

        if (passwordError) {
            res.status(400).json({
                error: passwordError.issues[0].message,
            })
            return
        }

        if (idError) {
            res.status(400).json({
                error: idError.issues[0].message,
            })
            return
        }

        const saltRounds = 10 // SaltRound to encrypt password
        // const salt = await genSalt(saltRounds); // Generate Salt
        hash(password, saltRounds, async (err, hash) => {
            const [clientError, result] = await ClientModel.updatePassword({
                id,
                newPassword: hash,
            })

            if (clientError) {
                res.status(500).json({
                    error: 'Error al actualizar la contraseña',
                })
                return
            }

            if (!result) {
                res.status(404).json({
                    error: 'Cliente no encontrado',
                })
                return
            }

            res.json({
                data: result,
            })
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

        const [error, result] = await ClientModel.findByUsernameWithPassword({
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
            const token = jwt.sign(
                { user: result },
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

    static async updateEmail(req: Request, res: Response) {
        const { id } = req.params
        const { email } = req.body

        const { error: idError } = idSchema.safeParse(id)
        const { error: emailError } = emailSchema.safeParse(email)

        if (emailError) {
            res.status(400).json({
                error: emailError.issues[0].message,
            })
            return
        }

        if (idError) {
            res.status(400).json({
                error: idError.issues[0].message,
            })
            return
        }

        const [clientError, result] = await ClientModel.updateEmail({
            id,
            newEmail: email,
        })

        if (clientError) {
            res.status(500).json({
                error: 'Error al actualizar el correo electrónico',
            })
            return
        }

        if (!result) {
            res.status(404).json({
                error: 'Cliente no encontrado',
            })
            return
        }

        res.json({
            data: result,
        })
    }
}
