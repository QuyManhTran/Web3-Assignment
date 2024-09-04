import EventService from '#services/event_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
@inject()
export default class EventsController {
    constructor(protected readonly eventService: EventService) {}
    async index({ pagination, request }: HttpContext) {
        const { perPage, curPage } = pagination
        const keyword = request.input('keyword', '')
        const type = request.input('type', '')
        return this.eventService.index({ curPage, perPage }, keyword, type)
    }
}
