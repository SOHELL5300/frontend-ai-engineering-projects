import "./globals.css";

export const metadata = {
  title: "AI Meeting Notes Generator",
  description:
    "Generate meeting summaries, action items, decisions, risks, and follow-up questions using AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}