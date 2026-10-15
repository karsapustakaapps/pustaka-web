import { Star } from "lucide-react";

export function Stars({ value }: { value: number }) {
  return <span className="display-stars" aria-label={`${value} dari 5 bintang`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={18} aria-hidden="true" className={star <= value ? "star-filled" : ""} fill={star <= value ? "currentColor" : "none"} />)}
  </span>;
}
