"use client";
import { SITE } from "@/config/site";
import { trackOrderClick } from "@/lib/analytics";

type Props = { location: string; children: React.ReactNode; className?: string; plain?: boolean };

/** Every "Order Online" link on the site. It opens Heartland's ordering page in a new tab; there is no cart here. */
export function OrderButton({ location, children, className = "", plain = false }: Props) {
  const label = typeof children === "string" ? children : "Order Online";
  return (
    <a
      href={SITE.orderUrl}
      target="_blank"
      rel="noopener"
      data-order={location}
      className={plain ? className : `btn btn-order ${className}`}
      aria-label={`${label} (opens our ordering page in a new tab)`}
      onClick={() => trackOrderClick(location)}
    >
      {children}
      {!plain && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      )}
    </a>
  );
}
