import User from '#models/user'
import env from '#start/env'
import { ethers } from 'ethers'
import crypto from 'node:crypto'
import { Response, ResponseStatus, Request } from '@adonisjs/core/http'
import parseDuration from 'parse-duration'
import { JwtExpiration } from '#enums/jwt'
import jwt from 'jsonwebtoken'
import { Exception } from '@adonisjs/core/exceptions'
import { errors } from '@adonisjs/auth'
export default class AuthService {
    async register(publicAddress: string) {
        const user = await User.findBy('publicAddress', publicAddress)
        if (user) {
            return {
                result: true,
                data: {
                    nonce: user.nonce,
                },
            }
        }
        const nonce = crypto.randomBytes(16).toString('hex')
        const newUser = await User.create({ publicAddress, nonce })
        return {
            result: true,
            data: {
                nonce: newUser.nonce,
            },
        }
    }

    async login(publicAddress: string) {
        const user = await User.findBy('publicAddress', publicAddress)
        if (!user) {
            return {
                result: false,
                message: 'User not found',
            }
        }
        return {
            result: true,
            data: {
                nonce: user.nonce,
            },
        }
    }

    async verify(publicAddress: string, signature: string, response: Response) {
        const user = await User.findBy('publicAddress', publicAddress)
        if (!user) {
            return {
                result: false,
                message: 'User not found',
            }
        }
        const templateMessage = env.get('SIGNATURE_MESSAGE')
        const message = `${templateMessage}${user.nonce}`
        const messageHash = ethers.hashMessage(message)
        const recoverAddress = ethers.recoverAddress(messageHash, signature)
        const isVerified = recoverAddress.toLowerCase() === publicAddress.toLowerCase()
        if (!isVerified) {
            return {
                result: false,
                message: 'Signature verification failed',
            }
        }
        const accessToken = await User.accessTokens.create(user)
        const refreshToken = await User.accessTokens.createRefresh(user)
        response.cookie('jwt', refreshToken.toJSON().token, {
            httpOnly: true,
            secure: true,
            maxAge: parseDuration(JwtExpiration.REFRESH)! / 1000 || 90 * 24 * 60 * 60,
        })
        return {
            result: true,
            data: {
                accessToken: accessToken.toJSON().token,
            },
        }
    }

    async refresh({ request }: { request: Request }) {
        const refreshToken = request.cookie('jwt')
        if (!refreshToken)
            throw new Exception('Invalid refresh token', { status: ResponseStatus.Unauthorized })
        const payload = jwt.verify(refreshToken, env.get('JWT_REFRESH_SECRET'))
        if (typeof payload !== 'object' || !('id' in payload)) {
            throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
                guardDriverName: 'jwt',
            })
        }
        const user = await User.findOrFail(payload.id)
        const accessToken = await User.accessTokens.create(user)
        return { result: true, data: { accessToken: accessToken.toJSON().token } }
    }
}
