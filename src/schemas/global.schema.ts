import { z } from 'zod'

export const idSchema = z
    .string()
    .uuid()
    .nonempty({
        message: 'ID cannot be empty',
    })
    .min(36, {
        message: 'ID must be a valid UUID',
    })

export const nameSchema = z
    .string()
    .min(3, {
        message: 'Name must be at least 3 characters long',
    })
    .max(100, {
        message: 'Name must be at most 100 characters long',
    })

export const statesSchema = z
    .string()
    .min(4, {
        message: 'State must be at least 4 characters long',
    })
    .max(50, {
        message: 'State must be at most 50 characters long',
    })
