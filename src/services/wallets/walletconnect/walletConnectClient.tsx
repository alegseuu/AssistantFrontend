import { WalletConnectContext } from "../../../contexts/WalletConnectContext";
import { useCallback, useContext, useEffect } from "react";
import { WalletInterface } from "../walletInterface";
import { MirrorNodeClient } from "../mirrorNodeClient";
import { saveSession } from "./../../sessionStorage";
import { ethers, ContractInterface } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractId,
  LedgerId,
  TokenAssociateTransaction,
  TokenId,
  Transaction,
  TransactionId,
  TransferTransaction,
  TransactionReceiptQuery,
  TopicMessageSubmitTransaction,
  TopicId,
  Client,
  TopicMessageQuery,
  Hbar,
  FileId,
  ContractCallQuery,
  TransactionRecordQuery,
  FileCreateTransaction,
  AccountAllowanceApproveTransaction,
  AccountInfoQuery,
  FileUpdateTransaction,
  PublicKey,
  SignatureMap,
  Key,
  PrivateKey,
  AccountCreateTransaction,
  KeyList,
  FileContentsQuery,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "../contractFunctionParameterBuilder";
import { appConfig } from "../../../config";
/*import { SignClientTypes } from "@walletconnect/types";
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
  SignAndExecuteTransactionParams,
  transactionToBase64String,
} from "@hashgraph/hedera-wallet-connect";*/
import {
  HashConnect,
  HashConnectConnectionState,
  SessionData,
} from "hashconnect";
import EventEmitter from "events";
import { networkConfig } from "../../../config/networks";

// Created refreshEvent because `dappConnector.walletConnectClient.on(eventName, syncWithWalletConnectContext)` would not call syncWithWalletConnectContext
interface MessageFormat {
  eventType: string;
  accountId?: string;
  userPublicKey?: string;
  encryptedSessionData?: string;
  text?: string;
}
const refreshEvent = new EventEmitter();

// Create a new project in walletconnect cloud to generate a project id

const currentNetworkConfig = appConfig.networks.testnet;
const hederaNetwork = currentNetworkConfig.network;
const hederaClient = Client.forTestnet();

// https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/examples/typescript/dapp/main.ts#L87C1-L101C4

const sessionClient = Client.forTestnet();

class HashConnectWallet implements WalletInterface {
  private getAccountId() {
    return AccountId.fromString(pairingData?.accountIds?.[0] || "");
  }

  async setOperator(sessionKey: string, sessionId: string) {
    sessionClient.setOperator(
      AccountId.fromString(sessionId),
      PrivateKey.fromStringECDSA(sessionKey)
    );
  }

  public async subscribeTopic(
    topicIdStr: string,
    onMessage: (decoded: MessageFormat) => void,
    lastConsensusTimestamp: string = "0",
    privateTopic: boolean = false
  ) {
    const mirrorUrl = "https://testnet.mirrornode.hedera.com";
    let active = true;
    let timeout: NodeJS.Timeout;

    console.log(lastConsensusTimestamp);

    const poll = async () => {
      if (!active) return;

      try {
        console.log(
          `${mirrorUrl}/api/v1/topics/${topicIdStr}/messages?limit=10&order=asc&timestamp=gt:${lastConsensusTimestamp}`
        );
        const res = await fetch(
          `${mirrorUrl}/api/v1/topics/${topicIdStr}/messages?limit=10&order=asc&timestamp=gt:${lastConsensusTimestamp}`
        );
        const data = await res.json();
        console.log("reaaaaad");
        console.log(data);
        console.log(data.messages);
        console.log(data.messages.length);
        if (data.messages && data.messages.length > 0) {
          for (const message of data.messages) {
            console.log(message.message);
            const decoded = new TextDecoder().decode(
              Uint8Array.from(atob(message.message), (c) => c.charCodeAt(0))
            );
            console.log(decoded);
            const json = JSON.parse(decoded);
            console.log(json.user);
            console.log(this.getAccountId().toString());
            if (
              json.user === this.getAccountId().toString() ||
              (privateTopic && json.eventType === "CHAT_RESPONSE")
            ) {
              const message: MessageFormat = {
                eventType: json.eventType || "ACCOUNT_DATA",
                accountId: json.user,
                text: json.encryptedSessionData || json.text,
              };
              onMessage(message);

              return "SUCCESS";
            }
          }

          lastConsensusTimestamp =
            data.messages[data.messages.length - 1].consensus_timestamp;
        }
      } catch (err) {
        console.error(err);
        return "FAILED";
      }

      timeout = setTimeout(poll, 3000); // repeat every 3 seconds
    };

    // Start polling
    poll();

    // Return an unsubscribe function
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }

  public async sendTopicMessage(
    topicIdStr: string,
    message: string,
    sessionExecute: boolean = true
  ) {
    try {
      // 1) Prepare transaction
      const topicId = TopicId.fromString(topicIdStr);
      const signer = hashconnect.getSigner(this.getAccountId());
      const tx = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message);

      // 2) Execute transaction
      let txResult;
      if (sessionExecute) {
        // Use session client
        await tx.freezeWith(sessionClient);
        txResult = await tx.execute(sessionClient);
      } else {
        // Use signer from HashConnect
        await tx.freezeWithSigner(signer);
        txResult = await tx.executeWithSigner(signer);
      }

      // 3) Get receipt (for confirmation of status)
      const receipt = await new TransactionReceiptQuery()
        .setTransactionId(txResult.transactionId)
        .execute(hederaClient);

      console.log(
        "📨 Message submitted. Receipt status:",
        receipt.status.toString()
      );

      // 5) Return the consensus timestamp (e.g. "1691691727.123456789")
      return "SUCCESS";
    } catch (error) {
      console.error("❌ Failed to send topic message:", error);
      return "FAILED";
    }
  }

  public async generateDeterministicHederaKey(
    accountId: string
  ): Promise<PrivateKey> {
    try {
      // 1) Użyj predefiniowanego tekstu do testów (np. zależnego od accountId)
      const message = `Generate Hedera key 222222 for ${accountId}`;

      // 2) Konwertuj tekst na bajty i zakoduj base64 (opcjonalne, możesz pominąć)
      const base64String = btoa(message);

      // 3) Stwórz "entropy" poprzez keccak256
      const entropy = keccak256(toUtf8Bytes(base64String)); // lub toUtf8Bytes(message) bez base64

      // 4) Wygeneruj deterministyczny klucz prywatny
      const privateKey = PrivateKey.fromStringECDSA(entropy);

      console.log("✅ Deterministyczny klucz prywatny:", privateKey.toString());

      return privateKey;
    } catch (err) {
      console.error("❌ Błąd przy generowaniu klucza prywatnego:", err);
      throw err;
    }
  }

  public async chatHistory(topicIdStr: string) {
    const mirrorUrl = "https://testnet.mirrornode.hedera.com";
    try {
      console.log(
        `${mirrorUrl}/api/v1/topics/${topicIdStr}/messages?order=asc&limit=1000`
      );
      const res = await fetch(
        `${mirrorUrl}/api/v1/topics/${topicIdStr}/messages?order=asc&limit=1000`
      );
      console.log(
        `${mirrorUrl}/api/v1/topics/${topicIdStr}/messages?order=asc&limit=1000`
      );
      if (!res.ok) throw new Error(`Mirror node error: ${res.status}`);

      const data = await res.json();

      const messages = data.messages.map((msg) =>
        new TextDecoder().decode(
          Uint8Array.from(atob(msg.message), (c) => c.charCodeAt(0))
        )
      );

      return messages;
    } catch (err) {
      console.error("❌ Failed to fetch messages from mirror node:", err);
      return [];
    }
  }

  disconnect() {
    hashconnect.disconnect().then((x) => {});
  }
}

export const hashConnectWallet = new HashConnectWallet();

const appMetadata = {
  name: "Medical assistant",
  description: "Medical assistant",
  icons: [window.location.origin + "/logo192.png"],
  url: window.location.origin,
};

const walletConnectProjectId = "0a284adf3b261085a406950d03c4ef31";

let state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
let pairingData: SessionData | null;
let hashconnect: HashConnect;

export const initHashConnect = async () => {
  console.log("open modal");
  await hashconnect.openPairingModal();
  console.log("after modal");
};

/**
 * Register basic event handlers — no React context access here.
 */
function setUpHashConnectEvents() {
  hashconnect.pairingEvent.on((newPairing) => {
    pairingData = newPairing;
    console.log("📡 New pairing:", pairingData);
    refreshEvent.emit("sync");
  });

  hashconnect.disconnectionEvent.on((data) => {
    console.log("🛑 Disconnected:", data);
    pairingData = null;

    refreshEvent.emit("sync");
  });

  hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
    state = connectionStatus;
    console.log("🔁 Status:", connectionStatus);
  });
}

/**
 * React component that syncs context with HashConnect state
 */
export const HashConnectClient = () => {
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  const syncWithContext = useCallback(() => {
    console.log("wallet refresh: " + pairingData);
    const id = pairingData?.accountIds?.[0];
    if (id) {
      setAccountId(id);
      setIsConnected(true);
    } else {
      saveSession({
        accountId: "",
        privateKey: "",
        topicId: "",
      });
      setAccountId("");
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    // Attach sync on event
    refreshEvent.addListener("sync", syncWithContext);
    return () => {
      refreshEvent.removeListener("sync", syncWithContext);
    };
  }, [syncWithContext]);
  useEffect(() => {
    const init = async () => {
      console.log("start hashhhhhhh");
      if (hashconnect) return;

      hashconnect = new HashConnect(
        LedgerId.TESTNET,
        walletConnectProjectId,
        appMetadata,
        true
      );
      await setUpHashConnectEvents();
      console.log("hash init start " + typeof window);
      if (typeof window === "undefined") return;
      console.log("non");
      await hashconnect.init();

      console.log("hash init end");
    };

    init();
  }, []);

  return null;
};
