import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { useNavigate } from "react-router-dom"; //TODO PRZY ROZŁCZENIU ZMIENIĆ NA /login



export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

  const navigate = useNavigate();
  useEffect(() => {
    if (accountId===null) {
      setOpen(false);
      navigate("/");
    }
  }, [accountId]);

  const handleConnect = async () => {
    if (accountId) {
      walletInterface.disconnect();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId]);

  return (
    <AppBar position="relative">
      <Toolbar>
        <Typography variant="h6" color="white" pl={1} noWrap>
          Medical Assistant
        </Typography>
        <Button
          variant="contained"
          sx={{
            ml: "auto",
          }}
          onClick={handleConnect}
        >
          {accountId ? `Disconnect` : "Connect Wallet"}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
