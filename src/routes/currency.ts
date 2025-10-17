import { Router } from 'express'
import { CurrencyController } from '../controller/currency'

export const currencyRouter = Router()

currencyRouter.get('/', CurrencyController.getAll)
