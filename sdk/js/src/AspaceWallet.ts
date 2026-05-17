import { ethers } from "ethers";

export class AspaceWallet {
  public provider: ethers.JsonRpcProvider;
  public wallet: ethers.Wallet;

  constructor(privateKey: string, rpcUrl: string = "https://rpc-testnet.gokite.ai/") {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  get address(): string {
    return this.wallet.address;
  }

  getSigner(): ethers.Wallet {
    return this.wallet;
  }
}
