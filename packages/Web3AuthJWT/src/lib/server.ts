import { ethers } from 'ethers';

// TODO: use a constant wallet for private key!
export const server = ethers.Wallet.createRandom();
