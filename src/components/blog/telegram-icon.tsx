export function TelegramIcon({ size = 17, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 4L3 11l6 2 2 6 3-4 5 4z" />
      <path d="M9 13l12-9" />
    </svg>
  );
}

/** Visual separator. A "·" next to Persian digits reads as zero (۰), so draw a dot instead. */
export function Dot() {
  return <span aria-hidden className="mx-1.5 inline-block size-[3px] rounded-full bg-current align-middle opacity-60" />;
}
