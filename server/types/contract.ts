import { EventLog } from 'ethers'

export type EventContract = EventLog & {
    args: any[]
}
