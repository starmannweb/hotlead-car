import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venda seu carro rápido | Receba propostas de lojistas",
  description:
    "Cadastre seu carro gratuitamente e receba propostas de lojistas da sua região.",
  openGraph: {
    title: "Venda seu carro rápido | Receba propostas de lojistas",
    description:
      "Cadastre seu carro gratuitamente e receba propostas de lojistas da sua região.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white">{children}</body>
    </html>
  );
}
