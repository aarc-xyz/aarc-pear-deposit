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

export const PEAR_PROVIDERS = [
    "Hyperliquid",
    "SYMM.io",
    "Vertex"
];

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

export const USDC_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // Arbitrum USDC address
export const HYPERLIQUID_DEPOSIT_ADDRESS = {
    [SupportedChainId.ARBITRUM]: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
};

export const USDC_ABI = [
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
];

export const VERTEX_DEPOSIT_ADDRESS = {
    [SupportedChainId.ARBITRUM]: '0xbbee07b3e8121227afcfe1e2b82772246226128e',
};