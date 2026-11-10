/**
 * OrderHub Admin Console — useOrders Hook
 *
 * Encapsulates the async fetch lifecycle for orders data:
 * - Awaits mock provider readiness before dispatching initial fetch
 * - Handles loading, empty, error, and success states
 * - Cancels in-flight requests on unmount or retry using AbortController
 * - Prevents stale responses from overwriting newer state via request sequencing
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getOrders } from "../api";
import type { Order } from "../types";
import { useMock } from "@/components/providers/mock-provider";

export type OrdersFetchStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export interface OrdersState {
  status: OrdersFetchStatus;
  data: Order[];
  total: number;
  errorMessage: string | null;
}

export interface UseOrdersResult {
  state: OrdersState;
  refetch: () => void;
  isReady: boolean;
  mockError: string | null;
}

export function useOrders(scenarioOverride?: string): UseOrdersResult {
  const { isReady, error: mockError } = useMock();
  const [state, setState] = useState<OrdersState>({
    status: "idle",
    data: [],
    total: 0,
    errorMessage: null,
  });

  // Track request sequence to prevent stale responses from replacing newer state
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(async () => {
    // If mock service failed to initialize, set error immediately
    if (mockError) {
      setState({
        status: "error",
        data: [],
        total: 0,
        errorMessage: `Mock service worker failed to start: ${mockError}`,
      });
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = ++requestIdRef.current;
    setState((prev) => ({
      ...prev,
      status: "loading",
      errorMessage: null,
    }));

    // Resolve scenario from override or window URL parameter
    let resolvedScenario = scenarioOverride;
    if (!resolvedScenario && typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        resolvedScenario = params.get("scenario") || undefined;
      } catch {
        resolvedScenario = undefined;
      }
    }

    try {
      const response = await getOrders({
        signal: controller.signal,
        scenario: resolvedScenario,
      });

      // Ignore if a newer request was dispatched while this was pending
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (response.data.length === 0) {
        setState({
          status: "empty",
          data: [],
          total: 0,
          errorMessage: null,
        });
      } else {
        setState({
          status: "success",
          data: response.data,
          total: response.total,
          errorMessage: null,
        });
      }
    } catch (err) {
      // Ignore if a newer request was dispatched or if request was aborted
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError")
      ) {
        return;
      }

      let message = "Unable to load orders. Please try again.";
      if (err instanceof Error) {
        if (err.name === "HttpError") {
          message = `Server returned error (${err.message}).`;
        } else if (err.name === "NetworkError") {
          message = "Network connection failed. Please verify your connection.";
        } else if (err.name === "InvalidPayloadError") {
          message = "Received invalid data structure from API.";
        }
      }

      setState({
        status: "error",
        data: [],
        total: 0,
        errorMessage: message,
      });
    }
  }, [mockError, scenarioOverride]);

  useEffect(() => {
    // Wait until mock provider is initialized before making requests
    if (!isReady) {
      return;
    }

    fetchOrders();

    return () => {
      // Abort in-flight requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isReady, fetchOrders]);

  return {
    state,
    refetch: fetchOrders,
    isReady,
    mockError,
  };
}
