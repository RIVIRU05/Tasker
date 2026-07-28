import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRating({ value, size = 14, showValue = true, reviewCount }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-xxs text-body-sm-strong text-ink">
      <Star size={size} className="fill-accent-500 text-accent-500" />
      {showValue && <span>{value > 0 ? value.toFixed(1) : "New"}</span>}
      {typeof reviewCount === "number" && (
        <span className="text-mute font-normal">({reviewCount})</span>
      )}
    </span>
  );
}
