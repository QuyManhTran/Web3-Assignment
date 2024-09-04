import redis from '@adonisjs/redis/services/main'
import contractInfor from '#contracts/APR/contract-address.json' assert { type: 'json' }
export default class RedisService {
    async get(key: string, resultQueryCB: () => Promise<any>, seconds: number = 60) {
        const value = await redis.get(key)
        if (!value) {
            // //console.log('Cache miss')
            const result = await resultQueryCB()
            await redis.set(key, JSON.stringify(result), 'EX', seconds, 'NX')
            return result
        }
        // //console.log('Cache hit')
        return JSON.parse(value)
    }

    async getBlockNumber(key: string) {
        const value = await redis.get(key)
        if (!value) {
            await redis.set(key, contractInfor.BlockNumber.toString())
            return contractInfor.BlockNumber
        }
        return Number.parseInt(value)
    }

    async setBlockNumber(key: string, value: number) {
        await redis.set(key, value.toString())
    }
}
