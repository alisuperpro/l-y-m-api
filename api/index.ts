import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { employeeRouter } from '../src/routes/employee'
import { clientRouter } from '../src/routes/client'
import { debtRouter } from '../src/routes/debt'
import cookieParser from 'cookie-parser'
import { permisionRouter } from '../src/routes/permission'
import { roleRouter } from '../src/routes/role'
import { rolePermissionRouter } from '../src/routes/rolePermission'
import { departmentsRouter } from '../src/routes/departments'
import { payRouter } from '../src/routes/pay'
import { resourcesRouter } from '../src/routes/resources'
import { actionsRouter } from '../src/routes/actions'
import { userPermissionRouter } from '../src/routes/userPermission'
import { statesRouter } from '../src/routes/states'
import { organizationsRouter } from '../src/routes/organizations'
import { clientDocumentsRouter } from '../src/routes/clientDocuments'
import { clientCompanyRouter } from '../src/routes/clientCompany'
import { setupEmailService } from '../src/events/email.services'
import { setupClientService } from '../src/events/client.services'
import { setupDebtService } from '../src/events/debt.services'
import { setupEmployeeService } from '../src/events/employee.services'
import { currencyRouter } from '../src/routes/currency'

const app = express()

dotenv.config()

const originsDev = ['http://localhost:4321']
const originsProd = process.env.ACCEPTED_ORIGIN?.split(",") ?? ["*"]
const corsOptions = {
    origin: process.env.NODE_ENV === 'development' ? originsDev : originsProd,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
}

app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

setupEmailService()
setupClientService()
setupDebtService()
setupEmployeeService()

app.get('/', async (_: any, res: { send: (arg0: string) => void }) => {
    res.send('hello world')
})

app.use('/employee', employeeRouter)
app.use('/clients', clientRouter)
app.use('/debt', debtRouter)
app.use('/permission', permisionRouter)
app.use('/role', roleRouter)
app.use('/role-permission', rolePermissionRouter)
app.use('/departments', departmentsRouter)
app.use('/pay', payRouter)
app.use('/resources', resourcesRouter)
app.use('/actions', actionsRouter)
app.use('/user-permission', userPermissionRouter)
app.use('/states', statesRouter)
app.use('/organizations', organizationsRouter)
app.use('/client-documents', clientDocumentsRouter)
app.use('/client-company', clientCompanyRouter)
app.use('/currency', currencyRouter)

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT ?? 3500

    app.listen(PORT, () => {
        console.log(`Server run on port: ${PORT}`)
    })
}

export default app
