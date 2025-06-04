import express from 'express'
import { EmployeeController } from '../controller/employee'

export const employeeRouter = express.Router()

employeeRouter.get('/', EmployeeController.getAll)
employeeRouter.get('/:id', EmployeeController.findEmployeeById)

employeeRouter.post('/add', EmployeeController.add)
