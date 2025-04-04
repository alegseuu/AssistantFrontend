import {
  TransactionReceipt,
  TransactionResponse,
  PrivateKey,
} from "@hashgraph/sdk";
interface MessageFormat {
  eventType: string;
  accountId?: string;
  userPublicKey?: string;
  encryptedSessionData?: string;
  text?: string;
}
interface walletInterfaceResponse {
  receipt: TransactionReceipt;
  result: TransactionResponse;
}
export interface WalletInterface {
  sendTopicMessage: (
    topicIdStr: string,
    message: string,
    sessionExecute: boolean
  ) => Promise<string>;
  subscribeTopic: (
    topicIdStr: string,
    onMessage: (decoded: MessageFormat) => void,
    lastConsensusTimestamp: string,
    privateTopic: boolean
  ) => Promise<() => void>;
  chatHistory: (topicIdStr: string) => Promise<any>;
  generateDeterministicHederaKey: (accountId: string) => Promise<PrivateKey>;
  disconnect: () => void;

  setOperator: (sessionKey: string, sessionId: string) => void;
}
