import express from 'express'
import { ClientController } from '../controller/client'

export const clientRouter = express.Router()

clientRouter.get('/', ClientController.getAll)
clientRouter.get('/username', ClientController.findByUsername)
clientRouter.get('/:id', ClientController.findClientById)

clientRouter.post('/add', ClientController.add)
