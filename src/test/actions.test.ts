import app from '../../api/index'
import request from 'supertest'
import { db } from '../db/db'

describe('Actions', () => {
    const action = {
        name: 'test',
        description: 'test',
    }

    beforeEach(async () => {
        await db.execute({
            sql: `DELETE FROM actions`,
        })
    })

    it('should add an action', async () => {
        const response = await request(app).post('/actions/add').send(action)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toContain(action.name)
        expect(response.body.data.description).toContain(action.description)
    })

    it('should get an action by id', async () => {
        const res = await request(app).post('/actions/add').send(action)

        const response = await request(app).get(`/actions/${res.body.data.id}`)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toContain(action.name)
        expect(response.body.data.description).toContain(action.description)
    })

    it('should get all actions', async () => {
        await request(app).post('/actions/add').send(action)

        const response = await request(app).get('/actions')

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveLength(1)
    })
})
