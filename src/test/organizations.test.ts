import request from 'supertest'
import app from '../../api/index'
import {
    clearDB,
    createActions,
    createPermission,
    loginAndGetToken,
    setupRoutePermission,
} from './helpers'

// Utilidades
const orgResourceName = 'organizations'

describe('Organizations API Integration', () => {
    let departmentId: string
    let roleId: string
    let resourcesId: string
    let employeeId: string
    let accessToken: string | null
    let createOrgPermissionId: string
    let readOrgPermissionId: string
    let readByIdOrgPermissionId: string

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
            .send({ name: orgResourceName })
        resourcesId = resourcesRes.body.data.id
        // Crear acciones y permisos
        const actions = [
            { name: 'can_create_organization' },
            { name: 'can_read_organizations' },
            { name: 'can_read_organization_by_id' },
        ]
        const [createActionId, readAllActionId, readByIdActionId] =
            await createActions(actions)
        const createPermRes = await createPermission({
            resourcesId,
            actionsId: createActionId,
        })
        createOrgPermissionId = createPermRes.body.data.id
        const readPermRes = await createPermission({
            resourcesId,
            actionsId: readAllActionId,
        })
        readOrgPermissionId = readPermRes.body.data.id
        const readByIdPermRes = await createPermission({
            resourcesId,
            actionsId: readByIdActionId,
        })
        readByIdOrgPermissionId = readByIdPermRes.body.data.id
        // Mapear permisos a rutas
        await setupRoutePermission(
            '/organizations/',
            createOrgPermissionId,
            'POST'
        )
        await setupRoutePermission(
            '/organizations/add',
            readOrgPermissionId,
            'GET'
        )
        await setupRoutePermission(
            '/organizations/:id',
            readByIdOrgPermissionId,
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
        if (!accessToken)
            throw new Error(
                'No se pudo obtener el token de acceso para org_employee'
            )
        await request(app)
            .post('/user-permission/add-admin')
            .send({ userId: employeeId, permissionId: createOrgPermissionId })
        await request(app)
            .post('/user-permission/add-admin')
            .send({ userId: employeeId, permissionId: readOrgPermissionId })
        await request(app)
            .post('/user-permission/add-admin')
            .send({ userId: employeeId, permissionId: readByIdOrgPermissionId })
    })

    afterAll(async () => {
        await clearDB()
    })

    describe('POST /organizations', () => {
        it('should create an organization with permission', async () => {
            const res = await request(app)
                .post('/organizations/add')
                //@ts-ignore
                .set('Cookie', accessToken)
                .send({ name: 'OrgTest' })
            expect(res.statusCode).toBe(200)
            expect(res.body.data).toHaveProperty('id')
        })
        it('should return 400 if name is invalid', async () => {
            const res = await request(app)
                .post('/organizations/add')
                //@ts-ignore
                .set('Cookie', accessToken)
                .send({ name: '' })
            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('GET /organizations', () => {
        it('should return all organizations with permission', async () => {
            const res = await request(app)
                .get('/organizations')
                //@ts-ignore
                .set('Cookie', accessToken)
            expect(res.statusCode).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
        })
    })

    describe('GET /organizations/:id', () => {
        it('should return organization by id with permission', async () => {
            const all = await request(app)
                .get('/organizations')
                //@ts-ignore
                .set('Cookie', accessToken)
            const orgId = all.body.data[0].id
            const res = await request(app)
                .get(`/organizations/${orgId}`)
                //@ts-ignore
                .set('Cookie', accessToken)
            expect(res.statusCode).toBe(200)
            expect(res.body.data).toHaveProperty('id', orgId)
        })
        it('should return 400 for invalid id', async () => {
            const res = await request(app)
                .get('/organizations/invalid')
                //@ts-ignore
                .set('Cookie', accessToken)
            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('Authorization', () => {
        it('should return 401 if no token', async () => {
            const res = await request(app).get('/organizations')
            expect(res.statusCode).toBe(401)
        })
        it('should return 403 if no permission', async () => {
            // Crear empleado sin permisos
            const empRes = await request(app).post('/employee/add-admin').send({
                name: 'NoPermEmp',
                username: 'nopermemp',
                password: 'nopass',
                roleId,
                departmentId,
            })
            const noPermToken = await loginAndGetToken('nopermemp', 'nopass')
            expect(noPermToken).toBeTruthy()
            const res = await request(app)
                .get('/organizations')
                .set('Cookie', noPermToken as string)
            expect(res.statusCode).toBe(403)
        })
    })
})
