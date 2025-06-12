import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

const employeeTest = {
    name: 'Test',
    username: 'test',
    password: '123456789',
    roleId: 'role_1',
    departmentId: 'dep_1',
}

describe('Employee API Tests', () => {
    let departmentId: string
    let roleId: string
    let employeeId: string

    beforeAll(async () => {
        // Limpiar la base de datos antes de todas las pruebas
        await db.execute({
            sql: 'DELETE FROM departments',
        })
        await db.execute({
            sql: 'DELETE FROM role',
        })
        await db.execute({
            sql: 'DELETE FROM employee',
        })

        // Crear datos base necesarios
        const departmentRes = await request(app)
            .post('/departments/add')
            .send({ name: 'Recursos Humanos' })
        departmentId = departmentRes.body.data.id

        const roleRes = await request(app).post('/role/add').send({
            name: 'Administrador',
            description: 'Administrador del sistema',
        })
        roleId = roleRes.body.data.id
    })

    describe('POST /employee/add', () => {
        test('debería crear un nuevo empleado exitosamente', async () => {
            const employeeData = {
                ...employeeTest,
                departmentId,
                roleId,
            }

            const res = await request(app)
                .post('/employee/add')
                .send(employeeData)

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(res.body.data).toHaveProperty('id')
            employeeId = res.body.data.id
        })

        test('debería retornar 403 al intentar crear un usuario duplicado', async () => {
            const employeeData = {
                ...employeeTest,
                departmentId,
                roleId,
            }

            const res = await request(app)
                .post('/employee/add')
                .send(employeeData)

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Ya existe el usuario')
        })

        test('debería retornar 403 al intentar crear un empleado sin datos requeridos', async () => {
            const res = await request(app).post('/employee/add').send({})

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBeTruthy()
        })
    })

    describe('GET /employee', () => {
        test('debería obtener todos los empleados', async () => {
            const res = await request(app).get('/employee/')

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBeGreaterThan(0)
        })
    })

    describe('GET /employee/username', () => {
        test('debería retornar 403 cuando falta el parámetro user', async () => {
            const res = await request(app).get('/employee/username')

            expect(res.statusCode).toBe(403)
            expect(res.body.data).toBeFalsy()
            expect(res.body.error).toBe('Falta el usuario')
        })

        test('debería retornar 404 cuando el usuario no existe', async () => {
            const res = await request(app)
                .get('/employee/username')
                .query({ user: 'usuario_inexistente' })

            expect(res.statusCode).toBe(404)
            expect(res.body.data).toBeFalsy()
            expect(res.body.error).toBe('Usuario no encontrado')
        })

        test('debería encontrar un usuario existente', async () => {
            const res = await request(app)
                .get('/employee/username')
                .query({ user: employeeTest.username })

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(res.body.data.username).toBe(employeeTest.username)
        })
    })

    describe('POST /employee/login', () => {
        test('debería hacer login exitosamente', async () => {
            const res = await request(app).post('/employee/login').send({
                username: employeeTest.username,
                password: employeeTest.password,
            })

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(res.headers['set-cookie']).toBeTruthy()
        })

        test('debería retornar 403 con credenciales inválidas', async () => {
            const res = await request(app).post('/employee/login').send({
                username: employeeTest.username,
                password: 'password_incorrecto',
            })

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Usuario y/o contraseña invalido')
        })

        test('debería retornar 403 con usuario inexistente', async () => {
            const res = await request(app).post('/employee/login').send({
                username: 'usuario_inexistente',
                password: 'cualquier_password',
            })

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Usuario y/o contraseña invalido')
        })
    })

    describe('POST /employee/logout', () => {
        test('debería hacer logout exitosamente', async () => {
            const res = await request(app).post('/employee/logout')

            expect(res.statusCode).toBe(200)
            expect(res.body.message).toBe('logout')
            expect(res.headers['set-cookie']).toBeTruthy()
        })
    })

    describe('DELETE /employee', () => {
        test('debería eliminar un empleado exitosamente', async () => {
            const res = await request(app)
                .delete('/employee/')
                .send({ id: employeeId })

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
        })

        test('debería retornar 403 cuando falta el ID', async () => {
            const res = await request(app).delete('/employee/').send({})

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Falta el id')
        })

        test('debería retornar 404 cuando el ID no existe', async () => {
            const res = await request(app)
                .delete('/employee/')
                .send({ id: 'id_inexistente' })

            expect(res.statusCode).toBe(404)
            expect(res.body.error).toBe('Empleado no encontrado')
        })
    })
})
