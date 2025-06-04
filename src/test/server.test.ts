import request from 'supertest'
import app from '../server'

describe('Test the root path', () => {
    test('It should response the GET method', async () => {
        await request(app)
            .get('/')
            .then((response) => {
                expect(response.statusCode).toBe(200)
            })
    })
})
