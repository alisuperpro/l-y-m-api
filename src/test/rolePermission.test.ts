import app from '../../api/index'
import request from 'supertest'
import { db } from '../db/db'

describe('Role Permission API', () => {
    describe('POST Role Permission', () => {
        beforeEach(async () => {
            await db.execute({
                sql: 'DELETE FROM role_permission',
            })

            await db.execute({
                sql: 'DELETE FROM role',
            })

            await db.execute({
                sql: 'DELETE FROM permission',
            })

            await request(app).post('/role/add').send({
                name: 'Administrador',
                description: 'Administrador del sistema',
            })

            await request(app).post('/permission/add').send({
                name: 'Crear empleado',
                description: 'Crear empleado',
            })
        })
        it('Test /add', async () => {
            const roleId = await request(app).get('/role/')
            const permissionId = await request(app).get('/permission/')

            const response = await request(app)
                .post('/role-permission/add')
                .send({
                    roleId: roleId.body.data[0].id,
                    permissionId: permissionId.body.data[0].id,
                })

            expect(response.status).toBe(200)
            expect(response.body.data).toHaveProperty('role_id')
            expect(response.body.data).toHaveProperty('permission_id')
        })

        it('Test /add with invalid roleId and permissionId', async () => {
            const response = await request(app)
                .post('/role-permission/add')
                .send({
                    roleId: 'invalid-role-id',
                    permissionId: '1',
                })

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('Error al crear la relacion')
        })
    })

    describe('GET Role Permission', () => {
        beforeEach(async () => {
            await db.execute({
                sql: 'DELETE FROM role_permission',
            })

            await db.execute({
                sql: 'DELETE FROM role',
            })

            await db.execute({
                sql: 'DELETE FROM permission',
            })

            await request(app).post('/role/add').send({
                name: 'Administrador',
                description: 'Administrador del sistema',
            })

            await request(app).post('/permission/add').send({
                name: 'Crear empleado',
                description: 'Crear empleado',
            })

            const roleId = await request(app).get('/role/')
            const permissionId = await request(app).get('/permission/')

            await request(app).post('/role-permission/add').send({
                roleId: roleId.body.data[0].id,
                permissionId: permissionId.body.data[0].id,
            })
        })
        it('Test /role/:roleId', async () => {
            const roleId = await request(app).get('/role/')

            const id = roleId.body.data[0].id
            const response = await request(app).get(
                `/role-permission/role/${roleId.body.data[0].id}`
            )
            expect(response.status).toBe(200)
            expect(response.body.data).toHaveLength(1)
            expect(response.body.data[0]).toHaveProperty('role_id')
            expect(response.body.data[0]).toHaveProperty('permission_id')
        })
        it('Test /permission/:permissionId', async () => {
            const permissionId = await request(app).get('/permission/')

            const id = permissionId.body.data[0].id

            const response = await request(app).get(
                `/role-permission/permission/${permissionId.body.data[0].id}`
            )
            expect(response.status).toBe(200)
            expect(response.body.data).toHaveLength(1)
            expect(response.body.data[0]).toHaveProperty('role_id')
            expect(response.body.data[0]).toHaveProperty('permission_id')
        })
    })
})
