"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { getClient } from "@taskhub/data";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Input";

interface RatingFormProps {
  taskId: string;
  ratedById: string;
  ratedUserId: string;
  ratingType: "worker" | "customer";
  onSubmitted?: () => void;
}

export function RatingForm({ taskId, ratedById, ratedUserId, ratingType, onSubmitted }: RatingFormProps) {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await getClient().submitRating({
      taskId,
      ratedById,
      ratedUserId,
      ratingType,
      stars,
      review,
      categories: { communication: stars, professionalism: stars, quality: stars, timeliness: stars },
    });
    setSubmitting(false);
    setDone(true);
    onSubmitted?.();
  }

  if (done) {
    return <p className="text-body-md text-ink">Thanks for the feedback, your review is posted.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div>
        <span className="block text-body-sm-strong text-ink mb-sm">Your rating</span>
        <div className="flex items-center gap-xs">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}>
              <Star size={26} className={n <= stars ? "fill-accent-500 text-accent-500" : "text-canvas-softer"} />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        id="review"
        label="Review"
        placeholder="How did it go?"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
