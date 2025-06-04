import express from 'express'
import { DebtController } from '../controller/debt'

export const debtRouter = express.Router()

debtRouter.get('/getAllDebtInfo', DebtController.getAllDebtWithAllInfo)
debtRouter.get('/:id', DebtController.getById)

debtRouter.post('/add', DebtController.add)
