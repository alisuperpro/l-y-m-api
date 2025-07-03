import request from 'supertest'
import {
    clearDB,
    createActions,
    createPermission,
    loginAndGetToken,
    setupRoutePermission,
} from './helpers'
import app from '../../api'

describe('Client Documents API Integration', () => {
    let departmentId: string
    let roleId: string
    let resourcesId: string
    let employeeId: string
    let accessToken: string | null
    let createClientDocumentPermissionId: string
    let readClientDocumentPermissionId: string
    let readByIdClientDocumentPermissionId: string
    let clientId: String
    let clientCompanyId: String
    let organizationId: String

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
            { name: 'can_create_client_documents' },
            { name: 'can_read_client_documents' },
            { name: 'can_read_client_documents_by_id' },
        ]
        const [createActionId, readAllActionId, readByIdActionId] =
            await createActions(actions)
        const createPermRes = await createPermission({
            resourcesId,
            actionsId: createActionId,
        })
        createClientDocumentPermissionId = createPermRes.body.data.id
        const readPermRes = await createPermission({
            resourcesId,
            actionsId: readAllActionId,
        })
        readClientDocumentPermissionId = readPermRes.body.data.id
        const readByIdPermRes = await createPermission({
            resourcesId,
            actionsId: readByIdActionId,
        })
        readByIdClientDocumentPermissionId = readByIdPermRes.body.data.id
        // Mapear permisos a rutas
        await setupRoutePermission(
            '/client-documents/add',
            createClientDocumentPermissionId,
            'POST'
        )
        await setupRoutePermission(
            '/client-documents/client/:clientId',
            readClientDocumentPermissionId,
            'GET'
        )
        await setupRoutePermission(
            '/client-documents/:id',
            readByIdClientDocumentPermissionId,
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

        const clientCompanyRes = await request(app)
            .post('/client-company/add-test')
            .set('Cookie', accessToken as string)
            .send({
                name: 'Test Client Company',
                clientId: clientId,
            })

        clientCompanyId = clientCompanyRes.body.data.id

        const organizationRes = await request(app)
            .post('/organizations/add-test')
            .set('Cookie', accessToken as string)
            .send({
                name: 'Test Organization',
                description: 'Test organization description',
            })

        organizationId = organizationRes.body.data.id

        if (!accessToken)
            throw new Error(
                'No se pudo obtener el token de acceso para org_employee'
            )
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: createClientDocumentPermissionId,
        })
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: readClientDocumentPermissionId,
        })
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: readByIdClientDocumentPermissionId,
        })
    })

    afterAll(async () => {
        await clearDB()
    })

    describe('POST /client-documents/add', () => {
        it('should create a client document', async () => {
            const res = await request(app)
                .post('/client-documents/add')
                .set('Cookie', accessToken as string)
                .send({
                    name: 'Test Document',
                    ext: 'pdf',
                    url: 'http://example.com/test.pdf',
                    createdBy: employeeId,
                    clientId: clientId,
                    description: 'Test document description',
                    clientCompanyId: clientCompanyId,
                    organizationId: organizationId,
                })
            expect(res.status).toBe(200)
            expect(res.body.data).toHaveProperty('id')
            expect(res.body.data.id).toBeDefined()
            expect(res.body.data.name).toBe('Test Document')
        })

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/client-documents/add')
                .set('Cookie', accessToken as string)
                .send({
                    name: '',
                    ext: 'pdf',
                    url: 'http://example.com/test.pdf',
                    createdBy: employeeId,
                    clientId: clientId,
                    description: 'Test document description',
                    clientCompanyId: clientCompanyId,
                    organizationId: organizationId,
                })
            expect(res.status).toBe(400)
            expect(res.body.error).toBeDefined()
        })

        it('should return 401 for unauthorized access', async () => {
            const res = await request(app).post('/client-documents/add').send({
                name: 'Unauthorized Document',
                ext: 'pdf',
                url: 'http://example.com/unauthorized.pdf',
                createdBy: employeeId,
                clientId: clientId,
                description: 'Unauthorized document description',
                clientCompanyId: clientCompanyId,
                organizationId: organizationId,
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBeDefined()
        })

        describe('GET /client-documents/:id', () => {
            it('should return a client document by ID', async () => {
                const res = await request(app)
                    .get(`/client-documents/client/${clientId}`)
                    .set('Cookie', accessToken as string)
                expect(res.status).toBe(200)
                expect(res.body.data[0]).toHaveProperty('id')
            })

            it('should return 400 for invalid id', async () => {
                const res = await request(app)
                    .get('/client-documents/client/non-existing-id')
                    .set('Cookie', accessToken as string)
                expect(res.status).toBe(400)
                expect(res.body.error).toBeDefined()
            })
        })
    })
})
