"use server";

import { revalidateTag } from "next/cache";

export async function createReviewAction(previousState: any, formData: FormData){
    const bookId = formData.get("bookId")?.toString();
    const content = formData.get("content")?.toString();
    const author = formData.get("author")?.toString();

    if(!bookId || !content || !author){ // (validation) content 값이 비어있거나, author 값이 비어있다면 return
        return {
            status: false,
            error: "리뷰 내용과 작성자를 입력해주세요.",
        };
    }

    try{
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review`,
            {
                method: "POST", 
                body: JSON.stringify({bookId, content, author})
            }
        );

        if (!response.ok){
            throw new Error(response.statusText);
        }
        
        revalidateTag(`review-${bookId}`);
        return {
            status: true,
            error: "",
        }
    }
    catch(err){
        return {
            status: false,
            error: `리뷰 저장에 실패했습니다 : ${err}`
        }
    }
}