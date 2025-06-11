import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

describe('Role API', () => {
    const roleData = {
        name: 'Administrador',
        description: 'Administrador del sistema',
    }
    beforeEach(async () => {
        await db.execute({
            sql: 'DELETE FROM role',
        })
    })

    describe('POST /role/add', () => {
        it('debería crear un rol', async () => {
            const response = await request(app).post('/role/add').send(roleData)
            expect(response.status).toBe(200)
            expect(response.body.data).toHaveProperty('id')
        })

        it('debería retornar un error si el rol ya existe', async () => {
            await request(app).post('/role/add').send(roleData)
            const response = await request(app).post('/role/add').send(roleData)
            expect(response.status).toBe(403)
            expect(response.body.error).toBe('El rol ya existe')
        })
    })

    describe('GET /role', () => {
        it('debería retornar todos los roles', async () => {
            await request(app).post('/role/add').send(roleData)
            const response = await request(app).get('/role')
            expect(response.status).toBe(200)
            expect(response.body.data).toHaveLength(1)
        })
    })

    describe('GET /role/:id', () => {
        it('debería retornar un rol', async () => {
            const rol = await request(app).post('/role/add').send(roleData)

            const response = await request(app).get(`/role/${rol.body.data.id}`)
            expect(response.status).toBe(200)
            expect(response.body.data).toHaveProperty('id')
            expect(response.body.data.name).toBe(roleData.name)
        })
    })
})
