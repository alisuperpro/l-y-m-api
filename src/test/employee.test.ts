import request from 'supertest'
import app from '../../api/index'

const employeeTest = {
    name: 'Test',
    username: 'test',
    password: '123456789',
    roleId: 'role_1',
    departmentId: 'dep_1',
}

describe('Employee API Tests', () => {
    describe('GET /employee', () => {
        test('debería obtener todos los empleados', async () => {
            const res = await request(app).get('/employee/')

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(Array.isArray(res.body.data)).toBe(true)
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
    })

    describe('POST /employee/add', () => {
        test('debería crear un nuevo empleado exitosamente', async () => {
            const departmentData = {
                name: 'Recursos Humanos',
            }

            // Crear el departamento por primera vez
            await request(app).post('/departments/add').send(departmentData)
            const dep = await request(app).get('/departments/')

            const e = {
                ...employeeTest,
                departmentId: dep.body.data[0].id,
            }

            const res = await request(app).post('/employee/add').send(e)

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(res.body.data).toHaveProperty('id')
        })

        test('debería retornar 403 al intentar crear un usuario duplicado', async () => {
            const res = await request(app)
                .post('/employee/add')
                .send(employeeTest)

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Ye existe el usuario')
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
            // Primero obtenemos el ID del empleado
            const resUser = await request(app)
                .get('/employee/username')
                .query({ user: employeeTest.username })

            const res = await request(app)
                .delete('/employee/')
                .send({ id: resUser.body.data.id })

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
        })

        test('debería retornar 403 cuando falta el ID', async () => {
            const res = await request(app).delete('/employee/').send({})

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Falta el id')
        })
    })
})
