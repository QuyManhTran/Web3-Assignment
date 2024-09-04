import RolePolicy from '#policies/role_policy'
import { UserRole } from '#types/user.js'
import { Exception } from '@adonisjs/core/exceptions'
import { ResponseStatus, type HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
    async handle(ctx: HttpContext, next: NextFn, { roles }: UserRole) {
        /**
         * Middleware logic goes here (before the next call)
         */
        if (await ctx.bouncer.with(RolePolicy).denies('isRightRole', roles)) {
            throw new Exception('Unauthorized access', {
                status: ResponseStatus.Forbidden,
                code: 'E_UNAUTHORIZED_ACCESS',
            })
        }
        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
    }
}
