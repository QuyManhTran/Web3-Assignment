import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PaginationMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        /**
         * Middleware logic goes here (before the next call)
         */
        const perPage = ctx.request.input('per_page', 5)
        const curPage = ctx.request.input('cur_page', 1)
        ctx.pagination = { perPage, curPage }

        /**
         * Call next method in the pipeline and return its output
         */
        const output = await next()
        return output
    }
}
