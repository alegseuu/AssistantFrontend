import { Button, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.jpg";
import { initHashConnect } from "../services/wallets/walletconnect/walletConnectClient";

export default function Login() {
  const [open, setOpen] = useState(false);
  const { accountId} = useWalletInterface();
  const navigate = useNavigate();

  useEffect(() => {
    if (accountId) {
      setOpen(false);
      navigate("/interview");
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
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust transparency here
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
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              color: "rgba(134, 249, 254, 0.6)",
              borderColor: "rgb(134, 249, 254, 0.6)",
            },

          }}
          onClick={() => {
            initHashConnect();
            setOpen(false);
                    }}
        >
          {accountId ? `Connected: ${accountId}` : "Login using wallet"}
        </Button>
      </Box>
    </Box>
  );
}