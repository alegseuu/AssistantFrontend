import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { WalletSelectionDialog } from "./WalletSelectionDialog";
import { loadHistory } from "./ContractUi";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

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
    <AppBar
      position="absolute"
      sx={{ backgroundColor: "rgba(0, 0, 0, 0.5)"}}
    >
      <Toolbar
      color="default">
        <Typography variant="h6" color="white" pl={1} noWrap>
          Medical Assistant
        </Typography>

        <Button
          variant="outlined"
          sx={{
            ml: "auto",
            fontSize: "1rem", // Increase font size
            minWidth: "100px", // Set a minimum width
            color: "rgb(255, 255, 255)",
            borderColor: "rgb(255, 255, 255)",
            "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "rgba(134, 249, 254, 0.6)",
            borderColor: "rgb(134, 249, 254, 0.6)",
            },

          }}
          onClick={handleConnect}
        >
          {accountId ? `Connected: ${accountId}` : "Connect Wallet"}
        </Button>
      </Toolbar>
      <WalletSelectionDialog
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
      />
    </AppBar>
  );
}
