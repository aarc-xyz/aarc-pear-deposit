export enum SupportedChainId {
    ARBITRUM = 42161
}

export type AddressMap = {
    [chainId: number]: string;
};

export const PEAR_SYMMIO_ACCOUNT_ADDRESS: AddressMap = {
    [SupportedChainId.ARBITRUM]: '0x6273242a7E88b3De90822b31648C212215caaFE4'
};

export const PEAR_SYMMIO_DIAMOND_ADDRESS: AddressMap = {
    [SupportedChainId.ARBITRUM]: '0x8F06459f184553e5d04F07F868720BDaCAB39395'
};


export const multiAccountAbi = [
    {
        name: "getAccountsLength",
        type: "function",
        stateMutability: "view",
        inputs: [
            {
                name: "user",
                type: "address"
            }
        ],
        outputs: [
            {
                name: "",
                type: "uint256"
            }
        ]
    },
    {
        name: "getAccounts",
        type: "function",
        stateMutability: "view",
        inputs: [
            {
                name: "user",
                type: "address"
            },
            {
                name: "start",
                type: "uint256"
            },
            {
                name: "size",
                type: "uint256"
            }
        ],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    {
                        name: "accountAddress",
                        type: "address"
                    },
                    {
                        name: "name",
                        type: "string"
                    }
                ]
            }
        ]
    },
    {
        name: "addAccount",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "name",
                type: "string"
            }
        ],
        outputs: []
    }
] as const;

export const ARBITRUM_RPC_URL = "https://arb1.arbitrum.io/rpc";