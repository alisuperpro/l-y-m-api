import request from 'supertest'
import { db } from '../db/db'
import app from '../../api'

export const createActions = async (actions: { name: string }[]) => {
    const ids: string[] = []
    for (const action of actions) {
        const res = await request(app).post('/actions/add').send(action)
        ids.push(res.body.data.id)
    }
    return ids
}
export const createPermission = async ({
    resourcesId,
    actionsId,
}: {
    resourcesId: string
    actionsId: string
}) => {
    return await request(app)
        .post('/permission/add')
        .send({ resourcesId, actionsId })
}
export const setupRoutePermission = async (
    routePath: string,
    permissionId: string,
    httpMethod: string = 'GET'
) => {
    return await request(app)
        .post('/route-permission-map/add')
        .send({ routePath, permissionId, httpMethod })
}
export const loginAndGetToken = async (username: string, password: string) => {
    const loginRes = await request(app)
        .post('/employee/login')
        .send({ username, password })
    if (loginRes.statusCode === 200) {
        const cookies = loginRes.headers['set-cookie']
        return cookies ? cookies[0] : null
    }
    return null
}
export const clearDB = async () => {
    await db.execute({ sql: 'DELETE FROM user_permission' })
    await db.execute({ sql: 'DELETE FROM route_permission_map' })
    await db.execute({ sql: 'DELETE FROM role_permission' })
    await db.execute({ sql: 'DELETE FROM permission' })
    await db.execute({ sql: 'DELETE FROM actions' })
    await db.execute({ sql: 'DELETE FROM resources' })
    await db.execute({ sql: 'DELETE FROM client_documents' })
    await db.execute({ sql: 'DELETE FROM client_company' })
    await db.execute({ sql: 'DELETE FROM clients' })
    await db.execute({ sql: 'DELETE FROM employee' })
    await db.execute({ sql: 'DELETE FROM departments' })
    await db.execute({ sql: 'DELETE FROM role' })
    await db.execute({ sql: 'DELETE FROM organizations' })
    await db.execute({ sql: 'DELETE FROM states' })
}
