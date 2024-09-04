import AuthService from '#services/auth_service'
import { AuthValidator, AuthVerifyValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
@inject()
export default class AuthController {
    constructor(protected readonly authService: AuthService) {}
    async register({ request }: HttpContext) {
        const data = request.only(['publicAddress'])
        const { publicAddress } = await AuthValidator.validate(data)
        return this.authService.register(publicAddress)
    }

    async login({ request }: HttpContext) {
        const data = request.only(['publicAddress'])
        const { publicAddress } = await AuthValidator.validate(data)
        return this.authService.login(publicAddress)
    }

    async verify({ request, response }: HttpContext) {
        const data = request.only(['publicAddress', 'signature'])
        const { publicAddress, signature } = await AuthVerifyValidator.validate(data)
        return this.authService.verify(publicAddress, signature, response)
    }

    async refresh({ request }: HttpContext) {
        return this.authService.refresh({ request })
    }
}
