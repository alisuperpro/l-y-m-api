import request from 'supertest'
import {
    clearDB,
    createActions,
    createPermission,
    loginAndGetToken,
    setupRoutePermission,
} from './helpers'
import app from '../../api'

describe('States API Integration', () => {
    let departmentId: string
    let roleId: string
    let resourcesId: string
    let employeeId: string
    let accessToken: string | null
    let createStatesPermissionId: string
    let readStatesPermissionId: string
    let readByIdStatesPermissionId: string

    const states = {
        pending: 'pending',
        approved: 'approved',
        rejected: 'rejected',
    }

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
            { name: 'can_create_states' },
            { name: 'can_read_statess' },
            { name: 'can_read_states_by_id' },
        ]
        const [createActionId, readAllActionId, readByIdActionId] =
            await createActions(actions)
        const createPermRes = await createPermission({
            resourcesId,
            actionsId: createActionId,
        })
        createStatesPermissionId = createPermRes.body.data.id
        const readPermRes = await createPermission({
            resourcesId,
            actionsId: readAllActionId,
        })
        readStatesPermissionId = readPermRes.body.data.id
        const readByIdPermRes = await createPermission({
            resourcesId,
            actionsId: readByIdActionId,
        })
        readByIdStatesPermissionId = readByIdPermRes.body.data.id
        // Mapear permisos a rutas
        await setupRoutePermission('/states/', createStatesPermissionId, 'POST')
        await setupRoutePermission('/states/add', readStatesPermissionId, 'GET')
        await setupRoutePermission(
            '/states/:id',
            readByIdStatesPermissionId,
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
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: createStatesPermissionId,
        })
        await request(app)
            .post('/user-permission/add-admin')
            .send({ userId: employeeId, permissionId: readStatesPermissionId })
        await request(app).post('/user-permission/add-admin').send({
            userId: employeeId,
            permissionId: readByIdStatesPermissionId,
        })
    })

    afterAll(async () => {
        await clearDB()
    })

    describe('POST /states/add', () => {
        it('should create a new state', async () => {
            const res = await request(app)
                .post('/states/add')
                .set('Cookie', accessToken as string)
                .send({ state: states.approved })
            expect(res.status).toBe(200)
            expect(res.body.data.state).toBe(states.approved)
        })

        it('should return 400 for invalid state', async () => {
            const res = await request(app)
                .post('/states/add')
                .set('Cookie', accessToken as string)
                .send({ state: 'ab' }) // Invalid state
            expect(res.status).toBe(400)
            expect(res.body.error).toBeDefined()
        })

        it('should return 401 for unauthorized access', async () => {
            const res = await request(app)
                .post('/states/add')
                .send({ state: states.pending })
            expect(res.status).toBe(401)
            expect(res.body.error).toBeDefined()
        })
        it('should return error for existing state', async () => {
            const res = await request(app)
                .post('/states/add')
                .set('Cookie', accessToken as string)
                .send({ state: states.approved })
            expect(res.status).toBe(400)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('GET /states', () => {
        it('should return all states', async () => {
            const res = await request(app)
                .get('/states')
                .set('Cookie', accessToken as string)
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBeGreaterThan(0)
        })
        it('should return 401 for unauthorized access', async () => {
            const res = await request(app).get('/states')
            expect(res.status).toBe(401)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('GET /states/:id', () => {
        it('should return state by id', async () => {
            const allStates = await request(app)
                .get('/states')
                .set('Cookie', accessToken as string)
            const stateId = allStates.body.data[0].id
            const res = await request(app)
                .get(`/states/${stateId}`)
                .set('Cookie', accessToken as string)
            expect(res.status).toBe(200)
            expect(res.body.data.id).toBe(stateId)
        })
        it('should return 400 for invalid id', async () => {
            const res = await request(app)
                .get('/states/invalid')
                .set('Cookie', accessToken as string)
            expect(res.status).toBe(400)
            expect(res.body.error).toBeDefined()
        })
    })
})
