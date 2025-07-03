import request from 'supertest'
import {
    clearDB,
    createActions,
    createPermission,
    loginAndGetToken,
    setupRoutePermission,
} from './helpers'
import app from '../../api'

describe('Client Company API Integration', () => {
    let departmentId: string
    let roleId: string
    let resourcesId: string
    let employeeId: string
    let accessToken: string | null
    let createClientCompanyPermissionId: string
    let readClientCompanyPermissionId: string
    let readByIdClientCompanyPermissionId: string
    let clientId: String

    beforeAll(async () => {
        await clearDB()
        // Crear departamento, rol y recurso
        const departmentRes = await request(app)
            .post('/departments/add')
            .send({ name: 'Recursos Humanos' })
        departmentId = departmentRes.body.data.id

        const roleRes = await request(app)
            .post('/role/add')
            .send({ name: 'OrgRole', description: 'Role for org test' })
        roleId = roleRes.body.data.id

        const resourcesRes = await request(app)
            .post('/resources/add')
            .send({ name: 'test' })
        resourcesId = resourcesRes.body.data.id
        // Crear acciones y permisos
        const actions = [
            { name: 'can_create_client_company' },
            { name: 'can_read_client_company' },
            { name: 'can_read_client_company_by_id' },
        ]
        const [createActionId, readAllActionId, readByIdActionId] =
            await createActions(actions)
        const createPermRes = await createPermission({
            resourcesId,
            actionsId: createActionId,
        })
        createClientCompanyPermissionId = createPermRes.body.data.id
        const readPermRes = await createPermission({
            resourcesId,
            actionsId: readAllActionId,
        })
        readClientCompanyPermissionId = readPermRes.body.data.id
        const readByIdPermRes = await createPermission({
            resourcesId,
            actionsId: readByIdActionId,
        })
        readByIdClientCompanyPermissionId = readByIdPermRes.body.data.id
        // Mapear permisos a rutas
        await setupRoutePermission(
            '/client-company/add',
            createClientCompanyPermissionId,
            'POST'
        )
        await setupRoutePermission(
            '/client-company/client/:clientId',
            readClientCompanyPermissionId,
            'GET'
        )
        await setupRoutePermission(
            '/client-company/:id',
            readByIdClientCompanyPermissionId,
            'GET'
        )
        // Crear empleado y asignar permisos
        const employeeRes = await request(app)
            .post('/employee/add-admin')
            .send({
                name: 'Org Employee',
                username: 'org_employee',
                password: 'orgpass',
                roleId,
                departmentId,
            })
        employeeId = employeeRes.body.data.id
        //@ts-ignore
        accessToken = await loginAndGetToken('org_employee', 'orgpass')

        const clientRes = await request(app)
            .post('/clients/add-test')
            .set('Cookie', accessToken as string)
            .send({
                name: 'Test Client',
                username: 'test_client',
                password: 'testpass',
                email: 'test_client@example.com',
            })

        clientId = clientRes.body.data.id

        if (!accessToken)
            throw new Error(
                'No se pudo obtener el token de acceso para org_employee'
            )
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: createClientCompanyPermissionId,
        })
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: readClientCompanyPermissionId,
        })
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: readByIdClientCompanyPermissionId,
        })
    })

    afterAll(async () => {
        await clearDB()
    })

    describe('POST /client-company/add', () => {
        it('should create a client company with permission', async () => {
            const res = await request(app)
                .post('/client-company/add')
                .set('Cookie', accessToken as string)
                .send({
                    name: 'Test Client Company',
                    clientId,
                })
            expect(res.statusCode).toBe(200)
            expect(res.body.data).toHaveProperty('id')
            expect(res.body.data.name).toBe('Test Client Company')
            expect(res.body.data.client_id).toBe(clientId)
        })

        it('should return 400 if name is invalid', async () => {
            const res = await request(app)
                .post('/client-company/add')
                .set('Cookie', accessToken as string)
                .send({
                    name: '',
                    clientId,
                })
            expect(res.statusCode).toBe(400)
        })
        it('should return 401 if user does not have permission', async () => {
            const res = await request(app).post('/client-company/add').send({
                name: 'Unauthorized Client Company',
                clientId,
            })
            expect(res.statusCode).toBe(401)
            expect(res.body.error).toBeDefined()
        })
    })
    describe('GET /client-company/client/:clientId', () => {
        it('should return client companies by clientId with permission', async () => {
            const res = await request(app)
                .get(`/client-company/client/${clientId}`)
                .set('Cookie', accessToken as string)
            expect(res.statusCode).toBe(200)
            expect(Array.isArray(res.body.result)).toBe(true)
            expect(res.body.result.length).toBeGreaterThan(0)
            expect(res.body.result[0]).toHaveProperty('id')
            expect(res.body.result[0]).toHaveProperty('name')
            expect(res.body.result[0]).toHaveProperty('client_id')
        })

        it('should return 400 if clientId is invalid', async () => {
            const res = await request(app)
                .get('/client-company/client/invalid')
                .set('Cookie', accessToken as string)
            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        })
        it('should return 401 if user does not have permission', async () => {
            const res = await request(app).get(
                `/client-company/client/${clientId}`
            )
            expect(res.statusCode).toBe(401)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('GET /client-company/:id', () => {
        it('should return client company by id with permission', async () => {
            const all = await request(app)
                .get(`/client-company/client/${clientId}`)
                .set('Cookie', accessToken as string)
            const companyId = all.body.result[0].id
            console.log({ companyId })
            const res = await request(app)
                .get(`/client-company/${companyId}`)
                .set('Cookie', accessToken as string)
            expect(res.statusCode).toBe(200)
            expect(res.body.data[0]).toHaveProperty('id', companyId)
            expect(res.body.data[0].name).toBeDefined()
            expect(res.body.data[0].client_id).toBe(clientId)
        })

        it('should return 400 for invalid id', async () => {
            const res = await request(app)
                .get('/client-company/invalid')
                .set('Cookie', accessToken as string)
            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        })
        it('should return 401 if user does not have permission', async () => {
            const all = await request(app)
                .get(`/client-company/client/${clientId}`)
                .set('Cookie', accessToken as string)
            const companyId = all.body.result[0].id
            const res = await request(app).get(`/client-company/${companyId}`)
            expect(res.statusCode).toBe(401)
            expect(res.body.error).toBeDefined()
        })
    })
})
/* describe('GET /client-company', () => {
        it('should return all client companies with permission', async () => {
            const res = await request(app)
                .get('/client-company/')
                .set('Cookie', accessToken as string)

            console.log(res.body.data)

            expect(res.statusCode).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBeGreaterThan(0)
            expect(res.body.data[0]).toHaveProperty('id')
            expect(res.body.data[0]).toHaveProperty('name')
            expect(res.body.data[0]).toHaveProperty('client_id')
        })

        it('should return 403 if user does not have permission', async () => {
            const res = await request(app)
                .get('/client-company/')
                .set('Cookie', accessToken as string)
            expect(res.statusCode).toBe(403)
            expect(res.body.error).toBeDefined()
        })

        it('should return 500 if there is an error in the database', async () => {
            // Simulate a database error by clearing the client_company table
            const res = await request(app)
                .post('/client-company/add')
                .set('Cookie', accessToken as string)
                .send({
                    name: 'Test Client Company',
                    clientId,
                })
            expect(res.statusCode).toBe(500)
            expect(res.body.error).toBeDefined()
        })
    }) */
