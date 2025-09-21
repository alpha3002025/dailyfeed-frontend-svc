import BookItem from "@/components/book-item";
import { BookData } from "@/types";
import { Metadata } from "next";
import { Suspense } from "react";

async function SearchResult({searchParams}: {searchParams: Promise<{q?: string}> }) {
  const params = await searchParams;
  const q = params.q || "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/search?q=${q}`,
    { cache: "force-cache" }
  );
  if (!response.ok){
    return <div>오류가 발생했습니다.</div>
  }

  const books: BookData[] = await response.json();

  return (
    <div>
      {books.map((book) => (
        <BookItem key={book.id} {...book} />
      ))}
    </div>
  );
}

// (1) 적용 불가 - search 페이지는 검색어에 따라 동적으로 생성되기에 정적인 선언으로는 불가
// export const metadata: Metadata = { ... }

// (2)
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {

  const {q} = await searchParams;
  return {
    title: `${q} : 도서 검색`,
    description: `검색어 '${q}'에 대한 검색 결과입니다.`,
    openGraph: {
      title: `${q} : 도서 검색`,
      description: `검색어 '${q}'에 대한 검색 결과입니다.`,
      images: ["/thumbnail.png"],
    }
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";

  return (
    <Suspense key={q} fallback={<div>Loading ...</div>}>
      <SearchResult searchParams={searchParams}/>
    </Suspense>
  )
}
