import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

describe('Clients API', () => {
    const clientTest = {
        name: 'John Doe',
        username: 'john.doe',
        password: 'password',
    }
    beforeEach(async () => {
        await db.execute({
            sql: 'DELETE FROM clients',
        })
    })
    afterAll(async () => {
        await db.execute({
            sql: 'DELETE FROM clients',
        })
    })
    describe('POST /clients', () => {
        it('should create a new client', async () => {
            const response = await request(app)
                .post('/clients/add')
                .send(clientTest)

            expect(response.status).toBe(200)
            expect(response.body.data.name).toBe(clientTest.name)
            expect(response.body.data.username).toBe(clientTest.username)
        })

        it('should not create a new client if the username already exists', async () => {
            await request(app).post('/clients/add').send(clientTest)
            const response = await request(app)
                .post('/clients/add')
                .send(clientTest)

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('El usuario ya existe')
        })
    })

    describe('GET /clients', () => {
        it('should return all clients', async () => {
            await request(app).post('/clients/add').send(clientTest)
            const response = await request(app).get('/clients')
            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
        })

        it('should return client by id', async () => {
            const client = await request(app)
                .post('/clients/add')
                .send(clientTest)

            const response = await request(app).get(
                `/clients/${client.body.data.id}`
            )
            expect(response.status).toBe(200)
            expect(response.body.data.name).toBe(clientTest.name)
            expect(response.body.data.username).toBe(clientTest.username)
        })

        it('should return 404 if the client does not exist', async () => {
            const response = await request(app).get(`/clients/123`)
            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Cliente no encontrado')
        })

        it('by username', async () => {
            await request(app).post('/clients/add').send(clientTest)
            const response = await request(app).get('/clients/username').send({
                username: clientTest.username,
            })
            expect(response.status).toBe(200)
            expect(response.body.data.name).toBe(clientTest.name)
            expect(response.body.data.username).toBe(clientTest.username)
        })
    })
})
