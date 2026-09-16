"use client";

import { useEffect, useState } from "react";

type CustomerIdentityMenuProps = {
  firstName: string;
  lastName: string;
  clinicName: string;
};

const CORE_AGENDA_URL = "https://www.odentia.co/agenda";

// Same geometry/stroke language as odentia-core's ChevronDownIcon (see
// src/components/shell/icons.tsx) — replicated locally, not shared, since
// Core and Marketplace are separate repos/deployments.
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Mirrors odentia-core's AuthenticatedUserMenu dropdown mechanism (click
// toggle, Escape-to-close, backdrop click-to-close, aria-haspopup/
// aria-expanded/role=menu/menuitem) and its UserAvatar fallback treatment
// (flex size-9 rounded-full bg-primary/10 text-primary) for visual/
// interaction parity — a small local Client Component, not shared code,
// since Core and Marketplace are separate repos.
//
// Only ONE menu action exists here on purpose, not because this is
// unfinished: Core has no single valid "Perfil" destination for every
// customer role (a dentist gets a real route, a plain clinic_admin or an
// assistant get a client-side modal that only exists inside Core's own app
// shell — there is nothing Marketplace could correctly link to), and
// Core's logout is client-side Supabase logic with no cross-app-safe
// endpoint Marketplace could invoke yet (clearing only
// odentia_customer_session would be a false "logged out" state — Core
// would still be authenticated, and the very next SSO round trip would
// silently restore it). Inventing either here would be wrong, not just
// incomplete — see the Marketplace header/customer identity audit.
export function CustomerIdentityMenu({ firstName, lastName, clinicName }: CustomerIdentityMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const displayName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        // Name/clinic text is hidden below sm (see the block itself) — this
        // label keeps the trigger's accessible name complete at every
        // breakpoint, mobile included.
        aria-label={`Menú de ${displayName}, ${clinicName}`}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-foreground/5"
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
        >
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-medium text-foreground">{displayName}</span>
          <span className="block text-xs leading-tight text-muted-foreground">{clinicName}</span>
        </span>
        {/* Deliberately visible at every breakpoint (unlike Core's own
            chevron, which hides below sm) — on mobile the avatar is the
            ONLY other trigger content, so the chevron is what signals
            "this opens a menu" once name/clinic disappear. */}
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {menuOpen && (
        <>
          <div aria-hidden="true" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40" />
          <div
            role="menu"
            className="absolute top-full right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-background p-1.5 shadow-lg"
          >
            <a
              href={CORE_AGENDA_URL}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/80 hover:bg-foreground/5"
            >
              Volver a Odentia
            </a>
          </div>
        </>
      )}
    </div>
  );
}
