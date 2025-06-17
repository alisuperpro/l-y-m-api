import app from '../../api/index'
import request from 'supertest'
import { db } from '../db/db'

describe('Resources', () => {
    const resource = {
        name: 'test',
        description: 'test',
    }

    beforeEach(async () => {
        await db.execute({
            sql: `DELETE FROM resources`,
        })
    })

    it('should add a resource', async () => {
        const response = await request(app)
            .post('/resources/add')
            .send(resource)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toContain(resource.name)
        expect(response.body.data.description).toContain(resource.description)
    })

    it('should get a resource by id', async () => {
        const res = await request(app).post('/resources/add').send(resource)

        const response = await request(app).get(
            `/resources/${res.body.data.id}`
        )

        expect(response.status).toBe(200)
        expect(response.body.data.name).toContain(resource.name)
        expect(response.body.data.description).toContain(resource.description)
    })

    it('should get all resources', async () => {
        await request(app).post('/resources/add').send(resource)
        const response = await request(app).get('/resources')

        expect(response.status).toBe(200)
        expect(response.body.data).toBeDefined()
        expect(response.body.data).toHaveLength(1)
    })
})
