"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";

const LINKS = [
  { href: "/tasks", label: "Browse tasks" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/leaderboard", label: "Top workers" },
];

export function Navbar() {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur border-b border-black/[0.06]">
      <nav className="max-w-container mx-auto flex items-center justify-between px-lg lg:px-3xl py-lg">
        <div className="flex items-center gap-3xl">
          <Link href="/" className="flex items-center">
            <Image src="/logo-full.png" alt="Tasker" width={168} height={132} className="h-11 w-auto" priority />
          </Link>
          <div className="hidden lg:flex items-center gap-2xl">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-body-md-strong text-ink hover:text-primary-600">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-md">
          {!loading && !user && (
            <>
              <Button href="/login" variant="subtle">
                Log in
              </Button>
              <Button href="/signup" variant="primary">
                Sign up
              </Button>
            </>
          )}
          {!loading && user && (
            <>
              {isAdmin(user) && (
                <Button href="/admin" variant="subtle">
                  Disputes
                </Button>
              )}
              <Button href="/tasks/new" variant="subtle">
                Post a task
              </Button>
              <Link href="/dashboard" className="flex items-center gap-sm pl-sm">
                <Avatar src={user.photo} name={user.name} size={36} />
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-ink" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-black/[0.06] px-lg py-lg flex flex-col gap-lg bg-canvas">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-body-md-strong text-ink" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-sm pt-sm">
            {!loading && !user && (
              <>
                <Button href="/login" variant="subtle" className="w-full">
                  Log in
                </Button>
                <Button href="/signup" variant="primary" className="w-full">
                  Sign up
                </Button>
              </>
            )}
            {!loading && user && (
              <>
                <Button href="/tasks/new" variant="subtle" className="w-full">
                  Post a task
                </Button>
                <Button href="/dashboard" variant="primary" className="w-full">
                  Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
