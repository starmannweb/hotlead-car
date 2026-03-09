import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider>
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
