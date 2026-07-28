import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const COLUMNS = [
  {
    title: "Tasker",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Browse tasks", href: "/tasks" },
      { label: "Become a worker", href: "/signup" },
      { label: "Top workers", href: "/leaderboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Trust & safety",
    links: [
      { label: "Dispute resolution", href: "/how-it-works#disputes" },
      { label: "Escrow payments", href: "/how-it-works#payments" },
      { label: "Worker verification", href: "/how-it-works#trust" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-primary-900 text-on-dark">
      <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2xl">
          <div className="col-span-2">
            <div className="flex items-center gap-sm">
              <Image src="/logo-mark.png" alt="" width={40} height={40} className="h-9 w-auto" />
              <span className="text-display-sm font-display text-on-dark">Tasker</span>
            </div>
            <p className="text-body-sm text-white/60 mt-lg max-w-xs">
              Sri Lanka&apos;s marketplace for trusted local workers — plumbers, electricians,
              painters, movers and more. Post a task, get bids, get it done.
            </p>
            <div className="flex items-center gap-md mt-xl">
              <a href="#" aria-label="Facebook" className="text-white/70 hover:text-on-dark">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-white/70 hover:text-on-dark">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-on-dark">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-body-md-strong mb-lg">{col.title}</h4>
              <ul className="flex flex-col gap-md">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-body-sm text-white/60 hover:text-on-dark">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-3xl pt-2xl border-t border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg">
          <div className="text-caption text-white/50 space-y-xs">
            <p>Tasker (Pvt) Ltd &middot; Business Reg. No. PV 00123456 &middot; Colombo, Sri Lanka</p>
            <p>
              Contact:{" "}
              <a href="mailto:hello@tasker.lk" className="underline">
                hello@tasker.lk
              </a>{" "}
              &middot; +94 11 234 5678
            </p>
            <p className="max-w-2xl">
              Tasker is a marketplace platform connecting customers with independent workers.
              Tasker is not the employer of workers listed on the platform and is not liable for
              the quality of work performed; see our dispute resolution process for recourse.
            </p>
            <p>
              Map data &copy;{" "}
              <a href="https://www.openstreetmap.org/copyright" className="underline" target="_blank" rel="noreferrer">
                OpenStreetMap
              </a>{" "}
              contributors
            </p>
          </div>
          <p className="text-caption text-white/50 whitespace-nowrap">© 2026 Tasker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
