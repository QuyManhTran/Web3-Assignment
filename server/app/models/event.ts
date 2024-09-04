import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { EventsContract } from '#enums/events'

export default class Event extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare from: string

    @column()
    declare to: string

    @column()
    declare value: string

    @column({ columnName: 'block_number' })
    declare blockNumber: number

    @column({ columnName: 'transaction_hash' })
    declare transactionHash: string

    @column({ columnName: 'gas_price' })
    declare gasPrice: string

    @column({ columnName: 'gas_used' })
    declare gasUsed: string

    @column({ columnName: 'gas_limit' })
    declare gasLimit: string

    @column({ columnName: 'gas_total' })
    declare gasTotal: string

    @column()
    declare amount: string | null

    @column()
    declare type: EventsContract

    @column.dateTime()
    declare timestamp: DateTime

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime
}
