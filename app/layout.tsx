import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  const description = "Un espace compact pour gérer clients, fournisseurs, achats, ventes et documents.";

  return {
    title: "Axxam Workspace",
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Axxam Workspace",
      description,
      images: [{ url: imageUrl, width: 1659, height: 948, alt: "Axxam Workspace — Achats, ventes et finance" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Axxam Workspace",
      description,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
