import CrawlerService from '#services/crawler_service'
import RedisService from '#services/redis_service'
const redisService = new RedisService()
const cronService = new CrawlerService(redisService)
cronService.queryJob()
