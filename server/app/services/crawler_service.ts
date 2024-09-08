import { formatEther, JsonRpcProvider, Contract } from 'ethers'
import contractAddress from '#contracts/APR/contract-address.json' assert { type: 'json' }
import artifact from '#contracts/APR/Token.json' assert { type: 'json' }
import { EventContract } from '#types/contract.js'
import { inject } from '@adonisjs/core'
import RedisService from './redis_service.js'
import { CronJob } from 'cron'
import { EventsContract } from '#enums/events'
import Event from '#models/event'
import { DateTime } from 'luxon'
@inject()
export default class CrawlerService {
    stepCrawler: number
    private provider: JsonRpcProvider
    private contractAddress: string
    private abi: any
    private contract: Contract
    constructor(protected readonly redisService: RedisService) {
        this.stepCrawler = 1000
        this.provider = new JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com')
        this.contractAddress = contractAddress.Token
        this.abi = artifact.abi
        this.contract = new Contract(this.contractAddress, this.abi, this.provider)
    }

    get providerGetter() {
        return this.provider
    }

    async getBlockNumberForTimestamp(timestamp: number) {
        const blockNumber = await this.provider.getBlockNumber()
        let startBlock = 0
        let endBlock = blockNumber
        while (startBlock < endBlock) {
            const midBlock = Math.floor((startBlock + endBlock) / 2)
            const block = await this.provider.getBlock(midBlock)
            if (block === null) return -1
            if (block?.timestamp === timestamp) {
                return midBlock
            } else if (block?.timestamp < timestamp) {
                startBlock = midBlock + 1
            } else {
                endBlock = midBlock - 1
            }
        }
        return startBlock
    }

    async getToBlockForCrawling(key: string) {
        const currentBlock = await this.redisService.getBlockNumber(key)
        console.log('blockCounterGetter', currentBlock)
        const blockNumber = await this.provider.getBlockNumber()
        console.log('blockNumber', blockNumber)
        if (blockNumber - currentBlock < this.stepCrawler) {
            console.log('okelalallllll')
            return { fromBlock: currentBlock, toBlock: blockNumber, blockNumber }
        }
        return {
            fromBlock: currentBlock,
            toBlock: currentBlock + this.stepCrawler - 1,
            blockNumber: blockNumber,
        }
    }

    async queryTransferEvents(eventName: EventsContract, key: string) {
        const { fromBlock, toBlock, blockNumber } = await this.getToBlockForCrawling(key)
        console.log('fromBlock', fromBlock)
        console.log('toBlock', toBlock)
        if (fromBlock > toBlock) {
            // await this.redisService.setBlockNumber(key, contractAddress.BlockNumber)
            return []
        }
        const events = await this.contract.queryFilter(eventName, fromBlock, toBlock)
        if (events.length === 0 && toBlock < blockNumber) {
            this.redisService.setBlockNumber(key, toBlock + 1)
            return []
        }
        const data = await Promise.all(
            events.map(async (log) => {
                const transaction = await this.providerGetter.getTransaction(log.transactionHash)
                const additionalTransaction = await this.providerGetter.getTransactionReceipt(
                    log.transactionHash
                )

                if (transaction === null || additionalTransaction === null) return null
                const finalData = {
                    type: eventName,
                    from: transaction?.from,
                    to: transaction?.to || '',
                    value: transaction?.value.toString(),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    gasPrice: transaction?.gasPrice.toString(),
                    gasLimit: transaction?.gasLimit.toString(),
                    gasUsed: additionalTransaction.gasUsed.toString(),
                    gasTotal: formatEther(transaction?.gasPrice * additionalTransaction.gasUsed),
                    timestamp: DateTime.fromMillis(
                        new Date(
                            Number.parseInt(
                                (log as EventContract).args[
                                    (log as EventContract).args.length - 1
                                ].toString()
                            ) * 1000
                        ).getTime()
                    ),
                    amount: (log as EventContract).args[1].toString(),
                }
                await Event.create(finalData)
            })
        )

        this.redisService.setBlockNumber(key, toBlock + 1)
        return data
        // const eventNameHash = keccak256(toUtf8Bytes('MintToken(address,uint256)'))
        // const addressIn32Bytes = zeroPadValue('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 32)
        // const fromLogs = await this.provider.getLogs({
        //     address: this.contractAddress,
        //     topics: [null, addressIn32Bytes],
        //     fromBlock: fromBlock,
        //     toBlock: toBlock,
        // })
        // console.log(fromLogs.length)
    }

    queryJob = () => {
        const job = new CronJob('*/1 * * * *', async () => {
            const mintTokenData = await this.queryTransferEvents(
                EventsContract.MintToken,
                `${EventsContract.MintToken}BlockNumber`
            )
            // console.log('----------mintTokenData----------', mintTokenData)
            const depositTokenData = await this.queryTransferEvents(
                EventsContract.Deposit,
                `${EventsContract.Deposit}BlockNumber`
            )
            // console.log('----------depositTokenData----------', depositTokenData)
            const withdrawTokenData = await this.queryTransferEvents(
                EventsContract.Withdraw,
                `${EventsContract.Withdraw}BlockNumber`
            )
            // console.log('----------withdrawTokenData----------', withdrawTokenData)
            const claimTokenData = await this.queryTransferEvents(
                EventsContract.Claim,
                `${EventsContract.Claim}BlockNumber`
            )
            // console.log('----------claimTokenData----------', claimTokenData)
            const depositNftTokenData = await this.queryTransferEvents(
                EventsContract.DepositNft,
                `${EventsContract.DepositNft}BlockNumber`
            )
            // console.log('----------depositNftTokenData----------', depositNftTokenData)
            const withdrawNftTokenData = await this.queryTransferEvents(
                EventsContract.WithdrawNft,
                `${EventsContract.WithdrawNft}BlockNumber`
            )
            // console.log('----------withdrawNftTokenData----------', withdrawNftTokenData)
        })
        job.start()
    }
}
