import { Request, Response } from 'express'
import { CurrencyModel } from '../models/currency'

export class CurrencyController {
    static async getAll(req: Request, res: Response) {
        const [error, currency] = await CurrencyModel.getAll()

        if (error) {
            res.status(500).json({
                error: 'Error al buscar las monedas',
            })
            return
        }

        res.json({
            data: currency,
        })
    }
}
