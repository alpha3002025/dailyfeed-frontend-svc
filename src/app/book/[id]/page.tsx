import { notFound } from "next/navigation";
import style from "./page.module.css";
// import { createReviewAction } from "@/actions/create-review.action";
import { BookData, ReviewData } from "@/types";
import ReviewItem from "@/components/review-item";
import ReviewEditor from "@/components/review-editor";
import Image from "next/image";

export const dynamic = 'force-dynamic';

async function BookDetail({bookId}: {bookId: string}){
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`,
    { next: { tags: [`review-${bookId}`] } }
  );

  if (!response.ok){
    notFound();
  }

  const book = await response.json();

  const {
    id, title, subTitle, description, author, publisher, coverImgUrl
  } = book;

  return (
    <section className={style.container}>
      <div
        className={style.cover_img_container}
        style={{ backgroundImage: `url('${coverImgUrl}')` }}
      >
        {/* <img src={coverImgUrl} /> */}
        <Image src={coverImgUrl} width={240} height={300} alt={`도서 '${title}'의 표지 이미지`}/>
      </div>
      <div className={style.title}>{title}</div>
      <div className={style.subTitle}>{subTitle}</div>
      <div className={style.author}>
        {author} | {publisher}
      </div>
      <div className={style.description}>{description}</div>
    </section>
  );
}

async function ReviewList({ bookId }: { bookId: string }){
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review/book/${bookId}`
  );

  if (!response.ok) {
    throw new Error(`Review fetch error : ${response.statusText}`);
  }

  const reviews: ReviewData[] = await response.json();

  return (
    <section>
      {reviews.map((review) => (
        <ReviewItem key={`review-item-${review.id}`} {...review} />
      ))}
    </section>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${id}`,
    { cache: "force-cache" }
  );

  if (!response.ok){
    throw new Error(response.statusText);
  }

  const book: BookData = await response.json();

  return {
    title: `${book.title} - books feed`,
    description: `${book.description}`,
    openGraph: {
      title: `${book.title} - books feed`,
      description: `${book.description}`,
      images: [book.coverImgUrl],
    }
  }
}

export default async function Page({
  params,
}: {
  // params: { id: string | string[] }; // catch all segment 실습시 사용했던 구문, 
  //                                     // /book/id 에는 필요 없기에 주석처리
  params: Promise<{ id: string }>;
}) {
  const bookParams = await params;
  const bookId = bookParams.id || "";

  return (
    <div className={style.container}>
      <BookDetail bookId={bookId}/>
      <ReviewEditor bookId={bookId}/>
      <ReviewList bookId={bookId}/>
    </div>
  )
}
