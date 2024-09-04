import type { HttpContext } from '@adonisjs/core/http'
import { EventsContract } from '#enums/events'
import CrawlerService from '#services/crawler_service'
import { inject } from '@adonisjs/core'
import { CrawlValidator } from '#validators/crawl'
@inject()
export default class CrawlersController {
    constructor(private readonly crawlService: CrawlerService) {}

    async getMintEvents({ request }: HttpContext) {
        const { fromBlock: fromBlockData } = request.only(['fromBlock'])
        const { fromBlock } = await CrawlValidator.validate({ fromBlock: fromBlockData })
        return this.crawlService.queryTransferEvents(
            EventsContract.MintToken,
            `${EventsContract.MintToken}BlockNumber`
        )
    }
}
