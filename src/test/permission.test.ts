import app from '../../api/index'
import request from 'supertest'
import { db } from '../db/db'

describe('Permission', () => {
    let permission = {
        resourcesId: '1',
        actionsId: '1',
        description: 'test',
    }

    beforeEach(async () => {
        await db.execute({
            sql: `DELETE FROM permission`,
        })

        await db.execute({
            sql: `DELETE FROM resources`,
        })

        await db.execute({
            sql: `DELETE FROM actions`,
        })

        const resourcesID = await request(app).post('/resources/add').send({
            name: 'test',
        })

        permission.resourcesId = resourcesID.body.data.id

        const actionsID = await request(app).post('/actions/add').send({
            name: 'test',
        })

        permission.actionsId = actionsID.body.data.id
    })

    it('should add a permission', async () => {
        const response = await request(app)
            .post('/permission/add')
            .send(permission)

        expect(response.status).toBe(200)
        expect(response.body.data.resources_id).toBe(permission.resourcesId)
        expect(response.body.data.actions_id).toBe(permission.actionsId)
        expect(response.body.data.description).toBe(permission.description)
    })

    it('should get all permissions', async () => {
        await request(app).post('/permission/add').send(permission)
        const response = await request(app).get('/permission/')

        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(1)
        expect(response.body.data[0].resources_id).toBe(permission.resourcesId)
        expect(response.body.data[0].actions_id).toBe(permission.actionsId)
        expect(response.body.data[0].description).toBe(permission.description)
    })
})
