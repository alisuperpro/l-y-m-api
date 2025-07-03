import request from 'supertest'
import app from '../../api/index'
import { db } from '../db/db'

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

const loginAndGetTokenClient = async (username: string, password: string) => {
    const loginRes = await request(app).post('/clients/login').send({
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
    await db.execute({ sql: 'DELETE FROM clients' })
    await db.execute({ sql: 'DELETE FROM role_permission' })
    await db.execute({ sql: 'DELETE FROM user_permission' })
    await db.execute({ sql: 'DELETE FROM route_permission_map' })
    await db.execute({ sql: 'DELETE FROM permission' })
    await db.execute({ sql: 'DELETE FROM employee' })
    await db.execute({ sql: 'DELETE FROM role' })
    await db.execute({ sql: 'DELETE FROM departments' })
    await db.execute({ sql: 'DELETE FROM actions' })
    await db.execute({ sql: 'DELETE FROM resources' })
}

describe('Clients API', () => {
    let departmentId: string
    let roleId: string
    let adminRoleId: string
    let resourcesId: string
    let employeeId: string
    let adminEmployeeId: string
    let accessToken: string
    let adminAccessToken: string

    // Permission IDs for different actions
    let readAllClientPermission: string
    let readByClientIdPermission: string
    let readByClientUsernamePermission: string
    let updateClientPasswordPermission: string
    let createClientPermission: string
    let readClientByIdPermission: string
    const validClient = {
        name: 'John Doe',
        username: 'john.doe',
        password: 'password123',
        email: 'john.doe@example.com',
    }

    const invalidClient = {
        name: 'J',
        username: '',
        password: '',
        email: 'invalid-email',
    }

    const adminEmployeeTest = {
        name: 'Admin Employee',
        username: 'admin_employee',
        password: 'admin123456',
        roleId: 'role_2',
        departmentId: 'dep_1',
    }

    beforeAll(async () => {
        // Clean up any existing test data
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
            { name: 'can_create_client' },
            { name: 'can_read_clients_by_id' },
            { name: 'can_read_all_clients' },
            { name: 'can_read_clients_by_username' },
            { name: 'can_update_client_password' },
            { name: 'can_read_client_by_id' },
        ]
        const actionIds = await createActions(actions)
        const permissionResults = await createPermissions(
            resourcesId,
            actionIds
        )

        createClientPermission = permissionResults[0].body.data.id
        readClientByIdPermission = permissionResults[1].body.data.id
        readAllClientPermission = permissionResults[2].body.data.id
        readByClientUsernamePermission = permissionResults[3].body.data.id
        updateClientPasswordPermission = permissionResults[4].body.data.id
        readByClientIdPermission = permissionResults[5].body.data.id
        // Mapear permisos a rutas de forma eficiente
        await mapRoutePermissions([
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
            {
                routePath: '/clients/',
                permissionId: readAllClientPermission,
                httpMethod: 'GET',
            },
            {
                routePath: '/clients/username',
                permissionId: readByClientUsernamePermission,
                httpMethod: 'GET',
            },
            {
                routePath: '/clients/password/:id',
                permissionId: updateClientPasswordPermission,
                httpMethod: 'PUT',
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
            permissionId: createClientPermission,
        })

        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readClientByIdPermission,
        })

        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readAllClientPermission,
        })

        await request(app).post('/user-permission/add').send({
            userId: adminEmployeeId,
            permissionId: readByClientUsernamePermission,
        })

        //@ts-ignore
        adminAccessToken = await loginAndGetToken(
            adminEmployeeTest.username,
            adminEmployeeTest.password
        )
    })

    afterAll(async () => {
        // Final cleanup
        await clearDB()
    })

    describe('POST /clients/add', () => {
        it('should create a new client with valid data', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(validClient)

            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.name).toBe(validClient.name)
            expect(response.body.data.username).toBe(validClient.username)
            expect(response.body.data.email).toBe(validClient.email)
            expect(response.body.data.id).toBeDefined()
            expect(response.body.data.created_at).toBeDefined()
            expect(response.body.data.password).not.toBe(validClient.password) // Should be hashed
        })

        it('should not create a client with missing name', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    name: '',
                })

            expect(response.body.error).toBe('El nombre es requerido')
            expect(response.status).toBe(400)
        })

        it('should not create a client with missing username', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    username: '',
                })

            expect(response.body.error).toBe('El usuario es requerido')
            expect(response.status).toBe(400)
        })

        it('should not create a client with missing password', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    password: '',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('La contraseña es requerida')
        })

        it('should not create a client with missing email', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    email: '',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('el correo es requerida')
        })

        it('should not create a client with duplicate username', async () => {
            // Create first client
            await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(validClient)

            // Try to create second client with same username
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(validClient)

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('El usuario ya existe')
        })
        it('should not create a client with duplicate email', async () => {
            // Create first client
            await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(validClient)

            // Try to create second client with same username
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    username: 'john.doe123',
                })

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('El email ya existe')
        })

        it('should not create a client with name too short', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    name: 'J',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('El nombre es requerido')
        })

        it('should not create a client with username too short', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    username: 'j',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('El usuario es requerido')
        })

        it('should not create a client with password too short', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    password: 'p',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('La contraseña es requerida')
        })

        it('should not create a client with email too short', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    email: 'e',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('el correo es requerida')
        })
    })

    describe('GET /clients', () => {
        it('should return all clients when clients exist', async () => {
            // Create a test client
            await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(validClient)

            const response = await request(app)
                .get('/clients')
                .set('Cookie', adminAccessToken)

            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
            expect(Array.isArray(response.body.data)).toBe(true)
            expect(response.body.data.length).toBeGreaterThan(0)
            expect(response.body.data[0].name).toBe(validClient.name)
            expect(response.body.data[0].username).toBe(validClient.username)
        })

        /* it('should return 404 when no clients exist', async () => {
            const response = await request(app)
                .get('/clients')
                .set('Cookie', adminAccessToken)

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('No se encontraron clientes')
        }) */
    })

    describe('GET /clients/:id', () => {
        it('should return client by valid id', async () => {
            // Create a test client
            const createResponse = await request(app)
                .get('/clients/username')
                .set('Cookie', adminAccessToken)
                .send({
                    username: validClient.username,
                })

            const clientId = createResponse.body.data.id

            const response = await request(app)
                .get(`/clients/${clientId}`)
                .set('Cookie', adminAccessToken)

            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.id).toBe(clientId)
            expect(response.body.data.name).toBe(validClient.name)
            expect(response.body.data.username).toBe(validClient.username)
            expect(response.body.data.email).toBe(validClient.email)
        })

        it('should return 400 for non-existent client id', async () => {
            const response = await request(app)
                .get('/clients/non-existent-id')
                .set('Cookie', adminAccessToken)

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('El id debe ser un UUID válido')
        })

        it('should return 400 for invalid uuid format', async () => {
            const response = await request(app)
                .get('/clients/123')
                .set('Cookie', adminAccessToken)

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('El id debe ser un UUID válido')
        })
    })

    describe('GET /clients/username', () => {
        it('should return client by valid username', async () => {
            // Create a test client
            await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(validClient)

            const response = await request(app)
                .get('/clients/username')
                .set('Cookie', adminAccessToken)
                .send({
                    username: validClient.username,
                })

            expect(response.status).toBe(200)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.name).toBe(validClient.name)
            expect(response.body.data.username).toBe(validClient.username)
            expect(response.body.data.email).toBe(validClient.email)
        })

        it('should return 404 for non-existent username', async () => {
            const response = await request(app)
                .get('/clients/username')
                .set('Cookie', adminAccessToken)
                .send({
                    username: 'non-existent-username',
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Usuario no encontrado')
        })

        it('should return 404 for empty username', async () => {
            const response = await request(app)
                .get('/clients/username')
                .set('Cookie', adminAccessToken)
                .send({
                    username: '',
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('El usuario es requerido')
        })
    })

    describe('Edge cases and error handling', () => {
        it('should handle multiple clients with different usernames', async () => {
            const client1 = {
                ...validClient,
                username: 'user1',
                email: 'example@gmail.com',
            }
            const client2 = {
                ...validClient,
                username: 'user2',
                email: 'user2@example.com',
            }

            // Create first client
            const response1 = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(client1)

            expect(response1.status).toBe(200)

            // Create second client
            const response2 = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(client2)

            expect(response2.status).toBe(200)

            // Verify both clients exist
            const getAllResponse = await request(app)
                .get('/clients')
                .set('Cookie', adminAccessToken)

            expect(getAllResponse.status).toBe(200)
            expect(getAllResponse.body.data.length).toBe(3)
        })

        it('should handle special characters in client data', async () => {
            const specialClient = {
                name: "José María O'Connor",
                username: 'jose.maria',
                password: 'p@ssw0rd!',
                email: 'jose.maria@example.com',
            }

            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send(specialClient)

            expect(response.status).toBe(200)
            expect(response.body.data.name).toBe(specialClient.name)
            expect(response.body.data.username).toBe(specialClient.username)
            expect(response.body.data.email).toBe(specialClient.email)
        })
    })

    describe('Security and Permissions', () => {
        it('should return 401 when creating client without token', async () => {
            const response = await request(app)
                .post('/clients/add')
                .send(validClient)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('UNAUTHORIZED')
        })

        it('should return 401 when getting clients without token', async () => {
            const response = await request(app).get('/clients')
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('UNAUTHORIZED')
        })

        it('should return 401 when using invalid token', async () => {
            const response = await request(app)
                .get('/clients')
                .set('Cookie', 'invalid_token')
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('UNAUTHORIZED')
        })

        it('should return 403 when user does not have permission to add client', async () => {
            // Crear empleado sin permisos de crear cliente
            const employeeRes = await request(app)
                .post('/employee/add')
                .set('Cookie', adminAccessToken)
                .send({
                    name: 'Empleado sin permiso',
                    username: 'empleado_no_permiso',
                    password: 'empleado123',
                    roleId,
                    departmentId,
                })
            const token = await loginAndGetToken(
                'empleado_no_permiso',
                'empleado123'
            )
            const response = await request(app)
                .post('/clients/add')
                //@ts-ignore
                .set('Cookie', token)
                .send(validClient)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('UNAUTHORIZED')
        })
    })

    describe('Validation edge cases', () => {
        it('should not create a client with invalid email format', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    email: 'not-an-email',
                })
            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                'El correo debe ser un email válido'
            )
        })
        it('should not create a client with password too short', async () => {
            const response = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    password: '12',
                })
            expect(response.status).toBe(400)
            expect(response.body.error).toMatch(/contraseña.*requerida|mínimo/i)
        })
    })

    describe('PUT /clients/:id', () => {
        it('should update client data with valid token and data', async () => {
            // Crear cliente
            const createRes = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    username: 'updateuser',
                    email: 'updateuser@example.com',
                })
            const clientId = createRes.body.data.id

            const token = await loginAndGetTokenClient(
                'updateuser',
                'password123'
            )

            await request(app).post('/user-permission/add').send({
                userId: clientId,
                permissionId: updateClientPasswordPermission,
            })
            const response = await request(app)
                .put(`/clients/password/${clientId}`)
                //@ts-ignore
                .set('Cookie', token)
                .send({ password: 'newpassword123' })
            expect(response.status).toBe(200)
            expect(response.body.data).toBeTruthy()
        })
        it('should not update client with invalid id', async () => {
            const token = await loginAndGetTokenClient(
                'updateuser',
                'newpassword123'
            )
            const response = await request(app)
                .put('/clients/password/invalid-id')
                //@ts-ignore
                .set('Cookie', token)
                .send({ password: '123456789' })
            expect(response.status).toBe(400)
        })
        it('should not update client without token', async () => {
            const response = await request(app)
                .put('/clients/password/invalid-id')
                .send({ password: '123456789' })
            expect(response.status).toBe(401)
        })
    })

    /* describe('DELETE /clients/:id', () => {
        it('should delete client with valid token and id', async () => {
            // Crear cliente
            const createRes = await request(app)
                .post('/clients/add')
                .set('Cookie', adminAccessToken)
                .send({
                    ...validClient,
                    username: 'deleteuser',
                    email: 'deleteuser@example.com',
                })
            const clientId = createRes.body.data.id
            const response = await request(app)
                .delete(`/clients/${clientId}`)
                .set('Cookie', adminAccessToken)
            expect(response.status).toBe(200)
        })
        it('should not delete client with invalid id', async () => {
            const response = await request(app)
                .delete('/clients/invalid-id')
                .set('Cookie', adminAccessToken)
            expect(response.status).toBe(400)
        })
        it('should not delete client without token', async () => {
            const response = await request(app)
                .delete('/clients/invalid-id')
            expect(response.status).toBe(401)
        })
        it('should not delete client with insufficient permissions', async () => {
            // Crear empleado sin permisos de borrar cliente
            const employeeRes = await request(app)
                .post('/employee/add')
                .set('Cookie', adminAccessToken)
                .send({
                    name: 'Empleado sin permiso borrar',
                    username: 'empleado_no_permiso_borrar',
                    password: 'empleado123',
                    roleId,
                    departmentId,
                })
            const token = await loginAndGetToken('empleado_no_permiso_borrar', 'empleado123')
            const response = await request(app)
                .delete('/clients/invalid-id')
                //@ts-ignore
                .set('Cookie', token)
            expect(response.status).toBe(403)
        })
    }) */
})
