import dotenv from 'dotenv'
dotenv.config()

export const BUSSINES_DATA = {
    name: 'Soluciones L y M',
    web: 'https://solucioneslym.com',
    supportEmail: 'soporte@solucioneslym.com',
    supportEmailPassword: process.env.EMAIL_PASSWORD,
    supportEmailName: 'Soluciones L y M',
} as const
