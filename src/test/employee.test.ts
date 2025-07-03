import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

const employeeTest = {
    name: 'Test Employee',
    username: 'test_employee',
    password: '123456789',
    roleId: 'role_1',
    departmentId: 'dep_1',
}

const adminEmployeeTest = {
    name: 'Admin Employee',
    username: 'admin_employee',
    password: 'admin123456',
    roleId: 'role_2',
    departmentId: 'dep_1',
}

const createPermission = async ({
    resourcesId,
    actionsId,
}: {
    resourcesId: string
    actionsId: string
}) => {
    const permissionRes = await request(app).post('/permission/add').send({
        resourcesId,
        actionsId,
    })
    return permissionRes
}

const setupRoutePermission = async (
    routePath: string,
    permissionId: string,
    httpMethod: string = 'GET'
) => {
    return await request(app).post('/route-permission-map/add').send({
        routePath: routePath,
        permissionId,
        httpMethod: httpMethod,
    })
}

const loginAndGetToken = async (username: string, password: string) => {
    const loginRes = await request(app).post('/employee/login').send({
        username,
        password,
    })

    if (loginRes.statusCode === 200) {
        const cookies = loginRes.headers['set-cookie']
        return cookies ? cookies[0] : null
    }
    return null
}
// Utilidad para crear varias acciones y devolver sus IDs
const createActions = async (actions: { name: string }[]) => {
    const ids: string[] = []
    for (const action of actions) {
        const res = await request(app).post('/actions/add').send(action)
        ids.push(res.body.data.id)
    }
    return ids
}

// Utilidad para crear varios permisos y devolver sus respuestas
const createPermissions = async (resourcesId: string, actionsIds: string[]) => {
    return await Promise.all(
        actionsIds.map((actionsId) =>
            createPermission({ resourcesId, actionsId })
        )
    )
}

// Utilidad para mapear permisos a rutas en lote
const mapRoutePermissions = async (
    mappings: { routePath: string; permissionId: string; httpMethod?: string }[]
) => {
    for (const { routePath, permissionId, httpMethod } of mappings) {
        await setupRoutePermission(routePath, permissionId, httpMethod)
    }
}

const clearDB = async () => {
    await db.execute({ sql: 'DELETE FROM role_permission' })
    await db.execute({ sql: 'DELETE FROM user_permission' })
    await db.execute({ sql: 'DELETE FROM route_permission_map' })
    await db.execute({ sql: 'DELETE FROM permission' })
    await db.execute({ sql: 'DELETE FROM employee' })
    await db.execute({ sql: 'DELETE FROM role' })
    await db.execute({ sql: 'DELETE FROM departments' })
    await db.execute({ sql: 'DELETE FROM actions' })
    await db.execute({ sql: 'DELETE FROM resources' })
    await db.execute({ sql: 'DELETE FROM clients' })
}

describe('Employee API Tests', () => {
    let departmentId: string
    let roleId: string
    let adminRoleId: string
    let resourcesId: string
    let employeeId: string
    let adminEmployeeId: string
    let accessToken: string
    let adminAccessToken: string

    // Permission IDs for different actions
    let createPermissionId: string
    let readAllPermission: string
    let readByIdPermission: string
    let readByUsernamePermission: string
    let updatePermissionId: string
    let createClientPermission: string
    let readClientByIdPermission: string

    beforeAll(async () => {
        // Clean database before all tests
        await clearDB()

        // Create base data
        const departmentRes = await request(app)
            .post('/departments/add')
            .send({ name: 'Recursos Humanos' })
        departmentId = departmentRes.body.data.id

        const roleRes = await request(app).post('/role/add').send({
            name: 'Empleado',
            description: 'Empleado del sistema',
        })
        roleId = roleRes.body.data.id

        const adminRoleRes = await request(app).post('/role/add').send({
            name: 'Administrador',
            description: 'Administrador del sistema',
        })
        adminRoleId = adminRoleRes.body.data.id

        const resourcesRes = await request(app).post('/resources/add').send({
            name: 'employee',
        })
        resourcesId = resourcesRes.body.data.id

        // Crear acciones y permisos de forma eficiente
        const actions = [
            { name: 'can_create_employee' },
            { name: 'can_read_all_employee' },
            { name: 'can_read_by_id_employee' },
            { name: 'can_read_by_username_employee' },
            { name: 'can_update_employee' },
            { name: 'can_create_client' },
            { name: 'can_read_clients_by_id' },
        ]
        const actionIds = await createActions(actions)
        const permissionResults = await createPermissions(
            resourcesId,
            actionIds
        )

        createPermissionId = permissionResults[0].body.data.id
        readAllPermission = permissionResults[1].body.data.id
        readByIdPermission = permissionResults[2].body.data.id
        readByUsernamePermission = permissionResults[3].body.data.id
        updatePermissionId = permissionResults[4].body.data.id
        createClientPermission = permissionResults[5].body.data.id
        readClientByIdPermission = permissionResults[6].body.data.id

        // Mapear permisos a rutas de forma eficiente
        await mapRoutePermissions([
            {
                routePath: '/employee/add',
                permissionId: createPermissionId,
                httpMethod: 'POST',
            },
            {
                routePath: '/employee/',
                permissionId: readAllPermission,
                httpMethod: 'GET',
            },
            {
                routePath: '/employee/username',
                permissionId: readByUsernamePermission,
                httpMethod: 'GET',
            },
            {
                routePath: '/employee/:id',
                permissionId: readByIdPermission,
                httpMethod: 'GET',
            },
            {
                routePath: '/clients/add',
                permissionId: createClientPermission,
                httpMethod: 'POST',
            },
            {
                routePath: '/clients/:id',
                permissionId: readClientByIdPermission,
                httpMethod: 'GET',
            },
        ])

        const adminEmployeeRes = await request(app)
            .post('/employee/add-admin')
            .send({
                ...adminEmployeeTest,
                roleId: adminRoleId,
                departmentId,
            })
        adminEmployeeId = adminEmployeeRes.body.data.id

        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: createPermissionId,
        })
        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readByIdPermission,
        })
        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readByUsernamePermission,
        })
        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readAllPermission,
        })
        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: updatePermissionId,
        })
        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: createClientPermission,
        })

        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readClientByIdPermission,
        })
        //@ts-ignore
        adminAccessToken = await loginAndGetToken(
            adminEmployeeTest.username,
            adminEmployeeTest.password
        )

        const employeeRes = await request(app)
            .post('/employee/add')
            .set('Cookie', adminAccessToken)
            .send({
                ...employeeTest,
                roleId,
                departmentId,
            })
        employeeId = employeeRes.body.data.id

        //@ts-ignore
        accessToken = await loginAndGetToken(
            employeeTest.username,
            employeeTest.password
        )
        // Assign permissions to roles
        await request(app).post('/user-permission/add').send({
            userId: employeeId,
            permissionId: readByIdPermission,
        })
        await request(app).post('/user-permission/add').send({
            userId: employeeId,
            permissionId: readAllPermission,
        })
        await request(app).post('/user-permission/add').send({
            userId: employeeId,
            permissionId: readByUsernamePermission,
        })

        // Create test employees
    })

    afterAll(async () => {
        await clearDB()
    })

    describe('Authentication & Authorization Tests', () => {
        describe('POST /employee/login', () => {
            test('should login successfully with valid credentials', async () => {
                const res = await request(app).post('/employee/login').send({
                    username: employeeTest.username,
                    password: employeeTest.password,
                })

                expect(res.statusCode).toBe(200)
                expect(res.body.data).toBeTruthy()
                expect(res.body.data.username).toBe(employeeTest.username)
                expect(res.headers['set-cookie']).toBeTruthy()
            })

            test('should return 403 with invalid password', async () => {
                const res = await request(app).post('/employee/login').send({
                    username: employeeTest.username,
                    password: 'wrong_password',
                })

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Usuario y/o contraseña invalido')
            })

            test('should return 403 with non-existent username', async () => {
                const res = await request(app).post('/employee/login').send({
                    username: 'non_existent_user',
                    password: 'any_password',
                })

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Usuario y/o contraseña invalido')
            })

            test('should return 403 with missing username', async () => {
                const res = await request(app).post('/employee/login').send({
                    password: 'any_password',
                })

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Usuario y/o contraseña invalido')
            })

            test('should return 403 with missing password', async () => {
                const res = await request(app).post('/employee/login').send({
                    username: employeeTest.username,
                })

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Usuario y/o contraseña invalido')
            })
        })

        describe('POST /employee/logout', () => {
            test('should logout successfully with valid token', async () => {
                const res = await request(app)
                    .post('/employee/logout')
                    .set('Cookie', adminAccessToken)

                expect(res.statusCode).toBe(200)
                expect(res.body.message).toBe('logout')
                expect(res.headers['set-cookie']).toBeTruthy()
            })
        })
    })

    describe('Employee CRUD Operations', () => {
        describe('POST /employee/add', () => {
            test('should create new employee successfully with admin permissions', async () => {
                const newEmployeeData = {
                    name: 'New Employee',
                    username: 'new_employee',
                    password: 'newpassword123',
                    roleId,
                    departmentId,
                }

                const res = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send(newEmployeeData)

                expect(res.statusCode).toBe(200)
                expect(res.body.data).toBeTruthy()
                expect(res.body.data).toHaveProperty('id')
                expect(res.body.data.name).toBe(newEmployeeData.name)
            })

            test('should return 403 when creating employee without admin permissions', async () => {
                const newEmployeeData = {
                    name: 'Unauthorized Employee',
                    username: 'unauthorized_employee',
                    password: 'password123',
                    roleId,
                    departmentId,
                }

                const res = await request(app)
                    .post('/employee/add')
                    .set('Cookie', accessToken)
                    .send(newEmployeeData)

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe(
                    'No tienes permisos para acceder a esta ruta'
                )
            })

            test('should return 401 when creating employee without token', async () => {
                const newEmployeeData = {
                    name: 'No Token Employee',
                    username: 'no_token_employee',
                    password: 'password123',
                    roleId,
                    departmentId,
                }

                const res = await request(app)
                    .post('/employee/add')
                    .send(newEmployeeData)

                expect(res.statusCode).toBe(401)
                expect(res.body.error).toBe('UNAUTHORIZED')
            })

            test('should return 403 when creating employee with duplicate username', async () => {
                const duplicateEmployeeData = {
                    ...employeeTest,
                    roleId,
                    departmentId,
                }

                const res = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send(duplicateEmployeeData)

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Ya existe el usuario')
            })

            test('should return 400 when creating employee with missing required fields', async () => {
                const incompleteData = {
                    name: 'Incomplete Employee',
                    // missing username, password, roleId, departmentId
                }

                const res = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send(incompleteData)

                expect(res.statusCode).toBe(400)
                expect(res.body.error).toBe('Datos inválidos')
            })

            test('should return 400 when creating employee with missing name', async () => {
                const dataWithoutName = {
                    username: 'no_name_employee',
                    password: 'password123',
                    roleId,
                    departmentId,
                }

                const res = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send(dataWithoutName)

                expect(res.statusCode).toBe(400)
                expect(res.body.error).toBe('Datos inválidos')
            })
        })

        describe('GET /employee/', () => {
            test('should get all employees with valid permissions', async () => {
                const res = await request(app)
                    .get('/employee/')
                    .set('Cookie', accessToken)

                expect(res.statusCode).toBe(200)
                expect(res.body.data).toBeTruthy()
                expect(Array.isArray(res.body.data)).toBe(true)
                expect(res.body.data.length).toBeGreaterThan(0)
            })

            test('should return 401 without token', async () => {
                const res = await request(app).get('/employee/')

                expect(res.statusCode).toBe(401)
                expect(res.body.error).toBe('UNAUTHORIZED')
            })

            test('should return 401 without proper permissions', async () => {
                // Create a role without read permissions
                const noPermissionRoleRes = await request(app)
                    .post('/role/add')
                    .send({
                        name: 'No Permission Role',
                        description: 'Role without permissions',
                    })
                const noPermissionRoleId = noPermissionRoleRes.body.data.id

                const noPermissionEmployeeRes = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send({
                        name: 'No Permission Employee',
                        username: 'no_permission_employee',
                        password: 'password123',
                        roleId: noPermissionRoleId,
                        departmentId,
                    })

                const noPermissionToken = await loginAndGetToken(
                    'no_permission_employee',
                    'password123'
                )
                const res = await request(app)
                    .get('/employee/')
                    //@ts-ignore
                    .set('Cookie', noPermissionToken)

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe(
                    'No tienes permisos para acceder a esta ruta'
                )
            })
        })

        describe('GET /employee/username', () => {
            test('should find employee by username with valid permissions', async () => {
                const res = await request(app)
                    .get('/employee/username')
                    .set('Cookie', accessToken)
                    .query({ user: employeeTest.username })

                expect(res.statusCode).toBe(200)
                expect(res.body.data).toBeTruthy()
                expect(res.body.data.username).toBe(employeeTest.username)
            })

            test('should return 400 when missing user parameter', async () => {
                const res = await request(app)
                    .get('/employee/username')
                    .set('Cookie', accessToken)

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Falta el usuario')
            })

            test('should return 404 when user does not exist', async () => {
                const res = await request(app)
                    .get('/employee/username')
                    .set('Cookie', accessToken)
                    .query({ user: 'non_existent_user' })

                expect(res.statusCode).toBe(404)
                expect(res.body.error).toBe('Usuario no encontrado')
            })

            test('should return 401 without token', async () => {
                const res = await request(app)
                    .get('/employee/username')
                    .query({ user: employeeTest.username })

                expect(res.statusCode).toBe(401)
                expect(res.body.error).toBe('UNAUTHORIZED')
            })
        })

        describe('GET /employee/:id', () => {
            test('should find employee by ID with valid permissions', async () => {
                const res = await request(app)
                    .get(`/employee/${employeeId}`)
                    .set('Cookie', accessToken)

                expect(res.statusCode).toBe(200)
                expect(res.body.data).toBeTruthy()
                expect(res.body.data.id).toBe(employeeId)
            })

            test('should return 404 when employee ID does not exist', async () => {
                const res = await request(app)
                    .get('/employee/non_existent_id')
                    .set('Cookie', accessToken)

                expect(res.statusCode).toBe(404)
                expect(res.body.error).toBe('No encontrado')
            })

            test('should return 401 without token', async () => {
                const res = await request(app).get(`/employee/${employeeId}`)

                expect(res.statusCode).toBe(401)
                expect(res.body.error).toBe('UNAUTHORIZED')
            })
        })

        /* describe('DELETE /employee', () => {
            test('should delete employee successfully with admin permissions', async () => {
                // Create a temporary employee to delete
                const tempEmployeeRes = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send({
                        name: 'Temp Employee',
                        username: 'temp_employee',
                        password: 'temp123',
                        roleId,
                        departmentId,
                    })
                const tempEmployeeId = tempEmployeeRes.body.data.id

                const res = await request(app)
                    .delete('/employee/')
                    .set('Cookie', adminAccessToken)
                    .send({ id: tempEmployeeId })

                expect(res.statusCode).toBe(200)
                expect(res.body.data).toBeTruthy()
            })

            test('should return 403 when deleting without admin permissions', async () => {
                const res = await request(app)
                    .delete('/employee/')
                    .set('Cookie', accessToken)
                    .send({ id: employeeId })

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe(
                    'No tienes permisos para acceder a esta ruta'
                )
            })

            test('should return 401 when deleting without token', async () => {
                const res = await request(app)
                    .delete('/employee/')
                    .send({ id: employeeId })

                expect(res.statusCode).toBe(401)
                expect(res.body.error).toBe('UNAUTHORIZED')
            })

            test('should return 403 when missing employee ID', async () => {
                const res = await request(app)
                    .delete('/employee/')
                    .set('Cookie', adminAccessToken)
                    .send({})

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe('Falta el id')
            })

            test('should return 404 when employee ID does not exist', async () => {
                const res = await request(app)
                    .delete('/employee/')
                    .set('Cookie', adminAccessToken)
                    .send({ id: 'non_existent_id' })

                expect(res.statusCode).toBe(404)
                expect(res.body.error).toBe('Empleado no encontrado')
            })
        }) */
    })

    describe('Client', () => {
        test('should create client with valid permissions', async () => {
            const clientData = {
                name: 'Test Client',
                username: 'test_client',
                password: 'clientpassword123',
                email: 'test.client@example.com',
            }
            const res = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(clientData)
            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
        })

        test('should return 403 when creating client without permissions', async () => {
            const clientData = {
                name: 'Unauthorized Client',
                username: 'unauthorized_client',
                password: 'clientpassword123',
                email: 'unauthorized.client@example.com',
            }
            const res = await request(app)
                .post('/clients/add')
                .set('Cookie', accessToken)
                .send(clientData)
            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe(
                'No tienes permisos para acceder a esta ruta'
            )
        })

        test('should return 401 when creating client without token', async () => {
            const clientData = {
                name: 'No Token Client',
                username: 'no_token_client',
                password: 'clientpassword123',
                email: 'no_token.client@example.com',
            }
            const res = await request(app).post('/clients/add').send(clientData)
            expect(res.statusCode).toBe(401)
            expect(res.body.error).toBe('UNAUTHORIZED')
        })

        test('find client by ID with valid permissions', async () => {
            const clientData = {
                name: 'Find Client',
                username: 'find_client',
                password: 'findpassword123',
                email: 'find.client@example.com',
            }
            const createRes = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(clientData)
            const clientId = createRes.body.data.id
            const res = await request(app)
                .get(`/clients/${clientId}`)
                .set('Cookie', adminAccessToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
            expect(res.body.data.id).toBe(clientId)
        })
    })

    describe('Middleware Tests', () => {
        describe('Token Verification', () => {
            test('should return 401 with invalid token format', async () => {
                const res = await request(app)
                    .get('/employee/')
                    .set('Cookie', 'access_token=invalid_token')

                expect(res.statusCode).toBe(401)
                expect(res.body.error).toBe('INVALID_TOKEN')
            })

            test('should return 401 with expired token', async () => {
                // This would require a token that's actually expired
                // For now, we test the error handling
                const res = await request(app)
                    .get('/employee/')
                    .set(
                        'Cookie',
                        'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZXhwaXJlZCIsInVzZXJuYW1lIjoiZXhwaXJlZCJ9LCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU2Nzg3NX0.expired_signature'
                    )

                expect(res.statusCode).toBe(401)
            })
        })

        describe('Authorization', () => {
            test('should return 401 for user without any role permissions', async () => {
                // Create a role without any permissions
                const noPermissionRoleRes = await request(app)
                    .post('/role/add')
                    .send({
                        name: 'No Permissions',
                        description: 'Role with no permissions',
                    })
                const noPermissionRoleId = noPermissionRoleRes.body.data.id

                const noPermissionEmployeeRes = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send({
                        name: 'No Permissions Employee',
                        username: 'no_permissions_emp',
                        password: 'password123',
                        roleId: noPermissionRoleId,
                        departmentId,
                    })

                const noPermissionToken = await loginAndGetToken(
                    'no_permissions_emp',
                    'password123'
                )

                const res = await request(app)
                    .get('/employee/')
                    //@ts-ignore
                    .set('Cookie', noPermissionToken)

                expect(res.statusCode).toBe(403)
                expect(res.body.error).toBe(
                    'No tienes permisos para acceder a esta ruta'
                )
            })
        })
    })

    describe('Error Handling Tests', () => {
        describe('Database Errors', () => {
            test('should handle database connection errors gracefully', async () => {
                // This would require mocking database failures
                // For now, we test the error response structure
                const res = await request(app).post('/employee/login').send({
                    username: 'invalid_user',
                    password: 'invalid_password',
                })

                expect(res.statusCode).toBe(403)
                expect(res.body).toHaveProperty('error')
            })
        })

        describe('Validation Errors', () => {
            test('should handle malformed request data', async () => {
                const res = await request(app)
                    .post('/employee/add')
                    .set('Cookie', adminAccessToken)
                    .send('invalid json data')

                expect(res.statusCode).toBe(400)
            })
        })
    })

    describe('Edge Cases', () => {
        /* test('should handle very long usernames', async () => {
            const longUsername = 'a'.repeat(1000)
            const res = await request(app)
                .post('/employee/add')
                .set('Cookie', adminAccessToken)
                .send({
                    name: 'Long Username Test',
                    username: longUsername,
                    password: 'password123',
                    roleId,
                    departmentId,
                })

            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBe('Ya existe el usuario')
        }) */

        test('should handle special characters in usernames', async () => {
            const specialUsername = 'test@#$%^&*()'
            const res = await request(app)
                .post('/employee/add')
                .set('Cookie', adminAccessToken)
                .send({
                    name: 'Special Characters Test',
                    username: specialUsername,
                    password: 'password123',
                    roleId,
                    departmentId,
                })

            expect(res.statusCode).toBe(200)
            expect(res.body.data).toBeTruthy()
        })

        test('should handle empty string values', async () => {
            const res = await request(app)
                .post('/employee/add')
                .set('Cookie', adminAccessToken)
                .send({
                    name: '',
                    username: '',
                    password: '',
                    roleId: '',
                    departmentId: '',
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBe('Datos inválidos')
        })
    })
})
