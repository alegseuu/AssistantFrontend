export type NetworkName = "testnet";
export type ChainId = "0x128";
export type NetworkConfig = {
  network: NetworkName;
  jsonRpcUrl: string;
  mirrorNodeUrl: string;
  chainId: ChainId;
  contractAddress: string;
  backendKey: string;
  contractId: string;
  requestTopic: string;
  backendTopic: string;
  resumeTopic: string;
};

// purpose of this file is to define the type of the config object
export type NetworkConfigs = {
  [key in NetworkName]: {
    network: NetworkName;
    jsonRpcUrl: string;
    mirrorNodeUrl: string;
    chainId: ChainId;
    contractId: string;
    contractAddress: string;
    backendKey: string;
    requestTopic: string;
    backendTopic: string;
    resumeTopic: string;
  };
};

export type AppConfig = {
  networks: NetworkConfigs;
};
