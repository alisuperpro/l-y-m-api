import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

let pay = {
    referenceCode: '1234567890',
    payDate: '2025-01-01',
    photoUrl: 'https://example.com/photo.jpg',
    description: 'test',
    amount: 100000,
    paidToDepartment: 'Department Test',
    debtId: '',
    clientId: '',
}

beforeEach(async () => {
    await db.execute({
        sql: `DELETE FROM pay`,
    })

    await db.execute({
        sql: `DELETE FROM debt`,
    })

    await db.execute({
        sql: `DELETE FROM clients`,
    })

    await db.execute({
        sql: 'DELETE FROM employee',
    })

    await db.execute({
        sql: 'DELETE FROM departments',
    })
    await db.execute({
        sql: 'DELETE FROM role',
    })

    const clientRes = await request(app).post('/clients/add').send({
        name: 'test',
        username: 'test',
        password: 'test',
    })
    const clientId = clientRes.body.data.id

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

    let debtTest = {
        amount: 100,
        description: 'Test',
        clientId: '',
        createdBy: '',
        date: '',
        status: 'pendiente',
    }

    debtTest = {
        ...debtTest,
        clientId,
        createdBy: createdBy.body.data.id,
        date: new Date().toISOString(),
    }

    const debtRes = await request(app).post('/debt/add').send(debtTest)
    const debtId = debtRes.body.data.id

    pay = {
        ...pay,
        debtId: debtId,
        clientId: clientId,
    }
})

afterAll(async () => {
    await db.execute({
        sql: `DELETE FROM pay`,
    })

    await db.execute({
        sql: `DELETE FROM debt`,
    })

    await db.execute({
        sql: `DELETE FROM clients`,
    })

    await db.execute({
        sql: 'DELETE FROM employee',
    })

    await db.execute({
        sql: 'DELETE FROM departments',
    })
    await db.execute({
        sql: 'DELETE FROM role',
    })
})

describe('Pay', () => {
    it('should add a pay', async () => {
        const response = await request(app).post('/pay/add').send(pay)

        expect(response.status).toBe(200)
    })

    it('should get a pay by id', async () => {
        const payId = await request(app).post('/pay/add').send(pay)
        const response = await request(app).get(`/pay/${payId.body.data.id}`)

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(payId.body.data.id)
    })

    it('should get all pays', async () => {
        await request(app).post('/pay/add').send(pay)
        const response = await request(app).get('/pay')

        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(1)
    })
})
