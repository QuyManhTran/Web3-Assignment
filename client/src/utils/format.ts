export const formatTxnHash = (hash: string) => {
    return `${hash.slice(0, 10)}...`;
};

export const formatGasTotal = (gasTotal: string) => {
    return `${gasTotal.slice(0, 10)} ETH`;
};
