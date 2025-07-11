import { z } from 'zod'

export const emailSchema = z
    .string()
    .min(2, { message: 'el correo es requerida' })
    .email({ message: 'El correo debe ser un email válido' })

export const idSchema = z
    .string()
    .uuid({ message: 'El id debe ser un UUID válido' })

export const passwordSchema = z
    .string()
    .min(8, { message: 'La contraseña es requerida' })

export const clientSchema = z.object({
    name: z.string().min(2, { message: 'El nombre es requerido' }),
    username: z.string().min(2, { message: 'El usuario es requerido' }),
    email: emailSchema,
    avatar: z.string().url(),
    accountState: z
        .string()
        .uuid({ message: 'El estado de la cuenta debe ser un UUID válido' }),
})
