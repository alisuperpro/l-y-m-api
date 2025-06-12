import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

describe('Debt API', () => {
    let debtTest = {
        amount: 100,
        description: 'Test',
        clientId: '',
        createdBy: '',
        date: '',
        status: 'pendiente',
    }

    beforeEach(async () => {
        await db.execute({
            sql: 'DELETE FROM debt',
        })

        await db.execute({
            sql: 'DELETE FROM employee',
        })
        await db.execute({
            sql: 'DELETE FROM clients',
        })
        await db.execute({
            sql: 'DELETE FROM departments',
        })
        await db.execute({
            sql: 'DELETE FROM role',
        })

        const clientId = await request(app).post('/clients/add').send({
            name: 'John Doe',
            username: 'john.doe',
            password: 'password',
        })

        const roleId = await request(app).post('/role/add').send({
            name: 'Role Test',
            description: 'Role Test',
        })

        const departmentId = await request(app).post('/departments/add').send({
            name: 'Department Test',
            description: 'Department Test',
        })

        const createdBy = await request(app).post('/employee/add').send({
            name: 'Employee Test',
            username: 'employee.test',
            password: '123456789',
            roleId: roleId.body.data.id,
            departmentId: departmentId.body.data.id,
        })

        debtTest = {
            ...debtTest,
            clientId: clientId.body.data.id,
            createdBy: createdBy.body.data.id,
            date: new Date().toISOString(),
        }
    })

    describe('POST /debt/add', () => {
        it('should create a new debt', async () => {
            const response = await request(app).post('/debt/add').send(debtTest)
            expect(response.status).toBe(200)
            expect(response.body.data.amount).toBe(debtTest.amount)
        })
    })

    describe('GET /debt/getAllDebtInfo', () => {
        it('should return all debts with all info', async () => {
            await request(app).post('/debt/add').send(debtTest)
            const response = await request(app).get('/debt/getAllDebtInfo')
            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
        })

        it('should return 404 if no debts are found', async () => {
            const response = await request(app).get('/debt/getAllDebtInfo')
            expect(response.status).toBe(404)
            expect(response.body.error).toBe('No se encontraron deudas')
        })
    })

    describe('GET /debt/:id', () => {
        it('should return a debt by id', async () => {
            const debtId = await request(app).post('/debt/add').send(debtTest)
            const response = await request(app).get(
                `/debt/${debtId.body.data.id}`
            )
            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
        })

        it('should return 404 if no debt is found', async () => {
            const response = await request(app).get(`/debt/123`)
            expect(response.status).toBe(404)
            expect(response.body.error).toBe('No se encontró la deuda')
        })
    })

    describe('PUT /debt/updateStatus', () => {
        it('should update the status of a debt', async () => {
            const debtId = await request(app).post('/debt/add').send(debtTest)
            const response = await request(app).put('/debt/updateStatus').send({
                id: debtId.body.data.id,
                status: 'pagado',
            })
            expect(response.status).toBe(200)
            expect(response.body.data.status).toBe('pagado')
        })

        it('should return 404 if no debt is found', async () => {
            const response = await request(app).put('/debt/updateStatus').send({
                id: '123',
                status: 'pagado',
            })
            expect(response.status).toBe(404)
            expect(response.body.error).toBe('No se encontró la deuda')
        })
    })
})
