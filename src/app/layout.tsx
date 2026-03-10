import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "AutoOportunidade | Venda seu carro rápido para lojistas",
  description:
    "Cadastre seu carro gratuitamente e receba propostas de lojistas verificados da sua região. Venda rápida, segura e sem compromisso.",
  openGraph: {
    title: "AutoOportunidade | Venda seu carro rápido para lojistas",
    description:
      "Cadastre seu carro gratuitamente e receba propostas de lojistas verificados da sua região.",
    type: "website",
  },
  keywords: [
    "vender carro",
    "venda rápida",
    "lojistas",
    "propostas",
    "marketplace automotivo",
    "vender veículo",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
