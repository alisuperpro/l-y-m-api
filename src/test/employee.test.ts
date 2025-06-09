import request from 'supertest'
import app from '../../api/index'

const employeeTest = {
    name: 'Test',
    username: 'test',
    password: '123456789',
    role: 'cobrador',
    permission_id: 'dfoijdofds',
    department: 'cobranza',
}

describe('Test the employee path', () => {
    test('test /username path missing query', async () => {
        const res = await request(app).get('/employee/username')

        expect(res.statusCode).toBe(403)
        expect(res.body.data).toBeFalsy()
        expect(res.body.error).toBeTruthy()
    })

    test('test /username path user not exist on db', async () => {
        const res = await request(app)
            .get('/employee/username')
            .query({ user: employeeTest.username })

        expect(res.statusCode).toBe(404)
        expect(res.body.data).toBeFalsy()
        expect(res.body.error).toBeTruthy()
    })

    test('test /add path', async () => {
        const res = await request(app).post('/employee/add').send(employeeTest)

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toBeTruthy()
    })

    test('test / path should response with all employee data', async () => {
        const res = await request(app).get('/employee/')

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toBeTruthy()
    })

    test('test /add test username', async () => {
        const res = await request(app).post('/employee/add').send(employeeTest)

        expect(res.statusCode).toBe(403)
        expect(res.body.error).toBeTruthy()
    })

    test('test /username path user exist on db', async () => {
        const res = await request(app)
            .get('/employee/username')
            .query({ user: employeeTest.username })

        expect(res.statusCode).toBe(200)
        expect(res.body).toBeTruthy()
    })

    test('test delete user', async () => {
        const resUser = await request(app)
            .get('/employee/username')
            .query({ user: employeeTest.username })

        const res = await request(app)
            .delete('/employee/')
            .send({ id: resUser.body.data[0].id })

        expect(res.statusCode).toBe(200)
    })
})
