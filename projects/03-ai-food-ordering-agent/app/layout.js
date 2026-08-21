import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "AI Food Ordering Agent",
  description: "Voice-enabled AI food ordering assistant built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}