import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { JwtExpiration } from '#enums/jwt'
import { JwtAccessTokenProvider, JwtSecret } from '#providers/jwt_access_token_provider'
import parseDuration from 'parse-duration'
import env from '#start/env'
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
    uids: ['email'],
    passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
    @column({ isPrimary: true })
    declare id: number

    @column({ columnName: 'public_address', serializeAs: null })
    declare publicAddress: string

    @column({ columnName: 'nonce', serializeAs: null })
    declare nonce: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    static accessTokens = JwtAccessTokenProvider.forModel(User, {
        expiresInMillis: parseDuration(JwtExpiration.ACCESS)!,
        refreshExpiresInMillis: parseDuration(JwtExpiration.REFRESH)!,
        key: new JwtSecret(env.get('JWT_ACCESS_SECRET'), env.get('JWT_REFRESH_SECRET')),
        primaryKey: 'id',
        algorithm: 'HS256',
        audience: 'https://client.example.com',
        issuer: 'https://server.example.com',
    })
}
