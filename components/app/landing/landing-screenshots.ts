import type { AppLanding } from "@/content/apps/app-types";

/** Normalize `landing.screenshot` to an array (empty when omitted). */
export function resolveLandingScreenshots(screenshot?: AppLanding["screenshot"]): string[] {
  if (!screenshot) return [];
  return Array.isArray(screenshot) ? screenshot : [screenshot];
}
