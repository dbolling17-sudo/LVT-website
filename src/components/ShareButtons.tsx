"use client";
import { useState } from "react";

/** Copy link, Facebook, X and text message. Plain share links, no tracking scripts. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return (
    <div className="share" aria-label="Share this event">
      <button
        type="button"
        className="btn btn-line btn-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            window.prompt("Copy this link:", url);
          }
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a className="btn btn-line btn-sm" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener">Facebook</a>
      <a className="btn btn-line btn-sm" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener">X</a>
      <a className="btn btn-line btn-sm" href={`sms:?&body=${t}%20${u}`}>Text</a>
    </div>
  );
}
