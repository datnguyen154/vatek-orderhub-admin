/**
 * OrderHub Admin Console — Browser Mock Service Worker Setup
 *
 * Configures the MSW client worker instance with request handlers.
 * Client-only module using the public msw/browser entry.
 */

import type { SetupWorker } from "msw/browser";
import { handlers } from "./handlers";

export async function initWorker(): Promise<SetupWorker | null> {
  if (typeof window !== "undefined") {
    const { setupWorker } = await import("msw/browser");
    return setupWorker(...handlers);
  }
  return null;
}
