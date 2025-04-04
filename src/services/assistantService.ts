import { ethers } from "ethers";
import { decrypt } from "eciesjs";
import { WalletInterface } from "./wallets/walletInterface";
import { MirrorNodeClient } from "./wallets/mirrorNodeClient";
import { appConfig } from "./../config";
import { PrivateKey } from "@hashgraph/sdk";
import { networkConfig } from "../config/networks";
import { loadSession, saveSession } from "./sessionStorage";

interface SessionData {
  privateKey: string;
  publicKey?: string;
  accountId: string;
  topicId: string;
}

interface MessageFormat {
  eventType: string;
  accountId?: string;
  userPublicKey?: string;
  encryptedSessionData?: string;
  text?: string;
}

export class AssistantService {
  private wallet: WalletInterface | null;
  private requestsTopicId: string;
  private backendTopicId: string;
  private resumeTopic: string;
  private mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
  // Klucz prywatny użytkownika, używany do odszyfrowywania danych sesji
  private privateTopic: string;
  // Gdy otrzymamy dane sesji, zapiszemy je lokalnie:
  private sessionData: SessionData | null = null;

  constructor(wallet: WalletInterface | null) {
    this.wallet = wallet;
    this.requestsTopicId = networkConfig.testnet.requestTopic;
    this.backendTopicId = networkConfig.testnet.backendTopic;
    this.resumeTopic = networkConfig.testnet.resumeTopic;
    this.privateTopic = "";
  }

  public async resume(session: SessionData) {
    const data = await this.wallet?.chatHistory(session.topicId);
    console.log(data);
    const filtered = data.filter(
      (msg) => JSON.parse(msg).eventType !== "LISTEN_ENDED"
    );

    if (
      data.length > 0 &&
      JSON.parse(data[data.length - 1]).eventType === "LISTEN_ENDED"
    ) {
      const msgPayload: MessageFormat = {
        eventType: "RESUME_LISTEN",
        accountId: session.accountId,
        text: session.topicId,
      };
      const msgString = JSON.stringify(msgPayload);
      const timestamp = (Date.now() / 1000).toFixed(9);
      console.log(timestamp);
      await this.wallet?.sendTopicMessage(this.resumeTopic, msgString, true);
    }
    console.log(filtered);
    return filtered;
  }

  public async checkIfAccountExists(accountId: string): Promise<boolean> {
    const data = await this.wallet?.chatHistory(this.backendTopicId);
    console.log(data);
    if (!data || data.length === 0) {
      console.warn("❌ Brak wiadomości w historii topicu.");
      return false;
    }
    console.log(data);
    const filtered = data.filter((msg) => {
      try {
        const parsed = JSON.parse(msg);
        console.log(parsed);
        return parsed.user === accountId;
      } catch {
        return false;
      }
    });
    console.log(filtered);
    if (filtered.length > 0) {
      try {
        const lastMessage = JSON.parse(filtered[filtered.length - 1]);
        const loginPrivateKeyObj =
          await this.wallet?.generateDeterministicHederaKey(accountId);
        console.log(loginPrivateKeyObj);
        const sessionData = await this.decryptSessionData(
          lastMessage.encryptedSessionData || "",
          loginPrivateKeyObj.toStringRaw()
        );
        this.sessionData = sessionData;
        console.log("🔑 Decrypted session data:", sessionData);
        this.privateTopic = sessionData.topicId;

        await saveSession({
          accountId: sessionData.accountId,
          privateKey: sessionData.privateKey,
          topicId: sessionData.topicId,
        });
        console.log("set operator");
        await this.wallet?.setOperator(
          sessionData.privateKey,
          sessionData.accountId
        );
      } catch (err) {
        console.error("❌ Błąd przy analizie ostatniej wiadomości:", err);
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * 1. Żądanie utworzenia konta sesyjnego
   *    - wysyłamy wiadomość do requestsTopicId
   *    - czekamy na event "SESSION_ACCOUNT_CREATED" w backendTopicId
   *    - odszyfrowujemy dane konta i zapisujemy w sessionStorage (lub w this.sessionData)
   */
  public async getSessionAccount(accountId: string) {
    if (await this.checkIfAccountExists(accountId)) {
      const session = await loadSession();
      return await this.resume(session);
    }
    const session = await loadSession();
    console.log(session);
    if (session && session.topicId) {
      console.log(this.wallet);
      this.wallet?.setOperator(session.privateKey, session.accountId);
      this.privateTopic = session.topicId;
      console.log("gettinf data");
      return await this.resume(session);
    }

    if (!this.wallet) throw new Error("Wallet interface not available.");
    //const loginPrivateKeyObj =
    //   await this.wallet?.generateDeterministicHederaKey(accountId);
    const loginPrivateKeyObj = await this.wallet.generateDeterministicHederaKey(
      accountId
    );
    const loginPublicKey = loginPrivateKeyObj.publicKey.toStringRaw();

    // 1) Create a JSON-encoded message
    const requestPayload: MessageFormat = {
      eventType: "REQUEST_ACCOUNT",
      accountId,
      userPublicKey: loginPublicKey,
    };

    // 2) Send to requestsTopicId
    const messageString = JSON.stringify(requestPayload);
    const timestamp = (Date.now() / 1000).toFixed(9);
    console.log("fffffffffffffffffffffffffffffffffffffffff");
    console.log(timestamp);
    await this.wallet.sendTopicMessage(
      this.requestsTopicId,
      messageString,
      false
    );
    console.log("📨 Sent request for session account -> requestsTopicId");

    // 3) Subscribe to backendTopicId and wait for "SESSION_ACCOUNT_CREATED" with our userId
    await new Promise<SessionData>((resolve, reject) => {
      // Assuming we have "subscribeTopic(...)" in the wallet.
      this.wallet?.subscribeTopic(
        this.backendTopicId,
        async (decoded: MessageFormat) => {
          try {
            // 4) Decrypt session data
            const sessionData = await this.decryptSessionData(
              decoded.text || "",
              loginPrivateKeyObj.toStringRaw()
            );
            this.sessionData = sessionData;
            console.log("🔑 Decrypted session data:", sessionData);
            this.privateTopic = sessionData.topicId;

            await saveSession({
              accountId: sessionData.accountId,
              privateKey: sessionData.privateKey,
              topicId: sessionData.topicId,
            });
            console.log("set operator");
            await this.wallet?.setOperator(
              sessionData.privateKey,
              sessionData.accountId
            );
            console.log("before resolve");
            resolve(sessionData);
          } catch (err) {
            console.error("❌ Error processing session account creation:", err);
            reject(err);
          }
        },
        timestamp,
        false
      );
    });
  }
  public async sendAndListenInPrivateTopic(
    userMessage: string
  ): Promise<string> {
    if (!this.wallet) throw new Error("Wallet not available.");

    let privateTopicId = this.privateTopic;
    if (!privateTopicId) {
      const session = await loadSession();
      this.wallet?.setOperator(session.privateKey, session.accountId);
      this.privateTopic = session.topicId;
      privateTopicId = this.privateTopic;
      console.log("gettinf data");
      this.resume(session);
    }
    console.log(userMessage);

    console.log(privateTopicId);
    if (!privateTopicId)
      throw new Error("No private topic ID in session data.");
    console.log(userMessage);
    // 1) Wysyłamy wiadomość z eventType="CHAT_MESSAGE" itp.
    const msgPayload: MessageFormat = {
      eventType: "QUESTION_MESSAGE",
      text: userMessage,
    };
    const msgString = JSON.stringify(msgPayload);
    const timestamp = (Date.now() / 1000).toFixed(9);
    console.log(timestamp);
    if (this.sessionData) await this.resume(this.sessionData);
    await this.wallet.sendTopicMessage(privateTopicId, msgString, true);
    console.log(timestamp);
    console.log("📨 Sent user message to private topic:", userMessage);

    // 2) Słuchamy odpowiedzi w prywatnym topiku (tu jednorazowo, do 1. wiadomości):
    return new Promise<string>((resolve, reject) => {
      this.wallet?.subscribeTopic(
        privateTopicId,
        (decoded) => {
          try {
            // Odbieramy wiadomość z backendu

            if (decoded.eventType === "CHAT_RESPONSE") {
              console.log(
                "🤖 Received response in private topic:",
                decoded.text
              );
              resolve(decoded.text || "");
            }
          } catch (err) {
            reject(err);
          }
        },
        timestamp,
        true
      );
    });
  }

  /**
   * Odszyfrowanie danych sesji (kluczy i ID konta) za pomocą klucza prywatnego użytkownika (ECIES).
   */
  private async decryptSessionData(
    encryptedBase64: string,
    key: string
  ): Promise<SessionData> {
    // Convert base64 string to Uint8Array (encrypted data)
    console.log("decrypt key: " + key);
    console.log("decrypt encryptedBase64: " + encryptedBase64);
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0)
    );

    const userPrivKeyBuffer = ethers.getBytes("0x" + key);

    // decrypt z eciesjs jest synchroniczny (nie async), więc:
    const decryptedBuffer = await decrypt(userPrivKeyBuffer, encryptedBytes);
    const jsonString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonString) as SessionData;
  }

  /**
   * Zdeszyfrowanie wiadomości ECIES
   */
}
