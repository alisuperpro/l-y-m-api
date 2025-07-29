/**
 * Represents the 'clients' table.
 */
export interface Client {
    id: string
    name: string
    username: string
    password: string
    created_at: string // Assuming VARCHAR stores a date string
    email: string
    created_by: string // Foreign key to employee.id
}

/**
 * Represents the 'pay' table.
 */
export interface Pay {
    id: string
    reference_code: string
    pay_date: string // Assuming VARCHAR stores a date string
    created_at: string // Assuming VARCHAR stores a date string
    client_id: string // Foreign key to clients.id
    photo_url: string | null // TEXT can be NULL
    description: string | null // TEXT can be NULL
    debt_id: string // Foreign key to debt.id
    amount: number // NUMERIC maps to number
    status: string // Foreign key to states.id
}

/**
 * Represents the 'debt' table.
 */
export interface Debt {
    id: string
    amount: number // NUMERIC maps to number
    client_id: string // Foreign key to clients.id
    created_at: string // Assuming VARCHAR stores a date string
    description: string | null // TEXT can be NULL
    created_by: string // Foreign key to employee.id
    status: string // Foreign key to states.id
}

/**
 * Represents the 'departments' table.
 */
export interface Department {
    id: string
    name: string
    created_at: string // Assuming VARCHAR stores a date string
}

/**
 * Represents the 'permission' table.
 */
export interface Permission {
    id: string
    resources_id: string // Foreign key to resources.id
    actions_id: string // Foreign key to actions.id
    description: string | null // TEXT can be NULL
}

/**
 * Represents the 'role' table.
 */
export interface Role {
    id: string
    name: string
    description: string | null // TEXT can be NULL
}

/**
 * Represents the 'role_permission' join table.
 */
export interface RolePermission {
    role_id: string // Foreign key to role.id
    permission_id: string // Foreign key to permission.id
}

/**
 * Represents the 'employee' table.
 */
export interface Employee {
    id: string
    name: string
    username: string
    role_id: string // Foreign key to role.id
    created_at: string // Assuming VARCHAR stores a date string
}

/**
 * Represents the 'resources' table.
 */
export interface Resource {
    id: string
    name: string
    description: string | null // TEXT can be NULL
}

/**
 * Represents the 'actions' table.
 */
export type ActionName = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface Action {
    id: string
    name: ActionName // CHECK constraint converted to a union type
    description: string | null // TEXT can be NULL
}

/**
 * Represents the 'client_documents' table.
 */
export interface ClientDocument {
    id: string
    name: string
    ext: string
    url: string // TEXT maps to string
    created_by: string
    created_at: string // Assuming VARCHAR stores a date string
    description: string | null // TEXT can be NULL
    client_id: string // Foreign key to clients.id
    client_company_id: string // Foreign key to client_company.id
    organization_id: string // Foreign key to organizations.id
}

/**
 * Represents the 'route_permission_map' table.
 */
export interface RoutePermissionMap {
    id: string
    route_path: string
    http_method: string
    permission_id: string // Foreign key to permission.id
}

/**
 * Represents the 'client_company' table.
 */
export interface ClientCompany {
    id: string
    name: string
    created_at: string // Assuming VARCHAR stores a date string
    client_id: string // Foreign key to clients.id
}

/**
 * Represents the 'organizations' table.
 */
export interface Organization {
    id: string
    name: string
    created_at: string // Assuming VARCHAR stores a date string
}

/**
 * Represents the 'user_permission' join table.
 */
export interface UserPermission {
    user_id: string
    permission_id: string // Foreign key to permission.id
}

/**
 * Represents the 'can_approve_other_debts' table.
 */
export interface CanApproveOtherDebt {
    creater_id: string
    approver_id: string
}

/**
 * Represents the 'states' table.
 */
export interface State {
    id: string
    state: string | null // VARCHAR can be NULL
    resources: string // Foreign key to resources.id
}

/**
 * Represents the 'default_client_permissions' table.
 */
export interface DefaultClientPermission {
    permission_id: string // Foreign key to permission.id
    created_at: string // Assuming VARCHAR stores a date string
}
