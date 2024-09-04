import { EventsContract } from '#enums/events'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'events'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.enum('type', Object.values(EventsContract)).notNullable()
            table.string('from').notNullable()
            table.string('to').notNullable()
            table.string('value').notNullable().defaultTo('0')
            table.integer('block_number').unsigned().notNullable()
            table.string('transaction_hash').notNullable()
            table.string('gas_price').notNullable()
            table.string('gas_used').notNullable()
            table.string('gas_limit').notNullable()
            table.string('gas_total').notNullable()
            table.string('amount').nullable()
            table.timestamp('timestamp').notNullable()
            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
