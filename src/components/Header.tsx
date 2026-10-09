"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { NAV, SITE } from "@/config/site";
import { OrderButton } from "./OrderButton";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <div className="wrap nav">
        <Link className="brand" href="/" aria-label={`${SITE.name} home`}>
          <Image src="/img/lvt-logo.svg" alt="" width={64} height={64} priority />
          <span>
            <b>{SITE.name}</b>
            <small>Est. {SITE.established}</small>
          </span>
        </Link>
        <nav className="links" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <OrderButton location="header" className="btn-sm">Order Online</OrderButton>
        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobileMenu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span />
        </button>
      </div>
      <div className="mobile-menu" id="mobileMenu" hidden={!open}>
        <div className="wrap">
          {NAV.map((n) => (
            <Link key={n.href} className="ml" href={n.href} onClick={() => setOpen(false)}>{n.mobile}</Link>
          ))}
          <OrderButton location="mobile_menu">Order Online for Pickup</OrderButton>
        </div>
      </div>
    </header>
  );
}
