import "./globals.css";
import Link from "next/link";
import style from "./layout.module.css";
import { BookData } from "@/types";
import Image from "next/image";

async function Footer(){
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`
  );

  if (!response.ok){
    return <footer>books feed</footer>;
  }

  const books: BookData[] = await response.json();
  const bookCount = books.length;

  return <footer>
    <div>books feed</div>
    <div>{bookCount} 개의 도서가 등록되어 있습니다.</div>
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
        <div className={style.container}>
          <header>
            <Link href={"/"}>
              <Image className="logo" src={"/logo3.png"} width={150} height={50} alt={`books feed`}/>
            </Link>
          </header>
          <main>{children}</main>
          {/* <footer>books feed</footer> */}
          <Footer/>
        </div>
      </body>
    </html>
  );
}
