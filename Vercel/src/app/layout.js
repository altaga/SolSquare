
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import dynamic from "next/dynamic";
import { Kanit, Roboto_Flex, Orbitron } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import { OwnerProvider } from "../context/feedContext";
// Add Fonts to NextJS Project

const robotoFlex = Roboto_Flex({ weight: "400", subsets: ["latin"] });

// Add Metadata like Title, Description to Site

export const metadata = {
  title: "Sol Square",
  description: "Created by Team 4",
};

// Disable Render Side Rendering for WalletComponent to avoid hydration error
const WalletComponent = dynamic(() => import("../utils/walletComponent"), {
  ssr: false,
});

// layout is the root of the NextJS App, it's the parent of all pages

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={robotoFlex.className}>
        {
          // App Router Cache Provider, Toast Container and Wallet Component will be available on all pages
        }
        {
          // App Router Cache Provider provides compatibility with Material-UI module
        }
        <AppRouterCacheProvider>
          {
            // Toast Container provides Toast notifications on all pages
          }
          <ToastContainer />
          {
            // Wallet Component is a container for the Solana Wallet Adapter, then you can use it on all pages
          }
          <WalletComponent>
            {
              // Children in this case is the content of the rendered page
            }
            <OwnerProvider>

            <Header />
            {children}
            </OwnerProvider>
          </WalletComponent>
        </AppRouterCacheProvider>
        {
          // This footer appears on all pages
        }
      </body>
    </html>
  );
}
