"use client"; // (1) 클라이언트 컴포넌트로 전환

import style from "@/components/review-editior.module.css";
import { createReviewAction } from "@/actions/create-review.action";
import { useActionState, useEffect } from "react"; // (2) useActionState (react 19+ 에서만 지원)

export default function ReviewEditor({bookId}: {bookId: string}){
  // (3)
  const [createReviewState, formAction, isPending] = useActionState(
    createReviewAction,
    null
  );

  useEffect(() => {
    if (createReviewState && !createReviewState.status){
      alert(createReviewState.error);
    }
  }, [createReviewState]);

  return (
    <section>
      <form 
        className={style.form_container} 
        // action={createReviewAction} 
        // (4) 
        action={formAction}
      >
        <input name="bookId" value={bookId} hidden readOnly/>
        <textarea disabled={isPending} required name="content" placeholder="리뷰 내용"/>
        <div className={style.submit_container}>
            <input disabled={isPending} required name="author" placeholder="작성자"/>
            <button disabled={isPending} type="submit">
              {isPending ? "..." : "작성하기"}
            </button>
        </div>
      </form>
    </section>
  );
}