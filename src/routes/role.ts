import express from 'express'
import { RoleController } from '../controller/role'

export const roleRouter = express.Router()

roleRouter.get('/', RoleController.getAll)

roleRouter.post('/add', RoleController.add)
