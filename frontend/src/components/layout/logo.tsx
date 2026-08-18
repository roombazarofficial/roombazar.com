import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/classnames";
import wide from "@/../public/logo/roombazarlogowide.png";
import stacked from "@/../public/logo/roombazarlogo.png";
import mark from "@/../public/logo/roombazaricon.png";
export function Logo({
  variant = "wide",
  height = 32,
  href = "/",
  className,
  priority = true,
}: {
  variant?: "wide" | "stacked" | "mark";
  height?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const source =
    variant === "wide" ? wide : variant === "stacked" ? stacked : mark;

  const width = Math.round((source.width / source.height) * height);

  const image = (
    <Image
      src={source}
      alt="RoomBazar"
      height={height}
      width={width}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height, width }}
    />

  );

  if (href === null) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>

  );
}
