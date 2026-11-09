"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalBody,
} from "@/components/ui/modal";

/**
 * Mobile Navigation Drawer
 *
 * Utilizes the approved Radix Dialog Modal primitive for responsive viewports (< lg).
 * - Styled as an edge-anchored side drawer panel on mobile/tablet viewports (< lg)
 * - Uses existing `w-sidebar` dimension token for width consistency with desktop sidebar
 * - Focus containment and trap managed by Radix Dialog
 * - Supports keyboard opening via Enter and Space
 * - Escape key dismisses drawer
 * - Focus automatically returns to trigger hamburger button upon closing via ModalTrigger
 * - Desktop layout remains completely unaffected (trigger hidden on lg+)
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Modal open={open} onOpenChange={setOpen}>
        {/* Drawer trigger button wrapped in ModalTrigger for guaranteed focus restoration */}
        <ModalTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            className="p-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </ModalTrigger>

        {/* Accessible Radix modal navigation drawer anchored to the viewport edge */}
        <ModalContent
          title="Navigation"
          description="OrderHub console navigation"
          size="sm"
          className="fixed inset-y-0 left-0 top-0 bottom-0 h-full w-sidebar max-w-full rounded-none border-y-0 border-l-0 border-r border-border bg-surface shadow-lg"
        >
          <ModalBody className="flex-1 overflow-y-auto px-3 py-4">
            <nav aria-label="Mobile Navigation" className="space-y-1">
              <Link
                href="/orders"
                aria-current="page"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-body-medium font-medium bg-primary-muted text-primary-muted-foreground transition-colors"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>Orders</span>
              </Link>
            </nav>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
