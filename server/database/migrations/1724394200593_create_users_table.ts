import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table.string('public_address').notNullable().unique()
            table.string('nonce').notNullable().unique()
            // table.enum('role', Object.values(UserRoles)).notNullable().defaultTo(UserRoles.USER)

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
