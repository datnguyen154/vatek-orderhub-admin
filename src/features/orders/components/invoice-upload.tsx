/**
 * OrderHub Admin Console — Invoice Upload Component
 *
 * Implements PDF invoice uploading with granular progress tracking:
 * - Shows current invoice metadata to all roles.
 * - Restricts upload controls to roles with `orders:uploadInvoice` (admin, staff).
 * - Enforces client-side validation (application/pdf, <= 5 MB) prior to network request.
 * - Drives accessible progressbar (`role="progressbar"`) via native XMLHttpRequest.
 * - Never announces 100% or marks success before 201 response arrives.
 * - Supports request cancellation via AbortController (`xhr.abort()`).
 * - Accessible status announcements via `aria-live="polite"`.
 */

"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hasPermission, type Role } from "@/features/auth/types";
import type { OrderDetail } from "../types";
import { uploadInvoice, type UploadProgressEvent } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "./orders-table";

export interface InvoiceUploadProps {
  order: OrderDetail;
  role: Role;
}

type UploadStatus = "idle" | "uploading" | "cancelled" | "failed" | "success";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function InvoiceUpload({ order, role }: InvoiceUploadProps) {
  const t = useTranslations("orders.detail.invoice");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const canUpload = hasPermission(role, "orders:uploadInvoice");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setValidationError(null);
      return;
    }

    // Client-side validations
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setSelectedFile(null);
      setValidationError(t("errorType"));
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSelectedFile(null);
      setValidationError(t("errorSize"));
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
    setUploadStatus("idle");
    setProgressPercent(0);
  };

  const handleStartUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setUploadStatus("uploading");
    setProgressPercent(0);
    setLiveAnnouncement(t("liveAnnounceStart"));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await uploadInvoice(order.id, selectedFile, {
        signal: controller.signal,
        onProgress: (event: UploadProgressEvent) => {
          // Never show 100% before the 201 response arrives
          setProgressPercent(Math.min(95, event.percent));
        },
      });

      // 201 Arrived successfully
      setProgressPercent(100);
      setUploadStatus("success");
      setLiveAnnouncement(t("liveAnnounceComplete"));
      toast.success(t("uploadSuccess"));

      // Update query cache and invalidate
      queryClient.setQueryData(
        ["order", order.id],
        (prev: OrderDetail | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            invoice: response.data,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });

      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      if (
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError")
      ) {
        setUploadStatus("cancelled");
        setLiveAnnouncement(t("liveAnnounceCancel"));
        return;
      }

      setUploadStatus("failed");
      setLiveAnnouncement(t("liveAnnounceError"));
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Screen reader live region for polite announcements */}
        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        {/* Existing invoice metadata representation */}
        {order.invoice ? (
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground truncate">
                {order.invoice.fileName}
              </span>
              <span className="text-xs text-muted-foreground shrink-0 font-mono">
                {formatFileSize(order.invoice.size)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {t("uploadedAt")}: {formatDate(order.invoice.uploadedAt, locale)}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noInvoice")}</p>
        )}

        {/* Upload form area */}
        {!canUpload ? (
          <p className="text-sm text-muted-foreground border-t border-border pt-3">
            {t("readOnlyNotice")}
          </p>
        ) : (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <label
                htmlFor="invoice-file-input"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider"
              >
                {t("uploadLabel")}
              </label>

              <input
                ref={fileInputRef}
                id="invoice-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploadStatus === "uploading"}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-md"
              />

              {validationError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-destructive mt-1"
                >
                  {validationError}
                </p>
              )}

              {selectedFile && !validationError && (
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="font-mono">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar during upload */}
            {uploadStatus === "uploading" && (
              <div className="space-y-1.5">
                <style>{`progress { border: revert; }`}</style>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("uploading", { percent: progressPercent })}</span>
                </div>
                <progress
                  value={progressPercent}
                  max={100}
                  aria-label={t("uploading", { percent: progressPercent })}
                  className="w-full h-2 accent-primary"
                >
                  {progressPercent}%
                </progress>
              </div>
            )}

            {/* Cancelled notice */}
            {uploadStatus === "cancelled" && (
              <p className="text-xs font-medium text-muted-foreground">
                {t("uploadCancelled")}
              </p>
            )}

            {/* Inline Error alert with Retry button */}
            {uploadStatus === "failed" && (
              <div
                role="alert"
                className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-destructive-muted text-destructive-muted-foreground text-xs"
              >
                <span>{t("uploadFailed")}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleStartUpload}
                  className="shrink-0"
                >
                  {t("retryButton")}
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {uploadStatus === "uploading" ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelUpload}
                >
                  {t("cancelButton")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleStartUpload}
                  disabled={!selectedFile || !!validationError}
                >
                  {t("uploadButton")}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
