import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { employeeRouter } from './routes/employee'
import { clientRouter } from './routes/client'
import { debtRouter } from './routes/debt'

const app = express()

dotenv.config()
const corsOptions = {
    origin: ['*'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (_: any, res: { send: (arg0: string) => void }) => {
    res.send('hello world')
})

app.use('/employee', employeeRouter)
app.use('/client', clientRouter)
app.use('/debt', debtRouter)

export default app
