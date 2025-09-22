import "./globals.css";
import Link from "next/link";
import style from "./layout.module.css";
import { BookData } from "@/types";
import Image from "next/image";
import { AuthProvider } from "@/contexts/AuthContext";

async function Footer(){
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`
  );

  if (!response.ok){
    return <footer>dailyfeed</footer>;
  }

  const books: BookData[] = await response.json();
  const bookCount = books.length;

  return <footer>
    <div>dailyfeed</div>
    <div>당신의 소중한 일상을 기록하세요</div>
  </footer>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
