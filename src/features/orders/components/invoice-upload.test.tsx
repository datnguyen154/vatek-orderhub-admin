import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvoiceUpload } from "./invoice-upload";
import * as orderApi from "../api";
import { TestProviders } from "../../../../vitest.setup";
import type { OrderDetail } from "../types";

const orderWithoutInvoice: OrderDetail = {
  id: "ord_001",
  orderCode: "ORD-2026-001",
  customerName: "Acme Logistics Inc.",
  createdAt: "2026-11-06T10:30:00Z",
  total: 1420.0,
  currency: "USD",
  status: "delivered",
  itemCount: 12,
  poNumber: null,
  invoice: null,
  timeline: [],
};

describe("InvoiceUpload", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("shows inline errors and sends no request for a non-PDF file and a file over 5 MB", async () => {
    const uploadSpy = vi.spyOn(orderApi, "uploadInvoice");

    render(
      <TestProviders>
        <InvoiceUpload order={orderWithoutInvoice} role="staff" />
      </TestProviders>
    );

    const fileInput = screen.getByLabelText(/Upload invoice/i);
    const uploadButton = screen.getByRole("button", { name: "Upload" });

    // 1. Non-PDF file
    const invalidFile = new File(["dummy content"], "invoice.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(
      screen.getByText("Only PDF documents are supported")
    ).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();

    // 2. File over 5 MB
    const largeFile = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1024)],
      "huge-invoice.pdf",
      { type: "application/pdf" }
    );
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(
      screen.getByText("File size exceeds the 5 MB limit")
    ).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();

    expect(uploadSpy).not.toHaveBeenCalled();
  });

  it("simulates 500 error on upload, renders error alert, and keeps retry button enabled", async () => {
    const user = userEvent.setup();
    const uploadSpy = vi.spyOn(orderApi, "uploadInvoice").mockRejectedValueOnce(
      new orderApi.UploadError(500, "Internal Server Error", {
        code: "upload_failed",
      })
    );

    render(
      <TestProviders>
        <InvoiceUpload order={orderWithoutInvoice} role="staff" />
      </TestProviders>
    );

    const fileInput = screen.getByLabelText(/Upload invoice/i);
    const validFile = new File(["%PDF-1.4 dummy"], "valid-invoice.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadButton = screen.getByRole("button", { name: "Upload" });
    expect(uploadButton).toBeEnabled();

    await user.click(uploadButton);

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledTimes(1);
    });

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Invoice upload failed. Please try again."
    );

    const retryButton = screen.getByRole("button", { name: "Retry upload" });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toBeEnabled();
  });
});
