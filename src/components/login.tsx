import { AppBar, Button, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.jpg";
import { openWalletConnectModal } from "../services/wallets/walletconnect/walletConnectClient";

export default function Login() {
  const [open, setOpen] = useState(false);
  const { accountId} = useWalletInterface();
  const navigate = useNavigate();

  useEffect(() => {
    if (accountId) {
      setOpen(false);
      navigate("/home");
    }
  }, [accountId]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(33, 53, 71, 0.8)", // Adjust transparency here
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Typography variant="h6" color="white" align="center" noWrap sx={{ fontSize: '5rem' }}>
          Medical Assistant
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mt: 20,
            fontSize: "1.2rem", // Increase font size
            padding: "1rem 2rem", // Add padding
            minWidth: "100px", // Set a minimum width
            color: "rgb(255, 255, 255)",
            borderColor: "rgb(255, 255, 255)",
            "&:hover": {
            backgroundColor: "rgba(33, 53, 71, 0.4)",
            color: "rgb(255, 255, 255)",
            borderColor: "rgba(33, 53, 71, 1)",
            },

          }}
          onClick={() => {
                      openWalletConnectModal();
                      setOpen(false);
                    }}
        >
          {accountId ? `Connected: ${accountId}` : "Login using wallet"}
        </Button>
      </Box>
    </Box>
  );
}