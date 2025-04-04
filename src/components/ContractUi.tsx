import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Box,
  Paper,
} from "@mui/material";
import { HederaContractClient } from "../services/contract/HederaContractClient";
import { AssistantService } from "../services/assistantService";
import { networkConfig } from "../config/networks";
import { useWalletInterface } from "../services/wallets/useWalletInterface";

interface Message {
  id: number;
  sender: "user" | "assistant";
  text: string;
}

const ContractUi: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { accountId, walletInterface } = useWalletInterface();

  const [assistantService, setAssistantService] = useState<AssistantService>(
    new AssistantService(walletInterface)
  );

  const loadHistory = async () => {
    try {
      if (messages.length === 0) {
        const response = await assistantService.getSessionAccount(accountId);
        console.log(response);
        if (response) {
          const parsed = parseChatHistory(response);
          setMessages(parsed);
          console.log(response);
        }
      }
    } catch (err) {
      console.error("❌ Failed to load session and chat history:", err);
    }
  };

  useEffect(() => {
    const service = new AssistantService(walletInterface);
    setAssistantService(service);

    if (!accountId) {
      setMessages([]);
    }
  }, [accountId]);
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input.trim(),
    };

    let updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    let assistantResponse;
    if (typeof accountId === "string") {
      console.log("after account");
      const userMessagesText = newMessage.text;
      assistantResponse = await assistantService.sendAndListenInPrivateTopic(
        userMessagesText
      );
      console.log(assistantResponse);
    }

    if (typeof assistantResponse === "string") {
      const assistantMessage: Message = {
        id: updatedMessages.length + 1,
        sender: "assistant",
        text: assistantResponse,
      };

      updatedMessages = [...updatedMessages, assistantMessage];
      setMessages(updatedMessages);
    } else {
      console.warn("Assistant response was not a string:", assistantResponse);
    }
    setIsExpanded(false);
  };
  const handleLogin = async () => {
    if (accountId) {
      loadHistory();
    }
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 65px)",
        width: "100vw",
        justifyContent: "center",
        padding: 36,
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          maxHeight: "calc(100vh - 85px)",
          height: "fit-content",
          boxSizing: "border-box",
        }}
        p={2}
        style={{ justifyContent: "center" }}
      >
        {/* Chat history window */}
        <Paper
          elevation={3}
          style={{
            height: "fit-content",
            padding: "16px",
            overflowY: "auto",
            justifyContent: "center",
          }}
        >
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                alignItems="flex-start"
                style={{
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                {message.sender === "assistant" && (
                  <ListItemAvatar
                    style={{ display: "flex", alignSelf: "start" }}
                  >
                    <Avatar alt="Asystent" src="/assistant-avatar.png" />
                  </ListItemAvatar>
                )}
                <Paper
                  style={{
                    padding: "8px",
                    backgroundColor:
                      message.sender === "user" ? "#1976d2" : "#e0e0e0",
                    color: message.sender === "user" ? "#fff" : "#000",
                    borderRadius: "8px",
                    maxWidth: "70%",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {message.text}
                  </Typography>
                </Paper>

                {message.sender === "user" && (
                  <ListItemAvatar
                    style={{
                      paddingLeft: 15,
                      display: "flex",
                      alignSelf: "end",
                    }}
                  >
                    <Avatar
                      style={{ display: "flex", alignSelf: "end" }}
                      alt="Ty"
                      src="/user-avatar.png"
                    />
                  </ListItemAvatar>
                )}
              </ListItem>
            ))}
          </List>
          <div ref={messagesEndRef} />
        </Paper>
        {/* Input area and send button */}
        <Box
          mt={2}
          display="flex"
          alignContent="center"
          justifyContent="center"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Wpisz wiadomość..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            multiline
            rows={isExpanded ? 4 : 1}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => {
              if (input.trim() === "") setIsExpanded(false);
            }}
            sx={{
              transition: "all 0.3s ease",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            style={{
              marginLeft: "8px",
              maxHeight: "40px",
              display: "flex",
              alignSelf: "center",
            }}
          >
            Wyślij
          </Button>
          <Button
            variant="contained"
            sx={{
              ml: "auto",
            }}
            onClick={handleLogin}
            disabled={!accountId}
          >
            {"Login/Register"}
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default ContractUi;

function parseChatHistory(rawMessages: string[]): Message[] {
  const parsedMessages: Message[] = [];

  rawMessages.forEach((msgStr, index) => {
    try {
      const obj = JSON.parse(msgStr);

      if (obj.eventType === "QUESTION_MESSAGE") {
        parsedMessages.push({
          id: index + 1,
          sender: "user",
          text: obj.text || "",
        });
      } else if (obj.eventType === "CHAT_RESPONSE") {
        parsedMessages.push({
          id: index + 1,
          sender: "assistant",
          text: obj.text || "",
        });
      }
    } catch (err) {
      console.warn("❌ Failed to parse message string:", msgStr, err);
    }
  });

  return parsedMessages;
}
