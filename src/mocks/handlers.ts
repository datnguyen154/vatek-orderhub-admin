/**
 * OrderHub Admin Console — MSW Request Handlers
 *
 * Intercepts GET /api/orders in the browser worker and provides reproducible scenarios:
 * - "success": returns full deterministic fixtures list
 * - "empty": returns empty list ({ data: [], total: 0 })
 * - "error": returns HTTP 500 error response
 * - "delay": simulates 1500ms network latency before returning fixtures
 */

import { http, HttpResponse, delay, passthrough } from "msw";
import { mockOrders } from "./data/orders";

export type MockScenario = "success" | "delay" | "empty" | "error" | "disabled";

export const handlers = [
  http.get("/api/orders", async ({ request }) => {
    const url = new URL(request.url);

    // Scenario priority resolution:
    // 1. Direct request query parameter (?scenario=...)
    // 2. Request header (x-mock-scenario: ...)
    // 3. Browser active URL query parameter (?scenario=...)
    // 4. LocalStorage override ("orderhub_mock_scenario")
    // 5. Default fallback: "success"
    let scenario: string | null =
      url.searchParams.get("scenario") ||
      request.headers.get("x-mock-scenario");

    if (!scenario && typeof window !== "undefined") {
      try {
        const pageParams = new URLSearchParams(window.location.search);
        scenario =
          pageParams.get("scenario") ||
          window.localStorage?.getItem("orderhub_mock_scenario") ||
          null;
      } catch {
        scenario = null;
      }
    }

    switch (scenario) {
      case "disabled":
      case "mock_disabled":
        // Bypass mock interception and perform real network fetch to test mock-disabled behavior
        return passthrough();

      case "empty":
        return HttpResponse.json(
          {
            data: [],
            total: 0,
          },
          { status: 200 }
        );

      case "error":
        return HttpResponse.json(
          {
            message: "Simulated upstream database connection failure",
          },
          { status: 500 }
        );

      case "delay":
        await delay(1500);
        return HttpResponse.json(
          {
            data: mockOrders,
            total: mockOrders.length,
          },
          { status: 200 }
        );

      case "success":
      default:
        return HttpResponse.json(
          {
            data: mockOrders,
            total: mockOrders.length,
          },
          { status: 200 }
        );
    }
  }),
];
