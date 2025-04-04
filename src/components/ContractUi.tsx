import React, { useState, useEffect, useRef } from "react";
import {
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
import NavBar from "./Navbar";
import backgroundImage from "../assets/background.jpg";

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
    <>
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        justifyContent: "center",
        padding: 36,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />
      <header>
        <NavBar />
      </header>
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            maxHeight: "calc(100vh)",
            height: "fit-content",
            boxSizing: "border-box",
          }}
          p={2}
          style={{ justifyContent: "center", zIndex: 2 }}
        >
          {/* Chat history window */}
          <Paper
            elevation={3}

            style={{
              height: "fit-content",
              padding: "16px",
              overflowY: "auto",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
          >
            <List>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  alignItems="flex-start"
                  style={{
                    justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
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
                      backgroundColor: message.sender === "user" ? "rgba(0, 242, 255, 0.6)" : "#e0e0e0",
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
                        src="/user-avatar.png" />
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
              placeholder="Enter your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              multiline
              rows={isExpanded ? 4 : 1}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => {
                if (input.trim() === "") setIsExpanded(false);
              } }
              sx={{
                transition: "all 0.3s ease",
              }} />
            <Button
              variant="outlined"
              style={{
                marginLeft: "8px",
                maxHeight: "40px",
                display: "flex",
                alignSelf: "center",
              }}
              sx={{
                color: "rgb(255, 255, 255)",
                borderColor: "rgb(255, 255, 255)",
                "&:hover": {
                  backgroundColor: "rgba(33, 53, 71, 0.4)",
                  color: "rgba(134, 249, 254, 0.6)",
                  borderColor: "rgb(134, 249, 254, 0.6)",
              },

              }}
              onClick={handleSendMessage}
            >
              Send
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
      </div></>
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
