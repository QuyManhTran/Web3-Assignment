import { Response } from '@adonisjs/core/http'
import { LucidModel } from '@adonisjs/lucid/types/model'
import { Algorithm } from 'jsonwebtoken'

export interface JwtKey {
    verificationKey: string
    secret: string
    refreshSecret: string
}

export interface JwtAccessTokenProviderOptions<TokenableModel extends LucidModel> {
    tokenableModel: TokenableModel
    expiresInMillis: number
    refreshExpiresInMillis: number
    key: JwtKey
    algorithm?: Algorithm
    primaryKey: string
    extraPayload?: (user: InstanceType<TokenableModel>) => Record<string, any>
    issuer?: string
    audience?: string
}

export interface RegisterAuth {
    username: string
    email: string
    password: string
}

export interface LoginAuth {
    data: {
        email: string
        password: string
    }
    response: Response
}
