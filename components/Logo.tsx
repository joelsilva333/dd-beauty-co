import Image from "next/image";
import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src="/logos/imagotipo.png"
        alt=""
        fill
        sizes="48px"
        className="object-contain"
      />
    </span>
  );
}

export function Logo({
  className = "",
  markClassName = "h-8 w-8",
  wordmarkClassName = "text-xl",
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex flex-col items-center gap-1.5 text-ink ${className}`}
      aria-label="Deodália Dias — Beauty & Co., ir para a homepage"
    >
      <LogoMark className={markClassName} />
      <span className={`font-display leading-none ${wordmarkClassName}`}>Deodália Dias</span>
      <span className="font-body text-[0.6rem] tracking-wordmark text-taupe uppercase">
        Beauty &amp; Co.
      </span>
    </Link>
  );
}
