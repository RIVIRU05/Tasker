"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-container mx-auto px-lg lg:px-3xl py-3xl">
      <div className="grid lg:grid-cols-2 gap-3xl">
        <div>
          <h1 className="text-display-xl font-display text-ink">Get in touch</h1>
          <p className="text-body-md text-body mt-lg max-w-md">
            Questions about a task, a dispute, or partnering with Tasker? We usually reply within
            one business day.
          </p>

          <div className="flex flex-col gap-lg mt-2xl">
            <div className="flex items-center gap-md">
              <span className="w-10 h-10 rounded-full bg-canvas-soft flex items-center justify-center">
                <Mail size={16} />
              </span>
              <div>
                <p className="text-body-md-strong text-ink">Email</p>
                <a href="mailto:hello@tasker.lk" className="text-body-sm text-body">
                  hello@tasker.lk
                </a>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <span className="w-10 h-10 rounded-full bg-canvas-soft flex items-center justify-center">
                <Phone size={16} />
              </span>
              <div>
                <p className="text-body-md-strong text-ink">Phone</p>
                <p className="text-body-sm text-body">+94 11 234 5678</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <span className="w-10 h-10 rounded-full bg-canvas-soft flex items-center justify-center">
                <MapPin size={16} />
              </span>
              <div>
                <p className="text-body-md-strong text-ink">Office</p>
                <p className="text-body-sm text-body">14 Duplication Road, Colombo 04, Sri Lanka</p>
              </div>
            </div>
          </div>
        </div>

        <Card variant="elevated">
          {sent ? (
            <div className="text-center py-2xl">
              <p className="text-display-sm font-display text-ink">Message sent</p>
              <p className="text-body-md text-body mt-sm">We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <form
              className="flex flex-col gap-lg"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Input id="name" label="Name" required placeholder="Your name" />
              <Input id="email" label="Email" type="email" required placeholder="you@example.com" />
              <Textarea id="message" label="Message" required placeholder="How can we help?" />
              <Button type="submit" variant="primary" className="justify-center">
                Send message
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
