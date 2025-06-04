import request from 'supertest'
import app from '../server'

describe('Test the employee path', () => {
    test('It should response the GET method', async () => {
        const res = await request(app).get('/employee/')

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toBeTruthy()
    })
})
