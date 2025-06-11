import {
    FKConfig,
    ThemeName,
    TransactionSuccessData,
    TransactionErrorData,
    SourceConnectorName,
  } from "@aarc-xyz/fundkit-web-sdk";
  
  export const hyperliquidAarcConfig: FKConfig = {
    appName: "Pear x Aarc",
    module: {
      exchange: {
        enabled: true,
      },
      onRamp: {
        enabled: true,
        onRampConfig: {},
      },
      bridgeAndSwap: {
        enabled: true,
        fetchOnlyDestinationBalance: false,
        routeType: "Value",
        connectors: [SourceConnectorName.ETHEREUM],
      },
    },
    destination: {
      chainId: 42161, // Arb chain ID
      tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC on Base
    },
    appearance: {
      roundness: 42,
      theme: ThemeName.DARK,
    },
    apiKeys: {
      aarcSDK: import.meta.env.VITE_AARC_API_KEY,
    },
    events: {
      onTransactionSuccess: (data: TransactionSuccessData) => {
        console.log("Transaction successful:", data);
      },
      onTransactionError: (data: TransactionErrorData) => {
        console.error("Transaction failed:", data);
      },
      onWidgetClose: () => {
        console.log("Widget closed");
      },
      onWidgetOpen: () => {
        console.log("Widget opened");
      },
    },
    origin: window.location.origin,
  
  }; 