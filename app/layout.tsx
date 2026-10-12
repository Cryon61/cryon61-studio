import type { Metadata } from "next";
import "./globals.css";

const base = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: "CRYON61 STUDIO — BUILD. CREATE. SELL.", template: "%s | CRYON61 STUDIO" },
  description: "Premium Roblox assets, systems, scripts and digital resources for creators.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    siteName: "CRYON61 STUDIO",
    title: "CRYON61 STUDIO — BUILD. CREATE. SELL.",
    description: "Premium Roblox assets, systems, scripts and digital resources for creators.",
    images: [{ url: "/logo.png" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "CRYON61 STUDIO" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
