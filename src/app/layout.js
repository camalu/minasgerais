import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import { RenavamProvider } from "../contexts/RenavamContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Buscar Renavam - SEF/MG",
  description:
    "Página da SEF-MG para consulta de Renavam: veículo, proprietário, pagamento do IPVA e Taxa de Licenciamento",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <RenavamProvider>{children}</RenavamProvider>
      </body>
    </html>
  );
}
