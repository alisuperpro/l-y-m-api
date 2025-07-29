type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS'
type OrderDirection = 'ASC' | 'DESC'
type QueryResult = {
    sql: string
    args: any[]
}

export class QueryBuilder {
    private table: string
    private whereConditions: string[]
    private args: any[]
    private limitValue: number | null
    private offsetValue: number | null
    private orderByFields: string[]
    private joinClauses: string[]
    private selectFields: string[]

    constructor(table: string) {
        this.table = table
        this.whereConditions = []
        this.args = []
        this.limitValue = null
        this.offsetValue = null
        this.orderByFields = []
        this.joinClauses = []
        this.selectFields = ['*']
    }

    // SELECT personalizado
    select(fields: string | string[]): this {
        if (Array.isArray(fields)) {
            this.selectFields = fields
        } else {
            this.selectFields = [fields]
        }
        return this
    }

    // WHERE básico
    where(field: string, value: any, operator: string = '='): this {
        this.whereConditions.push(`${field} ${operator} ?`)
        this.args.push(value)
        return this
    }

    // WHERE con subquery
    whereExists(subquery: string): this {
        this.whereConditions.push(`EXISTS (${subquery})`)
        return this
    }

    // WHERE IN
    whereIn(field: string, values: any[]): this {
        if (values.length === 0) {
            this.whereConditions.push('1=0') // Siempre falso si no hay valores
        } else {
            const placeholders = values.map(() => '?').join(', ')
            this.whereConditions.push(`${field} IN (${placeholders})`)
            this.args.push(...values)
        }
        return this
    }

    // JOIN
    join(table: string, condition: string, type: JoinType = 'INNER'): this {
        this.joinClauses.push(`${type} JOIN ${table} ON ${condition}`)
        return this
    }

    // ORDER BY
    orderBy(field: string, direction: OrderDirection = 'ASC'): this {
        this.orderByFields.push(`${field} ${direction}`)
        return this
    }

    // LIMIT
    limit(limit: number): this {
        this.limitValue = limit
        return this
    }

    // OFFSET
    offset(offset: number): this {
        this.offsetValue = offset
        return this
    }

    // Construcción final de la consulta
    build(): QueryResult {
        let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`

        // JOINs
        if (this.joinClauses.length > 0) {
            sql += ' ' + this.joinClauses.join(' ')
        }

        // WHERE
        if (this.whereConditions.length > 0) {
            sql += ' WHERE ' + this.whereConditions.join(' AND ')
        }

        // ORDER BY
        if (this.orderByFields.length > 0) {
            sql += ' ORDER BY ' + this.orderByFields.join(', ')
        }

        // LIMIT y OFFSET
        if (this.limitValue !== null) {
            sql += ' LIMIT ?'
            this.args.push(this.limitValue)
        }

        if (this.offsetValue !== null) {
            sql += ' OFFSET ?'
            this.args.push(this.offsetValue)
        }

        return { sql, args: this.args }
    }
}
