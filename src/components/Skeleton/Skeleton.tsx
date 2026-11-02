import "./Skeleton.css";

// Named sizes map to design tokens in Skeleton.css.
// Width comes from the spacing scale; height matches a `--text-*` line.
interface SkeletonProps {
  width?: "xs" | "sm" | "md" | "lg" | "xl";
  height?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
}

// A single grey placeholder block. Decorative only: the screen-reader
// announcement lives on the surrounding loading region.
export default function Skeleton({ width, height = "base" }: SkeletonProps) {
  let className = `skeleton skeleton--h-${height}`;
  if (width) className += ` skeleton--w-${width}`;

  return <span className={className} aria-hidden="true" />;
}
