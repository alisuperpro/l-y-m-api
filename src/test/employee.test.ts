import request from 'supertest'
import app from '../../api/index'

describe('Test the employee path', () => {
    test('test / path should response with all employee data', async () => {
        const res = await request(app).get('/employee/')

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toBeTruthy()
    })
    test('test /add path', async () => {
        const res = await request(app).post('/employee/add').send({
            name: 'Test',
            username: 'test',
            password: '123456789',
            role: 'cobrador',
            permission_id: 'dfoijdofds',
            department: 'cobranza',
        })

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toBeTruthy()
    })
})
