import { ReactNode } from "react";
import { WalletConnectContextProvider } from "../../contexts/WalletConnectContext";
import { HashConnectClient } from "./walletconnect/walletConnectClient";

export const AllWalletsProvider = (props: {
  children: ReactNode | undefined;
}) => {
  return (
      <WalletConnectContextProvider>
        <HashConnectClient />
        {props.children}
      </WalletConnectContextProvider>
  );
};
