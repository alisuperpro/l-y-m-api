import express from 'express'
import { DepartmentsController } from '../controller/departments'

export const departmentsRouter = express.Router()

departmentsRouter.get('/', DepartmentsController.getAll)
departmentsRouter.get('/:id', DepartmentsController.findById)

departmentsRouter.post('/add', DepartmentsController.add)

if (process.env.NODE_ENV === 'test') {
    departmentsRouter.delete('/', DepartmentsController.delete)
}
