export interface Meta {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
}

export interface EventInfor {
    id: number;
    type: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    transactionHash: string;
    gasPrice: string;
    gasUsed: string;
    gasLimit: string;
    gasTotal: string;
    amount: string;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventResponse {
    events: {
        meta: Meta;
        data: EventInfor[];
    };
}
