import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

describe('Departments API', () => {
    beforeEach(async () => {
        // Limpiar la tabla de departamentos antes de cada prueba
        await db.execute({
            sql: 'DELETE FROM departments',
        })
    })

    describe('POST /departments/add', () => {
        it('debería crear un nuevo departamento', async () => {
            const departmentData = {
                name: 'Recursos Humanos',
            }

            const response = await request(app)
                .post('/departments/add')
                .send(departmentData)

            expect(response.status).toBe(200)
            expect(response.body.data).toHaveProperty('id')
            expect(response.body.data.name).toBe(departmentData.name)
        })

        it('debería retornar error si el departamento ya existe', async () => {
            const departmentData = {
                name: 'Recursos Humanos',
            }

            // Crear el departamento por primera vez
            await request(app).post('/departments/add').send(departmentData)

            // Intentar crear el mismo departamento
            const response = await request(app)
                .post('/departments/add')
                .send(departmentData)

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('El departamento ya existe')
        })
    })

    describe('GET /departments', () => {
        it('debería retornar todos los departamentos', async () => {
            // Crear algunos departamentos de prueba
            const departments = [
                { name: 'Recursos Humanos' },
                { name: 'Tecnología' },
            ]

            for (const dept of departments) {
                await request(app).post('/departments/add').send(dept)
            }

            const response = await request(app).get('/departments')

            expect(response.status).toBe(200)
            expect(response.body.data).toHaveLength(2)
            expect(response.body.data[0]).toHaveProperty('name')
            expect(response.body.data[1]).toHaveProperty('name')
        })
    })

    describe('GET /departments/:id', () => {
        it('debería retornar un departamento específico', async () => {
            // Crear un departamento de prueba
            const createResponse = await request(app)
                .post('/departments/add')
                .send({ name: 'Recursos Humanos' })

            const departmentId = createResponse.body.data.id

            const response = await request(app).get(
                `/departments/${departmentId}`
            )

            expect(response.status).toBe(200)
            expect(response.body.data.id).toBe(departmentId)
            expect(response.body.data.name).toBe('Recursos Humanos')
        })

        it('debería retornar 404 si el departamento no existe', async () => {
            const response = await request(app).get('/departments/999')

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('El departamento no existe')
        })
    })

    describe('DELETE /departments', () => {
        it('debería eliminar un departamento', async () => {
            // Crear un departamento de prueba
            const createResponse = await request(app)
                .post('/departments/add')
                .send({ name: 'Recursos Humanos' })

            const departmentId = createResponse.body.data.id

            const response = await request(app)
                .delete('/departments/')
                .send({ id: departmentId })

            expect(response.status).toBe(200)

            // Verificar que el departamento ya no existe
            const getResponse = await request(app).get(
                `/departments/${departmentId}`
            )
            expect(getResponse.status).toBe(404)
        })

        it('debería retornar 404 si intenta eliminar un departamento inexistente', async () => {
            const response = await request(app)
                .delete('/departments/')
                .send({ id: '999' })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('El departamento no existe')
        })
    })
})
