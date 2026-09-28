import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 6c9 6 14 13 14 20 0 7-6 12-14 12S10 33 10 26c0-7 5-14 14-20Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M12 24c6-4 12-4 18 0M12 24c6 4 12 4 18 0"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
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
