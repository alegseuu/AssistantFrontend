import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider } from "@mui/material";
import { AllWalletsProvider } from "./services/wallets/AllWalletsProvider";


import { theme } from "./theme";

import ContractUi from "./components/ContractUi";
import Login from "./components/login";
import MedicalInterview from "./components/MedicalInterview";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AllWalletsProvider>
        <CssBaseline />
        <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            backgroundColor: "#222222",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<ContractUi/>} />
              <Route path="/interview" element={<MedicalInterview/>} />
            </Routes>
        </Box>
      </Router>
      </AllWalletsProvider>
    </ThemeProvider>
  );
}

export default App;