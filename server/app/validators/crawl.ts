import vine from '@vinejs/vine'

export const CrawlValidator = vine.compile(
    vine.object({
        fromBlock: vine.number().min(0),
    })
)
