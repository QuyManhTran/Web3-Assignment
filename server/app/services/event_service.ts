import { Pagination, PaginationMeta } from '#types/pagination.js'
import Event from '#models/event'
export default class EventService {
    async index({ curPage, perPage }: Pagination, keyword: string, type: string) {
        const events = await Event.query()
            .where((query) => {
                type && query.where('type', type)
            })
            .andWhere((query) => {
                keyword &&
                    query
                        .where('from', 'like', `%${keyword}%`)
                        .orWhere('to', 'like', `%${keyword}%`)
                        .orWhere('transaction_hash', 'like', `%${keyword}%`)
            })
            .orderBy('timestamp', 'desc')
            .paginate(curPage, perPage)
        const meta: PaginationMeta = {
            total: events.getMeta().total,
            perPage: events.getMeta().perPage,
            currentPage: events.getMeta().currentPage,
            lastPage: events.getMeta().lastPage,
            firstPage: events.getMeta().firstPage,
        }
        return {
            result: true,
            data: {
                events: {
                    meta,
                    data: events.all(),
                },
            },
        }
    }
}
