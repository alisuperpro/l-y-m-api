import { z } from 'zod'

export const EmployeeSchema = z.object({
    name: z.string().min(2).max(100),
    username: z.string().min(2).max(100),
    password: z.string().min(6).max(100),
    roleId: z.string().uuid(),
    departmentId: z.string().uuid(),
})
