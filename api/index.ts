import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { employeeRouter } from '../src/routes/employee'
import { clientRouter } from '../src/routes/client'
import { debtRouter } from '../src/routes/debt'
import cookieParser from 'cookie-parser'
import { permisionRouter } from '../src/routes/permission'

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
app.use(cookieParser())

app.get('/', async (_: any, res: { send: (arg0: string) => void }) => {
    res.send('hello world')
})

app.use('/employee', employeeRouter)
app.use('/client', clientRouter)
app.use('/debt', debtRouter)
app.use('/permission', permisionRouter)

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT ?? 3500

    app.listen(PORT, () => {
        console.log(`Server run on port: ${PORT}`)
    })
}

export default app
