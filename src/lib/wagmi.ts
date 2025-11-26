import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet,
  trustWallet,
  ledgerWallet,
  argentWallet,
  omniWallet,
  imTokenWallet,
  zerionWallet,
  rabbyWallet,
  phantomWallet,
  okxWallet,
  uniswapWallet,
  frameWallet,
} from '@rainbow-me/rainbowkit/wallets';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Installed',
      wallets: [injectedWallet],
    },
    {
      groupName: 'Popular',
      wallets: [
        zerionWallet,
        rabbyWallet,
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: 'More',
      wallets: [
        phantomWallet,
        okxWallet,
        trustWallet,
        ledgerWallet,
        argentWallet,
        uniswapWallet,
        omniWallet,
        imTokenWallet,
        frameWallet,
      ],
    },
  ],
  {
    appName: 'WagerX',
    projectId,
  }
);

export const config = createConfig({
  connectors,
  chains: [baseSepolia, base],
  transports: {
    // Use public RPC endpoints with fallbacks
    [baseSepolia.id]: http('https://base-sepolia-rpc.publicnode.com'),
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
});
